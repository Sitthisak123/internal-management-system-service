import  { Request, Response } from 'express';
import createPrismaClient, { withUpdateLog } from '../utils/db.js';

const prisma = createPrismaClient();

export const getMaterialTypes = async (req: Request, res: Response) => {
  try {
    const materialTypes = await prisma.material_type.findMany({
      orderBy: { created_at: 'desc' },
    });
    res.json(materialTypes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch material types' });
  }
};

export const getMaterialTypeById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const materialType = await prisma.material_type.findUnique({
      where: { id: Number(id) },
    });
    if (!materialType) {
      return res.status(404).json({ error: 'Material type not found' });
    }
    res.json(materialType);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch material type' });
  }
};

export const createMaterialType = async (req: Request, res: Response) => {
  const { title } = req.body;
  try {
    const newMaterialType = await prisma.material_type.create({
      data: {
        title,
      },
    });
    res.status(201).json(newMaterialType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create material type' });
  }
};

export const updateMaterialType = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;
  const { title } = req.body;
  const note = req.body?.note || 'Material type updated via API';
  try {
    const updatedMaterialType = await withUpdateLog(prisma, userId, note, async (tx) => {
      return tx.material_type.update({
        where: { id: Number(id) },
        data: {
          title,
        },
      });
    });

    res.json(updatedMaterialType);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update material type' });
  }
};

export const deleteMaterialType = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
   await prisma.material_type.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Material type deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete material type' });
  }
};

