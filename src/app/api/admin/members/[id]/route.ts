<<<<<<< HEAD
import { prisma } from '@/lib/prisma'
import { UserUpdateData } from '@/types/prisma'
import {
  requireAdmin,
  withErrorHandling,
  createSuccessResponse,
  parseAndValidateBody,
} from '@/lib/api/middleware'
import { z } from 'zod'

// 회원 정보 업데이트 검증 스키마
const memberUpdateSchema = z.object({
  grade: z.enum(['GUEST', 'REGULAR'], {
    errorMap: () => ({ message: '올바른 회원 등급이 아닙니다.' }),
  }).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED'], {
    errorMap: () => ({ message: '올바른 상태가 아닙니다.' }),
  }).optional(),
})

export const PATCH = withErrorHandling(async (
  request: Request,
  { params }: { params: { id: string } }
) => {
  await requireAdmin()
  
  // 요청 데이터 검증
  const { grade, status } = await parseAndValidateBody(request, (data) =>
    memberUpdateSchema.parse(data)
  )

  // 업데이트할 데이터 준비
  const updateData: UserUpdateData = {}
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

  return createSuccessResponse({
    id: updatedMember.id,
    name: updatedMember.name,
    email: updatedMember.email,
    grade: updatedMember.tier,
    status: updatedMember.status,
    updatedAt: updatedMember.updatedAt.toISOString(),
  }, '회원 정보가 업데이트되었습니다.')
})
=======
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
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
