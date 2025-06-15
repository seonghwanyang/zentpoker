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
    const { transactionId, action, memo } = body

    // 유효성 검사
    if (!transactionId || !action) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    if (!['CONFIRM', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { success: false, error: '올바른 액션이 아닙니다.' },
        { status: 400 }
      )
    }

    if (action === 'REJECT' && !memo) {
      return NextResponse.json(
        { success: false, error: '거절 사유를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 거래 조회
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true }
    })

    if (!transaction || transaction.type !== 'CHARGE' || transaction.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 거래입니다.' },
        { status: 400 }
      )
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      if (action === 'CONFIRM') {
        // 1. 사용자 포인트 증가
        await tx.user.update({
          where: { id: transaction.userId },
          data: { points: { increment: transaction.amount } }
        })

        // 2. 거래 상태 업데이트
        const updatedTransaction = await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: 'COMPLETED',
            metadata: {
              ...(transaction.metadata as any || {}),
              confirmedBy: admin.id,
              confirmedAt: new Date().toISOString(),
              memo
            }
          }
        })

        return updatedTransaction
      } else {
        // 거래 거절
        const updatedTransaction = await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: 'CANCELLED',
            metadata: {
              ...(transaction.metadata as any || {}),
              rejectedBy: admin.id,
              rejectedAt: new Date().toISOString(),
              rejectReason: memo
            }
          }
        })

        return updatedTransaction
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        transactionId: result.id,
        action,
        memo,
        processedAt: new Date().toISOString(),
        processedBy: session.user.email,
      },
    })
  } catch (error) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process payment confirmation' },
      { status: 500 }
    )
  }
}

// 대기 중인 입금 확인 목록 조회
export async function GET() {
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
      select: { role: true }
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // 대기 중인 충전 요청 조회
    const pendingPayments = await prisma.transaction.findMany({
      where: {
        type: 'CHARGE',
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // 데이터 포맷팅
    const formattedPayments = pendingPayments.map(payment => ({
      id: payment.id,
      userId: payment.user.id,
      userName: payment.user.name || '미입력',
      userEmail: payment.user.email || '',
      amount: payment.amount,
      referenceCode: (payment.metadata as any)?.referenceCode || '',
      paymentMethod: (payment.metadata as any)?.paymentMethod || 'UNKNOWN',
      requestedAt: payment.createdAt.toISOString(),
      status: payment.status,
    }))

    return NextResponse.json({
      success: true,
      data: formattedPayments,
    })
  } catch (error) {
    console.error('Pending payments fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pending payments' },
      { status: 500 }
    )
  }
}
