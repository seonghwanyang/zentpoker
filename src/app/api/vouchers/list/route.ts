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

    // 바인권 조회
    const vouchers = await prisma.voucher.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        tournament: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    })

    // 바인권 데이터 변환
    const formattedVouchers = vouchers.map(voucher => ({
      id: voucher.id,
      type: voucher.type === 'BUYIN' ? 'BUY_IN' : 'RE_BUY',
      status: voucher.status,
      purchasedAt: voucher.createdAt.toISOString(),
      expiresAt: voucher.expiresAt ? voucher.expiresAt.toISOString() : null,
      usedAt: voucher.usedAt ? voucher.usedAt.toISOString() : null,
      price: voucher.type === 'BUYIN' ? 50000 : 30000, // 기본 가격, 실제로는 거래 내역에서 가져와야 함
      isUsed: voucher.status === 'USED',
      tournamentId: voucher.tournamentId,
      tournamentName: voucher.tournament?.title || null,
    }))

    // 활성 바인권 통계
    const activeVouchers = formattedVouchers.filter(v => v.status === 'ACTIVE')
    const stats = {
      totalActive: activeVouchers.length,
      buyInCount: activeVouchers.filter(v => v.type === 'BUY_IN').length,
      reBuyCount: activeVouchers.filter(v => v.type === 'RE_BUY').length,
    }

    return NextResponse.json({
      success: true,
      data: {
        vouchers: formattedVouchers,
        stats,
      },
    })
  } catch (error) {
    console.error('Vouchers fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vouchers' },
      { status: 500 }
    )
  }
}
