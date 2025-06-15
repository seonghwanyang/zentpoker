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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const grade = searchParams.get('grade') || 'ALL'
    const status = searchParams.get('status') || 'ALL'

    // 필터 조건 생성
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (grade !== 'ALL') {
      where.tier = grade
    }
    
    if (status !== 'ALL') {
      where.status = status
    }

    // 회원 목록 조회
    const members = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        transactions: {
          select: {
            amount: true,
            type: true,
            status: true
          }
        }
      }
    })

    // 회원 데이터 포맷팅
    const formattedMembers = members.map(member => {
      const deposits = member.transactions
        .filter(t => t.type === 'CHARGE' && t.status === 'COMPLETED')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const used = member.transactions
        .filter(t => t.type === 'VOUCHER_PURCHASE' && t.status === 'COMPLETED')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      return {
        id: member.id,
        name: member.name || '미입력',
        email: member.email || '',
        phone: member.phone || '미입력',
        grade: member.tier,
        status: member.status,
        points: member.points,
        joinedAt: member.createdAt.toISOString().split('T')[0],
        lastLogin: member.lastLoginAt ? member.lastLoginAt.toISOString() : null,
        totalDeposit: deposits,
        totalUsed: used,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        members: formattedMembers,
        total: formattedMembers.length,
      },
    })
  } catch (error) {
    console.error('Members fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}
