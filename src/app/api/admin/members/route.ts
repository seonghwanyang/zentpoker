import { NextResponse } from 'next/server'

// Mock 회원 목록 데이터
const mockMembers = [
  {
    id: '1',
    name: '김철수',
    email: 'kim@example.com',
    phone: '010-1234-5678',
    grade: 'REGULAR',
    status: 'ACTIVE',
    points: 150000,
    joinedAt: '2024-01-15',
    lastLogin: '2024-12-20T10:30:00',
    totalDeposit: 500000,
    totalUsed: 350000,
  },
  {
    id: '2',
    name: '이영희',
    email: 'lee@example.com',
    phone: '010-2345-6789',
    grade: 'GUEST',
    status: 'ACTIVE',
    points: 50000,
    joinedAt: '2024-03-20',
    lastLogin: '2024-12-19T15:45:00',
    totalDeposit: 100000,
    totalUsed: 50000,
  },
  {
    id: '3',
    name: '박민수',
    email: 'park@example.com',
    phone: '010-3456-7890',
    grade: 'REGULAR',
    status: 'INACTIVE',
    points: 0,
    joinedAt: '2024-02-10',
    lastLogin: '2024-11-30T20:00:00',
    totalDeposit: 300000,
    totalUsed: 300000,
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const grade = searchParams.get('grade') || 'ALL'
    const status = searchParams.get('status') || 'ALL'

    // 필터링
    let filtered = mockMembers
    
    if (search) {
      filtered = filtered.filter(member => 
        member.name.includes(search) ||
        member.email.includes(search) ||
        member.phone.includes(search)
      )
    }
    
    if (grade !== 'ALL') {
      filtered = filtered.filter(member => member.grade === grade)
    }
    
    if (status !== 'ALL') {
      filtered = filtered.filter(member => member.status === status)
    }

    return NextResponse.json({
      success: true,
      data: {
        members: filtered,
        total: filtered.length,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}
