import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import createPrismaClient, { withAuditLog } from '../utils/db'; // Removed .ts extension

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

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare provided password with stored hash
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
