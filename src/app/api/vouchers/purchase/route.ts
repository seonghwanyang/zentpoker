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

    const body = await request.json()
    const { voucherType, quantity = 1 } = body

    // 유효성 검사
    if (!voucherType || !['BUY_IN', 'RE_BUY'].includes(voucherType)) {
      return NextResponse.json(
        { success: false, error: '올바른 바인권 타입을 선택해주세요.' },
        { status: 400 }
      )
    }

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json(
        { success: false, error: '구매 수량은 1개에서 10개 사이여야 합니다.' },
        { status: 400 }
      )
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, tier: true, points: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // 가격 계산
    const prices = {
      BUY_IN: user.tier === 'REGULAR' ? 50000 : 60000,
      RE_BUY: user.tier === 'REGULAR' ? 30000 : 36000,
    }
    
    const unitPrice = prices[voucherType as keyof typeof prices]
    const totalPrice = unitPrice * quantity

    // 포인트 잔액 확인
    if (user.points < totalPrice) {
      return NextResponse.json(
        { success: false, error: '포인트가 부족합니다.' },
        { status: 400 }
      )
    }

    // 트랜잭션으로 구매 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. 포인트 차감
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { points: { decrement: totalPrice } }
      })

      // 2. 바인권 생성
      const voucherPromises = Array.from({ length: quantity }, () =>
        tx.voucher.create({
          data: {
            userId: user.id,
            type: voucherType === 'BUY_IN' ? 'BUYIN' : 'REBUY',
            status: 'ACTIVE',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
          }
        })
      )
      const vouchers = await Promise.all(voucherPromises)

      // 3. 거래 기록 생성
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'VOUCHER_PURCHASE',
          amount: -totalPrice,
          status: 'COMPLETED',
          description: `${voucherType === 'BUY_IN' ? 'Buy-in' : 'Re-buy'} 바인권 ${quantity}개 구매`,
          metadata: {
            voucherType,
            quantity,
            unitPrice,
            voucherIds: vouchers.map(v => v.id)
          }
        }
      })

      return {
        vouchers,
        remainingBalance: updatedUser.points
      }
    })

    // 응답 데이터 포맷팅
    const formattedVouchers = result.vouchers.map(voucher => ({
      id: voucher.id,
      type: voucherType,
      status: voucher.status,
      purchasedAt: voucher.createdAt.toISOString(),
      expiresAt: voucher.expiresAt ? voucher.expiresAt.toISOString() : null,
      price: unitPrice,
    }))

    return NextResponse.json({
      success: true,
      data: {
        vouchers: formattedVouchers,
        totalPrice,
        remainingBalance: result.remainingBalance,
      },
    })
  } catch (error) {
    console.error('Voucher purchase error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to purchase vouchers' },
      { status: 500 }
    )
  }
}
