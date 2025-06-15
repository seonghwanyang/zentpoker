import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'

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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
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

    // 거래 기록 생성
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'CHARGE',
        amount,
        status: 'PENDING',
        description: `${paymentMethod} 충전 신청`,
        metadata: {
          referenceCode: generateReferenceCode(),
          paymentMethod
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: transaction.id,
        userId: user.id,
        amount,
        paymentMethod,
        referenceCode: (transaction.metadata as any).referenceCode,
        status: transaction.status,
        createdAt: transaction.createdAt.toISOString(),
      }
    })
  } catch (error) {
    console.error('Charge request error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create charge request' },
      { status: 500 }
    )
  }
}
