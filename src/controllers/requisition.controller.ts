import { Request, Response } from 'express';
import createPrismaClient, { withAuditLog, withUpdateLog } from '../utils/db';

const prisma = createPrismaClient();

// 1. Helper to select safe user fields
const userSelect = {
  id: true,
  fullname: true,
  email: true,
  position: true,
  display_name: true,
};

// 2. Helper to rename the messy Prisma fields to clean ones for the Frontend
const mapToCleanRequisition = (req: any) => {
  return {
    ...req,
    creator: req.users_mr_form_creator_idTousers,       // Rename generated name -> creator
    owner: req.personnel,                               // Rename 'personnel' -> owner
    authorizer: req.users_mr_form_authorizer_idTousers, // Rename generated name -> authorizer

    // Remove the original keys so they don't clutter the response
    users_mr_form_creator_idTousers: undefined,
    personnel: undefined,
    users_mr_form_authorizer_idTousers: undefined,
  };
};

export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    const recentActivities = await prisma.mr_form.findMany({
      orderBy: { created_at: 'desc' },
      take: 4,
      include: {
        users_mr_form_creator_idTousers: { select: userSelect },
        personnel: { select: userSelect }, // FIX: Use 'personnel'
        users_mr_form_authorizer_idTousers: { select: userSelect },
        mr_form_materials: {
          include: { material: true },
        },
      },
    });

    const cleanActivities = recentActivities.map(mapToCleanRequisition);

    res.json({ recentActivities: cleanActivities });
  } catch (error) {
    console.error("Error getting recent activities:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export const getCountFilteredByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const RequisitionsCountByStatus = await prisma.mr_form.count({
      where: { status: Number(status) },
    });

    res.json({ count: RequisitionsCountByStatus });
  } catch (error) {
    console.error("Error getting requisitions count:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFilteredByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const rawRequisitions = await prisma.mr_form.findMany({
      where: { status: Number(status) },
      orderBy: { created_at: 'desc' },
      include: {
        // Correct generated name for Creator
        users_mr_form_creator_idTousers: { select: userSelect },

        // FIX: The schema named this relation 'personnel'
        personnel: { select: userSelect },

        // Correct generated name for Authorizer
        users_mr_form_authorizer_idTousers: { select: userSelect },

        mr_form_materials: {
          include: { material: true },
        },
      },
    });

    // Clean the data before sending
    const cleanRequisitions = rawRequisitions.map(mapToCleanRequisition);

    res.json(cleanRequisitions);
  } catch (error) {
    console.error("Error getting requisitions:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllRequisitions = async (req: Request, res: Response) => {
  try {
    const rawRequisitions = await prisma.mr_form.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        // Correct generated name for Creator
        users_mr_form_creator_idTousers: { select: userSelect },

        // FIX: The schema named this relation 'personnel'
        personnel: { select: userSelect },

        // Correct generated name for Authorizer
        users_mr_form_authorizer_idTousers: { select: userSelect },

        mr_form_materials: {
          include: { material: true },
        },
      },
    });

    // Clean the data before sending
    const cleanRequisitions = rawRequisitions.map(mapToCleanRequisition);

    res.json(cleanRequisitions);
  } catch (error: any) {
    if (error.code === 'P1008') {
      console.error('Database timeout. Please check your database connection string and ensure the database is running.');
      res.status(500).json({ message: 'Database timeout. Please check your database connection string and ensure the database is running.' });
    } else {
      console.error("Error getting requisitions:", error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const getRequisitionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const rawRequisition = await prisma.mr_form.findUnique({
      where: { id: Number(id) },
      include: {
        users_mr_form_creator_idTousers: { select: userSelect },
        personnel: { select: userSelect }, // FIX: Use 'personnel'
        users_mr_form_authorizer_idTousers: { select: userSelect },
        mr_form_materials: {
          include: { material: true },
        },
      },
    });

    if (rawRequisition) {
      res.json(mapToCleanRequisition(rawRequisition));
    } else {
      res.status(404).json({ message: 'Requisition not found' });
    }
  } catch (error) {
    console.error("Error getting requisition by ID:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createRequisition = async (req: Request, res: Response) => {
  const {
    subject,
    description,
    purpose,
    form_date,
    owner_id,
    items
  } = req.body;

  const creator_id = (req as any).user?.id;

  if (!creator_id) {
    return res.status(401).json({ message: "Unauthorized: Creator ID missing" });
  }

  try {
    const ref_no = `MR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Merge items with the same material_id
    const mergedItems = new Map<number, { quantity: number }>();
    for (const item of items) {
      const material_id = Number(item.material_id);
      if (mergedItems.has(material_id)) {
        mergedItems.get(material_id)!.quantity += Number(item.quantity);
      } else {
        mergedItems.set(material_id, { quantity: Number(item.quantity) });
      }
    }

    const requisition = await prisma.mr_form.create({
      data: {
        ref_no,
        subject,
        description,
        purpose,
        form_date: new Date(form_date),
        status: 0,
        owner_id: Number(owner_id),
        creator_id: Number(creator_id),
        mr_form_materials: {
          create: Array.from(mergedItems.entries()).map(([material_id, { quantity }]) => ({
            material_id,
            quantity,
          })),
        },
      },
      include: {
        mr_form_materials: true
      }
    });

    res.status(201).json(requisition);
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error("Error creating requisition: Unique constraint failed. This likely means you are trying to add the same material to the same requisition twice. Please merge the items in your request.", error);
      res.status(400).json({ message: 'Unique constraint failed. Please make sure you are not adding the same material to the same requisition twice.' });
    } else {
      console.error("Error creating requisition:", error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const updateRequisition = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;
  const {
    subject,
    description,
    purpose,
    form_date,
    owner_id,
    status,
    items,
    authorizer_id
  } = req.body;
  const note = req.body?.note || 'Requisition updated via API';

  try {
    const result = await withUpdateLog(prisma, userId, note, async (tx) => {
      // 1. Delete existing materials
      await tx.mr_form_materials.deleteMany({
        where: { mr_form_id: Number(id) },
      });

      // 2. Update form and re-create materials
      const updatedForm = await tx.mr_form.update({
        where: { id: Number(id) },
        data: {
          subject,
          description,
          purpose,
          form_date: form_date ? new Date(form_date) : undefined,
          owner_id: owner_id ? Number(owner_id) : undefined,
          status: status !== undefined ? Number(status) : undefined,
          authorizer_id: authorizer_id ? Number(authorizer_id) : undefined,

          mr_form_materials: {
            create: items.map((item: any) => ({
              material_id: Number(item.material_id),
              quantity: Number(item.quantity),
            })),
          },
        },
        include: {
          mr_form_materials: {
            include: { material: true }
          }
        }
      });

      return updatedForm;
    });

    res.json(result);
  } catch (error) {
    console.error("Error updating requisition:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteRequisition = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;
  const note = req.body?.note || 'MR Form deleted via API';

  try {
    await withAuditLog(prisma, userId, note, async (tx) => {
      await tx.mr_form.delete({
        where: { id: Number(id) },
      });
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting requisition:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRequisitionVolume = async (req: Request, res: Response) => {
  try {
    const { months } = req.query;
    const monthlyData = [];
    let monthOffsets = [0, 1, 2, 3]; // Default to last 4 months
    if (months && typeof months === 'string') {
      monthOffsets = months.split(',').map(m => Math.abs(parseInt(m, 10))).filter(m => !isNaN(m));
    }
    const today = new Date();
    for (const offset of monthOffsets) {
      const targetMonth = new Date(today.getFullYear(), today.getMonth() - offset, 1);
      const monthName = targetMonth.toLocaleString('default', { month: 'short' });
      const startDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
      const endDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
      const count = await prisma.mr_form.count({
        where: {
          created_at: {
            gte: startDate,
            lt: endDate,
          },
        },
      });
      monthlyData.push({ name: monthName, value: count });
    }
    res.json(monthlyData.reverse()); // To have the oldest month first
  } catch (error) {
    console.error("Error getting requisition volume:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const evaluateForm = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, authorizer_id } = req.body;
  const userId = (req as any).user?.id;
  const note = req.body?.note || 'Requisition evaluated via API';
  const numericStatus = Number(status);

  try {
    const result = await withUpdateLog(prisma, userId, note, async (tx) => {
      // 1. Get the original requisition with its materials
      const originalForm = await tx.mr_form.findUnique({
        where: { id: Number(id) },
        include: {
          mr_form_materials: true,
        },
      });

      if (!originalForm) {
        throw new Error('Requisition not found');
      }

      // 2. Update the form status and authorizer
      const updatedForm = await tx.mr_form.update({
        where: { id: Number(id) },
        data: {
          status: numericStatus,
          authorizer_id: Number(authorizer_id),
          evaluated_at: new Date(),
        },
      });

      // 3. If status is approved (1), update material quantities
      if (numericStatus === 1 && originalForm.mr_form_materials.length > 0) {
        for (const item of originalForm.mr_form_materials) {
          const material = await tx.material.findUnique({
            where: { id: item.material_id },
          });

          if (!material) {
            throw new Error(`Material with ID ${item.material_id} not found`);
          }

          if (material.quantity < item.quantity) {
            throw new Error(`Not enough stock for material: ${material.title}`);
          }

          await tx.material.update({
            where: { id: item.material_id },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      return updatedForm;
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error evaluating requisition:", error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};




