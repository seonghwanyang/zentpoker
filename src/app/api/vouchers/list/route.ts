import { NextResponse } from 'next/server'
<<<<<<< HEAD
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
=======

// Mock 바인권 데이터
const mockVouchers = [
  {
    id: '1',
    type: 'BUY_IN',
    status: 'ACTIVE',
    purchasedAt: '2024-12-20T10:30:00',
    expiresAt: '2025-01-20T23:59:59',
    price: 50000,
    isUsed: false,
  },
  {
    id: '2',
    type: 'RE_BUY',
    status: 'ACTIVE',
    purchasedAt: '2024-12-19T15:45:00',
    expiresAt: '2025-01-19T23:59:59',
    price: 30000,
    isUsed: false,
  },
  {
    id: '3',
    type: 'BUY_IN',
    status: 'USED',
    purchasedAt: '2024-12-10T10:00:00',
    expiresAt: '2025-01-10T23:59:59',
    usedAt: '2024-12-15T19:00:00',
    price: 50000,
    isUsed: true,
    tournamentId: 'T001',
    tournamentName: '주말 토너먼트',
  },
  {
    id: '4',
    type: 'RE_BUY',
    status: 'EXPIRED',
    purchasedAt: '2024-11-01T10:00:00',
    expiresAt: '2024-12-01T23:59:59',
    price: 30000,
    isUsed: false,
  },
]

export async function GET() {
  try {
    // 실제로는 세션에서 userId를 가져와서 DB 조회
    
    // 활성 바인권 개수 계산
    const activeVouchers = mockVouchers.filter(v => v.status === 'ACTIVE')
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
    const stats = {
      totalActive: activeVouchers.length,
      buyInCount: activeVouchers.filter(v => v.type === 'BUY_IN').length,
      reBuyCount: activeVouchers.filter(v => v.type === 'RE_BUY').length,
    }

    return NextResponse.json({
      success: true,
      data: {
<<<<<<< HEAD
        vouchers: formattedVouchers,
=======
        vouchers: mockVouchers,
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
        stats,
      },
    })
  } catch (error) {
<<<<<<< HEAD
    console.error('Vouchers fetch error:', error)
=======
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vouchers' },
      { status: 500 }
    )
  }
}
