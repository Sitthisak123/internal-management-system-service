import { Request, Response } from 'express';
import createPrismaClient, { withAuditLog, withUpdateLog } from '../utils/db.ts'
import bcrypt from 'bcryptjs';

const prisma = createPrismaClient();

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany({
      orderBy: { created_at: 'desc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        created_by_user: {
          select: {
            id: true,
            display_name: true,
            fullname: true,
            position: true,
            role: true,
            status: true,
          }
        }
      },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { username, password, display_name, fullname, position, email, role, status } = req.body;
  try {
    const hash_pwd = await bcrypt.hash(password, 10);
    const newUser = await prisma.users.create({
      data: {
        username,
        hash_pwd,
        display_name,
        fullname,
        position,
        email,
        role: role || 0,
        status: status || 0,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;
  const { username, display_name, fullname, position, email, role, status, password, workplace_id } = req.body;
  const note = req.body?.note || 'User updated via API';
  try {
    const data: any = {
      username,
      display_name,
      fullname,
      position,
      email,
      role,
      status,
      workplace_id,
    };

    if (password) {
      data.hash_pwd = await bcrypt.hash(password, 10);
    }

    const updatedUser = await withUpdateLog(prisma, userId, note, async (tx) => {
      return tx.users.update({
        where: { id: Number(id) },
        data,
      });
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id; // Get the ID of the user performing the deletion
  console.log(`User ${userId} is attempting to delete user ${id}`);
  const note = req.body?.note || `Deleted user via API`; // Note for the audit log
  try {
    await withAuditLog(prisma, userId, note, async (tx) => {
      await tx.users.delete({
        where: { id: Number(id) },
      });
    });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
