import { material } from './../../prisma/generated/prisma/client';
import { material_type } from './../../prisma/generated/prisma/browser';
import { Request, Response } from 'express';
import createPrismaClient, { withAuditLog } from '../utils/db.ts'

const prisma = createPrismaClient();
function materialTypeToName(materialTypeId: number, materialTypes: material_type[]): string{
  const materialType = materialTypes.find(mt => mt.id === materialTypeId);
  return materialType ? materialType.title : '??';
}


export const getAllMaterials = async (req: Request, res: Response) => {
  try {
    const materials = await prisma.material.findMany({
      include: { material_type: true, },
    });
    res.json(materials);
  } catch (error: any) {
    if (error.code === 'P1008') {
      console.error('Database timeout. Please check your database connection string and ensure the database is running.');
      res.status(500).json({ message: 'Database timeout. Please check your database connection string and ensure the database is running.' });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
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

export const getMaterialDistribution = async (req: Request, res: Response) => {
  try {
    const materialTypes = await prisma.material_type.findMany();
    const count = await prisma.material.groupBy({
      by: ['material_type_id'],
      orderBy: {
        material_type_id: 'asc',
      },
      _count: {
        id: true,
      },
    });
    const mappedCount = count.map(c => ({
      material_type: materialTypeToName(c.material_type_id, materialTypes),
      count: c._count.id,
    }));

    res.json({ mappedCount });
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
  const userId = (req as any).user?.id;
  const note = req.body?.note || 'Deleted via API';

  try {
    // Use the reusable method!
    await withAuditLog(prisma, userId, note, async (tx) => {
      await tx.material.delete({
        where: { id: Number(id) },
      });
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting material:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
