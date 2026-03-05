import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../prisma/generated/prisma/client'

let prismaClient: PrismaClient | null = null;

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
 * Wraps a Prisma database operation in a transaction and injects 
 * the User ID and Note into PostgreSQL session variables for trigger auditing.
 * * @param prismaClient - Your initialized Prisma client instance
 * @param userId - The ID of the user performing the action
 * @param note - An optional note or reason for the action
 * @param operation - A callback containing the Prisma queries to execute
 */
export const withAuditLog = async <T>(
  prismaClient: any, 
  userId: number | string | undefined, 
  note: string, 
  operation: (tx: any) => Promise<T>
): Promise<T> => {
  
  // Safety check in case createPrismaClient returned false
  if (!prismaClient || typeof prismaClient.$transaction !== 'function') {
    throw new Error("Invalid Prisma client provided for auditing.");
  }

  return await prismaClient.$transaction(async (tx: any) => {
    // 1. Inject Context into PostgreSQL
    if (userId) {
      console.log(`Setting audit context for user ID: ${userId}`);
      await tx.$executeRaw`SELECT set_config('app.current_user_id', ${userId.toString()}, true)`;
    }else{
      return console.warn('No user ID provided for auditing context.');
    }
    
    if (note) {
      await tx.$executeRaw`SELECT set_config('app.delete_note', ${note}, true)`;
    }

    // 2. Execute the actual database operation passed in the callback
    return await operation(tx);
  });
};