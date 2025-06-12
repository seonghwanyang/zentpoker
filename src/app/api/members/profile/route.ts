import { NextResponse } from 'next/server'

// Mock 사용자 프로필
const mockProfile = {
  id: '1',
  name: '김철수',
  email: 'kim@example.com',
  phone: '010-1234-5678',
  grade: 'REGULAR',
  status: 'ACTIVE',
  joinedAt: '2024-01-15',
  lastLogin: '2024-12-20T10:30:00',
  stats: {
    totalDeposit: 500000,
    totalUsed: 350000,
    tournamentsPlayed: 12,
    averageBuyIn: 45000,
  },
}

export async function GET() {
  try {
    // 실제로는 세션에서 userId를 가져와서 DB 조회
    
    return NextResponse.json({
      success: true,
      data: mockProfile,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
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

    // 업데이트 처리 (실제로는 DB 업데이트)
    const updatedProfile = {
      ...mockProfile,
      ...(name && { name }),
      ...(phone && { phone }),
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
