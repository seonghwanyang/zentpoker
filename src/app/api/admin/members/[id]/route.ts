import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { grade, status } = body

    // 유효성 검사
    if (grade && !['GUEST', 'REGULAR', 'ADMIN'].includes(grade)) {
      return NextResponse.json(
        { success: false, error: '올바른 회원 등급이 아닙니다.' },
        { status: 400 }
      )
    }

    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      return NextResponse.json(
        { success: false, error: '올바른 상태가 아닙니다.' },
        { status: 400 }
      )
    }

    // 실제로는 DB 업데이트
    // const updatedMember = await prisma.user.update({
    //   where: { id: params.id },
    //   data: { grade, status }
    // })

    return NextResponse.json({
      success: true,
      data: {
        id: params.id,
        grade: grade || 'REGULAR',
        status: status || 'ACTIVE',
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update member' },
      { status: 500 }
    )
  }
}
