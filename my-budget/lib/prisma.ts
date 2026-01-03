// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // เอาออกได้ถ้าไม่อยากเห็น Log SQL รกๆ
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma