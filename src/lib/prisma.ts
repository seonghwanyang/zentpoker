// import { PrismaClient } from '@prisma/client'

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined
// }

// export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 임시 Mock Prisma (DB 연결 전까지 사용)
export const prisma = {
  user: {
    findUnique: async () => null,
    findFirst: async () => null,
    findMany: async () => [],
    create: async () => null,
    update: async () => null,
    upsert: async () => null,
  },
  transaction: {
    findMany: async () => [],
    create: async () => null,
  },
  voucher: {
    findMany: async () => [],
    create: async () => null,
    createMany: async () => null,
  },
  tournament: {
    create: async () => null,
  },
  $disconnect: async () => {},
} as any;