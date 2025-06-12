import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
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

    // 실제로는 트랜잭션으로 처리
    // 1. Transaction 상태 업데이트
    // 2. CONFIRM인 경우 User 포인트 증가
    // 3. 로그 기록

    const result = {
      transactionId,
      action,
      memo,
      processedAt: new Date().toISOString(),
      processedBy: 'admin@zentpoker.com', // 실제로는 세션에서 가져옴
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process payment confirmation' },
      { status: 500 }
    )
  }
}

// 대기 중인 입금 확인 목록 조회
export async function GET() {
  try {
    // Mock 데이터
    const pendingPayments = [
      {
        id: '1',
        userId: '1',
        userName: '김철수',
        userEmail: 'kim@example.com',
        amount: 100000,
        referenceCode: 'ZP-2024-1220-001',
        paymentMethod: 'KAKAO',
        requestedAt: '2024-12-20T09:30:00',
        status: 'PENDING',
      },
      {
        id: '2',
        userId: '2',
        userName: '이영희',
        userEmail: 'lee@example.com',
        amount: 50000,
        referenceCode: 'ZP-2024-1220-002',
        paymentMethod: 'BANK',
        requestedAt: '2024-12-20T10:15:00',
        status: 'PENDING',
      },
    ]

    return NextResponse.json({
      success: true,
      data: pendingPayments,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pending payments' },
      { status: 500 }
    )
  }
}
