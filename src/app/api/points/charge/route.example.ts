import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    // 세션 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { amount, paymentMethod } = body

    // 유효성 검사
    if (!amount || amount < 10000) {
      return NextResponse.json(
        { success: false, error: '최소 충전 금액은 10,000원입니다.' },
        { status: 400 }
      )
    }

    if (!['KAKAO', 'BANK'].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: '올바른 결제 방법을 선택해주세요.' },
        { status: 400 }
      )
    }

    // 트랜잭션 생성
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: 'CHARGE',
        amount,
        status: 'PENDING',
        referenceCode: generateReferenceCode(),
        paymentMethod,
        description: '포인트 충전 요청',
      },
    })

    return NextResponse.json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    console.error('Charge request error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create charge request' },
      { status: 500 }
    )
  }
}
