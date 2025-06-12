import { NextResponse } from 'next/server'

// 참조 코드 생성 함수
function generateReferenceCode() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  
  return `ZP-${year}-${month}${day}-${random}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, paymentMethod } = body

    // 유효성 검사
    if (!amount || amount < 10000) {
      return NextResponse.json(
        { success: false, error: '최소 충전 금액은 10,000원입니다.' },
        { status: 400 }
      )
    }

    // 실제로는 DB에 거래 기록 생성
    const transaction = {
      id: Date.now().toString(),
      userId: '1', // 실제로는 세션에서 가져옴
      amount,
      paymentMethod,
      referenceCode: generateReferenceCode(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create charge request' },
      { status: 500 }
    )
  }
}
