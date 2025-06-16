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
=======

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
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pricing' },
      { status: 500 }
    )
  }
}
