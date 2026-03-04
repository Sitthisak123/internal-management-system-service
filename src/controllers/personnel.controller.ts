import { Request, Response } from 'express';
import createPrismaClient, { withAuditLog } from '../utils/db'; // Removed .ts extension for standard import
import { equal } from 'node:assert';
import { stat } from 'node:fs';

const prisma = createPrismaClient();

export const getAllPersonnel = async (req: Request, res: Response) => {
  try {
    // Now querying 'users' table directly. 
    // We select specific fields to avoid returning the password hash.
    const personnelList = await prisma.users.findMany({
      where: {
        status: { not: -1 },// Filter for personnel (role = -1)
      },
      select: {
        id: true,
        fullname: true,
        position: true,
        email: true,
        display_name: true,
        role: true,
        status: true,
        username: true,
        // hash_pwd: false //critical info // Implicitly excluded
      },
      orderBy: {
        id: 'asc',
      }
    });

    res.json(personnelList);
  } catch (error) {
    console.error("Error fetching personnel:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPersonnelCount = async (req: Request, res: Response) => {
  try {
    const count = await prisma.users.count();
    res.json({ count });
  } catch (error) {
    console.error("Error fetching personnel count:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getPersonnelById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const personnel = await prisma.users.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        fullname: true,
        position: true,
        email: true,
        display_name: true,
        role: true,
        status: true,
        username: true,
        created_at: true,
        updated_at: true
      }
    });

    if (personnel) {
      res.json(personnel);
    } else {
      res.status(404).json({ message: 'Personnel not found' });
    }
  } catch (error) {
    console.error("Error fetching personnel by ID:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPersonnelByStatus = async (req: Request, res: Response) => {
  const { status } = req.params;
  try {
    const personnel = await prisma.users.findMany({
      where: { status: Number(status) },
      select: {
        id: true,
        fullname: true,
        position: true,
        email: false,
        display_name: true,
        role: true,
        status: true,
        username: false,
        created_at: true,
        updated_at: true
      }
    });

    if (personnel) {
      res.json(personnel);
    } else {
      res.status(404).json({ message: 'Personnel not found' });
    }
  } catch (error) {
    console.error("Error fetching personnel by ID:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createPersonnel = async (req: Request, res: Response) => {
  try {
    // NOTE: req.body must now contain all required user fields:
    // email, fullname, position
    console.log("Creating personnel with data:", req.body);
    const personnel = await prisma.users.create({
      data: {
        fullname: req.body.fullname,
        position: req.body.position,
        status: 0, // Default to inactive until further action (e.g., account setup)
        role: -1, // Personnel role
        email: req.body.email || null, // Allow null if email is not provided
      },
      select: {
        id: true,
        fullname: true,
        role: true
      }
    });

    res.status(201).json(personnel);
  } catch (error) {
    console.error("Error creating personnel:", error);
    // Handle unique constraint violations (e.g., duplicate email/username)
    res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
};

export const updatePersonnel = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const personnel = await prisma.users.update({
      where: { id: Number(id) },
      data: req.body,
      select: {
        id: true,
        fullname: true,
        position: true,
        email: true,
        updated_at: true
      }
    });
    res.json(personnel);
  } catch (error) {
    console.error("Error updating personnel:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePersonnel = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id; // Assuming auth middleware sets this
  const note = req.body?.note || 'Deleted via API';
  try {
    // Use the reusable method!
    await withAuditLog(prisma, userId, note, async (tx) => {
      await tx.users.delete({
        where: { id: Number(id) },
      });
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting User:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};