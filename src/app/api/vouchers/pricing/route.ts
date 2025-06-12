import { NextResponse } from 'next/server'

// Mock 가격 데이터
const mockPricing = {
  buyIn: {
    regular: 50000,
    guest: 60000,
  },
  reBuy: {
    regular: 30000,
    guest: 36000,
  },
  guestPremium: 20, // 게스트 할증률 (%)
}

export async function GET() {
  try {
    // 실제로는 DB에서 현재 가격 정보 조회
    
    return NextResponse.json({
      success: true,
      data: mockPricing,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pricing' },
      { status: 500 }
    )
  }
}
