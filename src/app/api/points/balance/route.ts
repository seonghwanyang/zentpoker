import { NextResponse } from 'next/server'

// Mock 데이터 - 실제로는 DB에서 조회
const mockBalance = {
  userId: '1',
  balance: 150000,
  lastUpdated: new Date().toISOString(),
}

export async function GET() {
  try {
    // 실제로는 세션에서 userId를 가져와서 DB 조회
    // const session = await getServerSession(authOptions)
    // const balance = await prisma.user.findUnique({ where: { id: session.user.id }})
    
    // Mock 응답
    return NextResponse.json({
      success: true,
      data: mockBalance,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch balance' },
      { status: 500 }
    )
  }
}
