import { Request, Response } from 'express';
import createPrismaClient from '../utils/db.ts'
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
      where: { id: Number(id) },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { username, password, title, fullname, position, email, role, status } = req.body;
  try {
    const hash_pwd = await bcrypt.hash(password, 10);
    const newUser = await prisma.users.create({
      data: {
        username,
        hash_pwd,
        title,
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
  const { username, title, fullname, position, email, role, status, password } = req.body;
  try {
    const data: any = {
      username,
      title,
      fullname,
      position,
      email,
      role,
      status,
    };

    if (password) {
      data.hash_pwd = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.users.update({
      where: { id: Number(id) },
      data,
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.users.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};