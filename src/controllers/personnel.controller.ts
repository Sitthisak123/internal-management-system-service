import { Request, Response } from 'express';
import createPrismaClient from '../utils/db.ts'

const prisma = createPrismaClient();

export const getAllPersonnel = async (req: Request, res: Response) => {
  try {
    const personnel = await prisma.personnel.findMany();
    res.json(personnel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPersonnelById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const personnel = await prisma.personnel.findUnique({
      where: { id: Number(id) },
    });
    if (personnel) {
      res.json(personnel);
    } else {
      res.status(404).json({ message: 'Personnel not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createPersonnel = async (req: Request, res: Response) => {
  try {
    const personnel = await prisma.personnel.create({
      data: req.body,
    });
    res.status(201).json(personnel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePersonnel = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const personnel = await prisma.personnel.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(personnel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePersonnel = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.personnel.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
