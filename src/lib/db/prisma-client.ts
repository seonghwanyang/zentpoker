import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Add connection pool configuration
    // This helps with prepared statement issues
    errorFormat: 'minimal',
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Handle process exit (Prisma 5.0+ compatibility)
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}

// Handle prepared statement errors with automatic reconnection
async function handlePrismaError<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error: any) {
    // Check for prepared statement error
    if (
      error?.code === '26000' ||
      error?.message?.includes('prepared statement') ||
      error?.message?.includes('does not exist')
    ) {
      console.log('Prepared statement error detected, reconnecting...')
      
      // Disconnect and reconnect
      await prisma.$disconnect()
      await prisma.$connect()
      
      // Retry the operation once
      try {
        return await operation()
      } catch (retryError) {
        console.error('Retry failed:', retryError)
        throw retryError
      }
    }
    
    // For other errors, just throw
    throw error
  }
}

export { handlePrismaError }