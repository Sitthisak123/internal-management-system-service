import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../prisma/generated/prisma/client'

export default function createPrismaClient(){
    try {
        const connectionString = process.env.DATABASE_URL!
        const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } })
        const adapter = new PrismaPg(pool)
        const prisma = new PrismaClient({ adapter }) // ⭐ จำเป็นใน v7
        return prisma
    } catch (error) {
        console.error('Failed to create Prisma Client:', error)
    }
    return false
}


