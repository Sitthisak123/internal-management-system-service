import { Request, Response } from 'express';
import createPrismaClient from '../utils/db.ts'

const prisma = createPrismaClient();

export const getAllMaterials = async (req: Request, res: Response) => {
  try {
    const materials = await prisma.material.findMany();
    res.json(materials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMaterialById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const material = await prisma.material.findUnique({
      where: { id: Number(id) },
    });
    if (material) {
      res.json(material);
    } else {
      res.status(404).json({ message: 'Material not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createMaterial = async (req: Request, res: Response) => {
  try {
    const material = await prisma.material.create({
      data: req.body,
    });
    res.status(201).json(material);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateMaterial = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const material = await prisma.material.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(material);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteMaterial = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.material.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
