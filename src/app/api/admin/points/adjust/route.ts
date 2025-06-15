import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 관리자 권한 확인
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, amount, type, description } = body

    // 유효성 검사
    if (!userId || !amount || !type || !description) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    if (!['ADD', 'SUBTRACT'].includes(type)) {
      return NextResponse.json(
        { success: false, error: '올바른 조정 타입이 아닙니다.' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: '금액은 0보다 커야 합니다.' },
        { status: 400 }
      )
    }

    // 대상 사용자 확인
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, points: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 차감 시 잔액 확인
    if (type === 'SUBTRACT' && targetUser.points < amount) {
      return NextResponse.json(
        { success: false, error: '포인트가 부족합니다.' },
        { status: 400 }
      )
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. 포인트 조정
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          points: type === 'ADD' 
            ? { increment: amount }
            : { decrement: amount }
        }
      })

      // 2. 거래 기록 생성
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: 'ADMIN_ADJUSTMENT',
          amount: type === 'ADD' ? amount : -amount,
          status: 'COMPLETED',
          description: `관리자 조정: ${description}`,
          metadata: {
            adjustedBy: admin.id,
            adjustedAt: new Date().toISOString(),
            adjustmentType: type,
            reason: description
          }
        }
      })

      return {
        user: updatedUser,
        transaction
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        userId: result.user.id,
        newBalance: result.user.points,
        transactionId: result.transaction.id,
        adjustedAmount: amount,
        adjustmentType: type,
        processedBy: session.user.email,
        processedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Points adjustment error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to adjust points' },
      { status: 500 }
    )
  }
}
