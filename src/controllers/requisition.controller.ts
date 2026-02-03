import { Request, Response } from 'express';
import createPrismaClient from '../utils/db.ts'

const prisma = createPrismaClient();

export const getAllRequisitions = async (req: Request, res: Response) => {
  try {
    const requisitions = await prisma.mr_form.findMany({
      include: {
        creator: true,
        owner: true,
        mr_form_materials: {
          include: {
            material: true,
          },
        },
      },
    });
    res.json(requisitions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRequisitionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const requisition = await prisma.mr_form.findUnique({
      where: { id: Number(id) },
      include: {
        creator: true,
        owner: true,
        mr_form_materials: {
          include: {
            material: true,
          },
        },
      },
    });
    if (requisition) {
      res.json(requisition);
    } else {
      res.status(404).json({ message: 'Requisition not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createRequisition = async (req: Request, res: Response) => {
  const { subject, form_date, owner_id, items } = req.body;
  const creator_id = (req as any).user.id;

  try {
    const requisition = await prisma.mr_form.create({
      data: {
        subject,
        form_date,
        owner_id,
        creator_id,
        ref_no: `REQ-${Math.floor(Math.random() * 10000)}`,
        mr_form_materials: {
          create: items.map((item: any) => ({
            material_id: item.material_id,
            quantity: item.quantity,
          })),
        },
      },
    });
    res.status(201).json(requisition);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateRequisition = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { subject, form_date, owner_id, items } = req.body;

  try {
    // First, delete existing materials for the form
    await prisma.mr_form_materials.deleteMany({
      where: { mr_form_id: Number(id) },
    });

    const requisition = await prisma.mr_form.update({
      where: { id: Number(id) },
      data: {
        subject,
        form_date,
        owner_id,
        mr_form_materials: {
          create: items.map((item: any) => ({
            material_id: item.material_id,
            quantity: item.quantity,
          })),
        },
      },
    });
    res.json(requisition);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteRequisition = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.mr_form.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
