import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 관리자 권한 확인
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { grade, status } = body

    // 유효성 검사
    if (grade && !['GUEST', 'REGULAR'].includes(grade)) {
      return NextResponse.json(
        { success: false, error: '올바른 회원 등급이 아닙니다.' },
        { status: 400 }
      )
    }

    if (status && !['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: '올바른 상태가 아닙니다.' },
        { status: 400 }
      )
    }

    // 업데이트할 데이터 준비
    const updateData: any = {}
    if (grade) updateData.tier = grade
    if (status) updateData.status = status

    // 회원 정보 업데이트
    const updatedMember = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        tier: true,
        status: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedMember.id,
        name: updatedMember.name,
        email: updatedMember.email,
        grade: updatedMember.tier,
        status: updatedMember.status,
        updatedAt: updatedMember.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Member update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update member' },
      { status: 500 }
    )
  }
}
