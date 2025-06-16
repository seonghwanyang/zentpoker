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
      select: { id: true, points: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        balance: user.points,
        lastUpdated: new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error('Balance fetch error:', error)
=======

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
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
    return NextResponse.json(
      { success: false, error: 'Failed to fetch balance' },
      { status: 500 }
    )
  }
}
