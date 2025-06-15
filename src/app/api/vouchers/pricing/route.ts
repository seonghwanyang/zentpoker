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

    // 가격 설정 조회 (실제로는 DB에 가격 테이블이 있어야 함)
    // 현재는 하드코딩된 값 사용
    const pricing = {
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
    
    return NextResponse.json({
      success: true,
      data: pricing,
    })
  } catch (error) {
    console.error('Pricing fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pricing' },
      { status: 500 }
    )
  }
}
