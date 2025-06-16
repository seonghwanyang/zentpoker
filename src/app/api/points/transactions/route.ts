import { prisma } from '@/lib/prisma'
import { TransactionWhereInput, TransactionMetadata } from '@/types/prisma'
import {
  requireAuth,
  withErrorHandling,
  createSuccessResponse,
  parsePaginationParams,
} from '@/lib/api/middleware'

export const GET = withErrorHandling(async (request: Request) => {
  const user = await requireAuth()
  const { page, limit, skip } = parsePaginationParams(request)
  
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'ALL'

  // 필터 조건 생성
  const where: TransactionWhereInput = { userId: user.id }
  if (type !== 'ALL') {
    where.type = type as 'CHARGE' | 'WITHDRAWAL' | 'VOUCHER_PURCHASE' | 'TOURNAMENT_ENTRY'
  }

  // 전체 개수 조회
  const total = await prisma.transaction.count({ where })

  // 거래 내역 조회
  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
    select: {
      id: true,
      type: true,
      amount: true,
      status: true,
      description: true,
      metadata: true,
      createdAt: true,
    }
  })

  // 잔액 계산을 위한 누적 합계
  let runningBalance = user.points
  const transactionsWithBalance = transactions.map(transaction => {
    const result = {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      balance: runningBalance,
      description: transaction.description,
      referenceCode: (transaction.metadata as TransactionMetadata)?.referenceCode || null,
      createdAt: transaction.createdAt.toISOString(),
    }
    runningBalance -= transaction.amount
    return result
  })

  return createSuccessResponse({
    transactions: transactionsWithBalance,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
})
