import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../prisma/generated/prisma/client'

let prismaClient: PrismaClient | null = null;
const AUDIT_TRANSACTION_OPTIONS = { maxWait: 10000, timeout: 30000 };

export default function createPrismaClient(): PrismaClient {
    if (prismaClient) {
        return prismaClient;
    }
    
    try {
        const connectionString = process.env.DATABASE_URL
        if (!connectionString) {
            throw new Error('DATABASE_URL is not set. Please check your .env file.');
        }
        console.log(`Connecting to database at ${new URL(connectionString).host}`);
        const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
        const adapter = new PrismaPg(pool)
        prismaClient = new PrismaClient({ adapter }) // ⭐ จำเป็นใน v7
        return prismaClient
    } catch (error) {
        console.error('Failed to create Prisma Client:', error)
        throw error; // Re-throw the error instead of returning false
    }
}

/**
 * Executes a DB operation with session-scoped audit context.
 */
const runWithContext = async <T>(
  prismaClient: any, 
  userId: number | string | undefined, 
  note: string, 
  noteSettingKey: 'app.delete_note' | 'app.update_note',
  operation: (tx: any) => Promise<T>
): Promise<T> => {
  if (!prismaClient || typeof prismaClient.$transaction !== 'function') {
    throw new Error('Invalid Prisma client provided for auditing.');
  }

  return await prismaClient.$transaction(async (tx: any) => {
    if (userId !== undefined && userId !== null) {
      await tx.$executeRaw`SELECT set_config('app.current_user_id', ${userId.toString()}, true)`;
    }

    if (note) {
      await tx.$executeRaw`SELECT set_config(${noteSettingKey}, ${note}, true)`;
    }

    return await operation(tx);
  }, AUDIT_TRANSACTION_OPTIONS);
};

/**
 * Wraps DELETE operations to inject delete audit metadata for DB triggers.
 */
export const withAuditLog = async <T>(
  prismaClient: any,
  userId: number | string | undefined,
  note: string,
  operation: (tx: any) => Promise<T>
): Promise<T> => {
  return runWithContext(prismaClient, userId, note, 'app.delete_note', operation);
};

/**
 * Wraps UPDATE operations to inject update audit metadata for DB triggers.
 */
export const withUpdateLog = async <T>(
  prismaClient: any,
  userId: number | string | undefined,
  note: string,
  operation: (tx: any) => Promise<T>
): Promise<T> => {
  return runWithContext(prismaClient, userId, note, 'app.update_note', operation);
};
