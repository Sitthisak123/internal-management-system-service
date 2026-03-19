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
  const requesterId = Number((req as any).user?.id);
  const requesterRole = Number((req as any).user?.role);
  const {
    username,
    password,
    display_name,
    fullname,
    position,
    email,
    role,
    status,
    workplace_id,
  } = req.body ?? {};

  const parsedRole = Number(role);
  const parsedStatus = status === undefined ? 1 : Number(status);
  const parsedWorkplaceId = workplace_id === undefined || workplace_id === null
    ? null
    : Number(workplace_id);
  const validRoles = [-1, 0, 1];
  const validStatuses = [-1, 0, 1];

  if (!requesterId || Number.isNaN(requesterId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!validRoles.includes(requesterRole)) {
    return res.status(403).json({ error: 'Permission denied' });
  }

  if (typeof fullname !== 'string' || !fullname.trim()) {
    return res.status(400).json({ error: 'fullname is required' });
  }

  if (typeof position !== 'string' || !position.trim()) {
    return res.status(400).json({ error: 'position is required' });
  }

  if (!validRoles.includes(parsedRole)) {
    return res.status(400).json({ error: 'role must be one of -1, 0, 1' });
  }

  if (!validStatuses.includes(parsedStatus)) {
    return res.status(400).json({ error: 'status must be one of -1, 0, 1' });
  }

  if (parsedWorkplaceId !== null && (!Number.isInteger(parsedWorkplaceId) || parsedWorkplaceId <= 0)) {
    return res.status(400).json({ error: 'workplace_id must be a positive integer or null' });
  }

  // Role guard rules from API spec
  if (requesterRole === -1) {
    return res.status(403).json({ error: 'Personnel cannot create users' });
  }
  if (requesterRole === 0 && parsedRole !== -1) {
    return res.status(403).json({ error: 'Admin/User can create only personnel (role -1)' });
  }

  const normalizedUsername = typeof username === 'string' && username.trim() ? username.trim() : null;
  const normalizedEmail = typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
  const normalizedDisplayName = typeof display_name === 'string' && display_name.trim() ? display_name.trim() : null;

  // Login accounts must have credentials and identity fields
  if (parsedRole !== -1) {
    if (!normalizedUsername || !normalizedEmail || !normalizedDisplayName) {
      return res.status(400).json({ error: 'username, email and display_name are required for role 0/1' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'password is required for role 0/1 and must be at least 6 characters' });
    }
  }

  try {
    if (parsedWorkplaceId !== null) {
      const workplace = await prisma.workplace.findUnique({
        where: { id: parsedWorkplaceId },
        select: { id: true },
      });
      if (!workplace) {
        return res.status(400).json({ error: 'workplace_id does not exist' });
      }
    }

    let hash_pwd: string | null = null;
    if (typeof password === 'string' && password.length > 0) {
      hash_pwd = await bcrypt.hash(password, 10);
    }

    const newUser = await prisma.users.create({
      data: {
        username: normalizedUsername,
        hash_pwd,
        display_name: normalizedDisplayName,
        fullname: fullname.trim(),
        position: position.trim(),
        email: normalizedEmail,
        workplace_id: parsedWorkplaceId,
        role: parsedRole,
        status: parsedStatus,
        created_by: requesterId,
      },
      select: {
        id: true,
        username: true,
        display_name: true,
        fullname: true,
        position: true,
        email: true,
        workplace_id: true,
        role: true,
        status: true,
        created_by: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.status(201).json(newUser);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Duplicate value for unique field (fullname, username, or email)' });
    }
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
