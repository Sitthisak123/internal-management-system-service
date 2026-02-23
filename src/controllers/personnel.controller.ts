import { Request, Response } from 'express';
import createPrismaClient from '../utils/db'; // Removed .ts extension for standard import

const prisma = createPrismaClient();

export const getAllPersonnel = async (req: Request, res: Response) => {
  try {
    console.log("Fetching all personnel (users)...");

    // Now querying 'users' table directly. 
    // We select specific fields to avoid returning the password hash.
    const personnelList = await prisma.users.findMany({
      select: {
        id: true,
        fullname: true,
        position: true,
        email: true,
        title: true,
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
        title: true,
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

export const createPersonnel = async (req: Request, res: Response) => {
  try {
    // NOTE: req.body must now contain all required user fields:
    // username, hash_pwd, email, title, fullname, position

    const personnel = await prisma.users.create({
      data: req.body,
      select: {
        id: true,
        fullname: true,
        username: true,
        email: true
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
  try {
    await prisma.users.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting personnel:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};