import { Request, Response } from 'express';
import createPrismaClient, { withAuditLog } from '../utils/db.js';

const prisma = createPrismaClient();

const parseId = (id: string | string[] | undefined): number | null => {
  if (Array.isArray(id) || !id) {
    return null;
  }
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

export const getWorkplaces = async (req: Request, res: Response) => {
  try {
    const workplaces = await prisma.workplace.findMany({
      orderBy: [{ building: 'asc' }, { room: 'asc' }],
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    res.json(workplaces);
  } catch (error) {
    console.error('Failed to fetch workplaces:', error);
    res.status(500).json({ error: 'Failed to fetch workplaces' });
  }
};

export const getWorkplaceById = async (req: Request, res: Response) => {
  const parsedId = parseId(req.params.id);
  if (!parsedId) {
    return res.status(400).json({ error: 'Invalid workplace id' });
  }

  try {
    const workplace = await prisma.workplace.findUnique({
      where: { id: parsedId },
      include: {
        users: {
          select: {
            id: true,
            fullname: true,
            display_name: true,
            position: true,
            status: true,
          },
        },
      },
    });

    if (!workplace) {
      return res.status(404).json({ error: 'Workplace not found' });
    }

    res.json(workplace);
  } catch (error) {
    console.error('Failed to fetch workplace:', error);
    res.status(500).json({ error: 'Failed to fetch workplace' });
  }
};

export const createWorkplace = async (req: Request, res: Response) => {
  const { building, room } = req.body ?? {};

  if (typeof building !== 'string' || !building.trim()) {
    return res.status(400).json({ error: 'building is required' });
  }

  if (room !== undefined && room !== null && typeof room !== 'string') {
    return res.status(400).json({ error: 'room must be a string when provided' });
  }

  try {
    const workplace = await prisma.workplace.create({
      data: {
        building: building.trim(),
        room: typeof room === 'string' && room.trim() ? room.trim() : null,
      },
    });

    res.status(201).json(workplace);
  } catch (error) {
    console.error('Failed to create workplace:', error);
    res.status(500).json({ error: 'Failed to create workplace' });
  }
};

export const updateWorkplace = async (req: Request, res: Response) => {
  const parsedId = parseId(req.params.id);
  if (!parsedId) {
    return res.status(400).json({ error: 'Invalid workplace id' });
  }

  const { building, room } = req.body ?? {};
  const data: { building?: string; room?: string | null } = {};

  if (building !== undefined) {
    if (typeof building !== 'string' || !building.trim()) {
      return res.status(400).json({ error: 'building must be a non-empty string' });
    }
    data.building = building.trim();
  }

  if (room !== undefined) {
    if (room !== null && typeof room !== 'string') {
      return res.status(400).json({ error: 'room must be a string or null' });
    }
    data.room = typeof room === 'string' && room.trim() ? room.trim() : null;
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'No update fields provided' });
  }

  try {
    const workplace = await prisma.workplace.update({
      where: { id: parsedId },
      data,
    });

    res.json(workplace);
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Workplace not found' });
    }
    console.error('Failed to update workplace:', error);
    res.status(500).json({ error: 'Failed to update workplace' });
  }
};

export const deleteWorkplace = async (req: Request, res: Response) => {
  const parsedId = parseId(req.params.id);
  if (!parsedId) {
    return res.status(400).json({ error: 'Invalid workplace id' });
  }

  const userId = (req as any).user?.id;
  const note = req.body?.note || 'Workplace deleted via API';

  try {
    await withAuditLog(prisma, userId, note, async (tx) => {
      await tx.workplace.delete({
        where: { id: parsedId },
      });
    });

    res.status(204).send();
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return res.status(404).json({ error: 'Workplace not found' });
    }
    console.error('Failed to delete workplace:', error);
    res.status(500).json({ error: 'Failed to delete workplace' });
  }
};
