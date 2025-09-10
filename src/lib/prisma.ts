import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a new PrismaClient instance with proper configuration
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// Use singleton pattern for development to prevent too many connections
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Only cache the client in development to avoid connection issues with hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}