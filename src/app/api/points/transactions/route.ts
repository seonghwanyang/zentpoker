<<<<<<< HEAD
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
=======
import { NextResponse } from 'next/server'

// Mock 거래 내역 데이터
const mockTransactions = [
  {
    id: '1',
    type: 'DEPOSIT',
    amount: 100000,
    balance: 250000,
    description: '포인트 충전',
    referenceCode: 'ZP-2024-1220-001',
    createdAt: '2024-12-20T10:30:00',
  },
  {
    id: '2',
    type: 'PURCHASE',
    amount: -50000,
    balance: 200000,
    description: 'Buy-in 바인권 구매',
    createdAt: '2024-12-19T15:45:00',
  },
  {
    id: '3',
    type: 'PURCHASE',
    amount: -30000,
    balance: 170000,
    description: 'Re-buy 바인권 구매',
    createdAt: '2024-12-18T20:00:00',
  },
  {
    id: '4',
    type: 'ADMIN_ADJUST',
    amount: 20000,
    balance: 190000,
    description: '이벤트 보너스 지급',
    createdAt: '2024-12-17T14:30:00',
  },
  {
    id: '5',
    type: 'DEPOSIT',
    amount: 50000,
    balance: 150000,
    description: '포인트 충전',
    referenceCode: 'ZP-2024-1215-002',
    createdAt: '2024-12-15T09:00:00',
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type') || 'ALL'

    // 필터링
    let filtered = mockTransactions
    if (type !== 'ALL') {
      filtered = mockTransactions.filter(t => t.type === type)
    }

    // 페이지네이션
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedData = filtered.slice(start, end)

    return NextResponse.json({
      success: true,
      data: {
        transactions: paginatedData,
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / limit),
        },
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
