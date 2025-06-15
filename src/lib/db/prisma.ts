import { PrismaClient } from '@prisma/client'

// PrismaClient 싱글톤 패턴
// 개발 환경에서 Hot Reload 시 여러 인스턴스 생성 방지

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma
