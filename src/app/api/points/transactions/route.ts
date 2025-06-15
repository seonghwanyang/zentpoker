import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type') || 'ALL'

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // 필터 조건 생성
    const where: any = { userId: user.id }
    if (type !== 'ALL') {
      where.type = type
    }

    // 전체 개수 조회
    const total = await prisma.transaction.count({ where })

    // 거래 내역 조회
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
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
        referenceCode: (transaction.metadata as any)?.referenceCode || null,
        createdAt: transaction.createdAt.toISOString(),
      }
      runningBalance -= transaction.amount
      return result
    })

    return NextResponse.json({
      success: true,
      data: {
        transactions: transactionsWithBalance,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Transactions fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
