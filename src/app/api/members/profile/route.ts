import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        transactions: {
          select: {
            amount: true,
            type: true,
            status: true
          }
        },
        vouchers: {
          where: { status: 'USED' }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // 통계 계산
    const totalDeposit = user.transactions
      .filter(t => t.type === 'CHARGE' && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalUsed = user.transactions
      .filter(t => t.type === 'VOUCHER_PURCHASE' && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const tournamentsPlayed = user.vouchers.filter(v => v.status === 'USED').length
    const averageBuyIn = tournamentsPlayed > 0 ? Math.round(totalUsed / tournamentsPlayed) : 0

    const profile = {
      id: user.id,
      name: user.name || '미입력',
      email: user.email || '',
      phone: user.phone || '미입력',
      grade: user.tier,
      status: user.status,
      joinedAt: user.createdAt.toISOString().split('T')[0],
      lastLogin: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      stats: {
        totalDeposit,
        totalUsed,
        tournamentsPlayed,
        averageBuyIn,
      },
    }
    
    return NextResponse.json({
      success: true,
      data: profile,
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, phone } = body

    // 유효성 검사
    if (name && name.length < 2) {
      return NextResponse.json(
        { success: false, error: '이름은 2자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    if (phone && !/^010-\d{4}-\d{4}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: '올바른 전화번호 형식이 아닙니다.' },
        { status: 400 }
      )
    }

    // 프로필 업데이트
    const updateData: any = {}
    if (name) updateData.name = name
    if (phone) updateData.phone = phone

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        tier: true,
        status: true,
        createdAt: true,
        lastLoginAt: true
      }
    })

    const profile = {
      id: updatedUser.id,
      name: updatedUser.name || '미입력',
      email: updatedUser.email || '',
      phone: updatedUser.phone || '미입력',
      grade: updatedUser.tier,
      status: updatedUser.status,
      joinedAt: updatedUser.createdAt.toISOString().split('T')[0],
      lastLogin: updatedUser.lastLoginAt ? updatedUser.lastLoginAt.toISOString() : null,
    }

    return NextResponse.json({
      success: true,
      data: profile,
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
