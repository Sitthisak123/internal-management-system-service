import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import createPrismaClient, { withUpdateLog } from '../utils/db'; // Removed .ts extension

const prisma = createPrismaClient();

// This interface defines what data is inside the decrypted token
export interface UserPayload {
  id: number;
  username: string;
  role: number; // 0=User, 1=Admin, etc.
  iat?: number;
  exp?: number;
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const loginId = typeof email === 'string' ? email.trim() : '';

  if (!loginId || !password) {
    return res.status(400).json({ message: 'Username/Email and password are required' });
  }

  try {
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { email: { equals: loginId, mode: 'insensitive' } },
          { username: { equals: loginId, mode: 'insensitive' } },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare provided password with stored hash
    if (!user.hash_pwd) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.hash_pwd);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate Token
    // We include id, role, AND username to match your UserPayload interface
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role, 
        username: user.username 
      }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '8h' }
    );

    // Return the token and user info
    res.json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const requester = (req as any).user;
  const requesterId = Number(requester?.id);
  const requesterRole = Number(requester?.role);

  if (!requesterId || Number.isNaN(requesterId)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { target_user_id, current_password, new_password, note } = req.body ?? {};
  const targetUserId = target_user_id ? Number(target_user_id) : requesterId;
  const isSelfReset = targetUserId === requesterId;
  const isSuperAdmin = requesterRole === 1;

  if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
    return res.status(400).json({ message: 'target_user_id must be a positive integer' });
  }

  if (typeof new_password !== 'string' || new_password.length < 6) {
    return res.status(400).json({ message: 'new_password must be at least 6 characters' });
  }

  if (!isSelfReset && !isSuperAdmin) {
    return res.status(403).json({ message: 'Only superAdmin can reset other users passwords' });
  }

  try {
    const targetUser = await prisma.users.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        hash_pwd: true,
      },
    });

    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    if (isSelfReset) {
      if (typeof current_password !== 'string' || current_password.length === 0) {
        return res.status(400).json({ message: 'current_password is required for self reset' });
      }

      if (!targetUser.hash_pwd) {
        return res.status(400).json({ message: 'Current password is not set for this account' });
      }

      const isCurrentPasswordValid = await bcrypt.compare(current_password, targetUser.hash_pwd);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
    }

    const hash_pwd = await bcrypt.hash(new_password, 10);
    const updateNote = note || (
      isSelfReset
        ? 'Password reset by self via API'
        : `Password reset by superAdmin via API for user ${targetUserId}`
    );

    await withUpdateLog(prisma, requesterId, updateNote, async (tx) => {
      await tx.users.update({
        where: { id: targetUserId },
        data: { hash_pwd },
      });
    });

    res.json({
      message: 'Password reset successful',
      target_user_id: targetUserId,
      reset_mode: isSelfReset ? 'self' : 'superAdmin',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    // The middleware attaches the decoded token to (req as any).user
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }

    const user = await prisma.users.findUnique({
      where: { id: Number(userId) },
      // Select only safe fields (exclude hash_pwd)
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        fullname: true,
        position: true,
        display_name: true,
        status: true,
        created_at: true,
        updated_at: true,
        workplace_id: true,
        workplace: {
          select: {
            id: true,
            building: true,
            room: true,
          },
        },
      },
    });


    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
