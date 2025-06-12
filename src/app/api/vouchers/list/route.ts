import { NextResponse } from 'next/server'

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
    const stats = {
      totalActive: activeVouchers.length,
      buyInCount: activeVouchers.filter(v => v.type === 'BUY_IN').length,
      reBuyCount: activeVouchers.filter(v => v.type === 'RE_BUY').length,
    }

    return NextResponse.json({
      success: true,
      data: {
        vouchers: mockVouchers,
        stats,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vouchers' },
      { status: 500 }
    )
  }
}
