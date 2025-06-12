import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
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

    // Mock 사용자 정보 (실제로는 세션에서 가져옴)
    const userGrade = 'REGULAR' // or 'GUEST'
    
    // 가격 계산
    const prices = {
      BUY_IN: userGrade === 'REGULAR' ? 50000 : 60000,
      RE_BUY: userGrade === 'REGULAR' ? 30000 : 36000,
    }
    
    const unitPrice = prices[voucherType as keyof typeof prices]
    const totalPrice = unitPrice * quantity

    // Mock 포인트 잔액 확인 (실제로는 DB에서 조회)
    const currentBalance = 150000
    
    if (currentBalance < totalPrice) {
      return NextResponse.json(
        { success: false, error: '포인트가 부족합니다.' },
        { status: 400 }
      )
    }

    // 구매 처리 (실제로는 트랜잭션으로 처리)
    const purchasedVouchers = Array.from({ length: quantity }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      type: voucherType,
      status: 'ACTIVE',
      purchasedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후
      price: unitPrice,
    }))

    return NextResponse.json({
      success: true,
      data: {
        vouchers: purchasedVouchers,
        totalPrice,
        remainingBalance: currentBalance - totalPrice,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to purchase vouchers' },
      { status: 500 }
    )
  }
}
