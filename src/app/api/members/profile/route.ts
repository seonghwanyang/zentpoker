import { prisma } from '@/lib/prisma'
import { UserUpdateData } from '@/types/prisma'
import {
  requireAuth,
  withErrorHandling,
  createSuccessResponse,
  parseAndValidateBody,
} from '@/lib/api/middleware'
import { profileUpdateSchema } from '@/lib/utils/validation'
import { z } from 'zod'

export const GET = withErrorHandling(async () => {
  const user = await requireAuth()

  // 사용자 정보 조회
  const userWithDetails = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      transactions: {
        select: {
          amount: true,
          type: true,
          status: true
        }
      },
      vouchers: {
        where: { status: 'USED' }
      }
    }
  })

  if (!userWithDetails) {
    throw new Error('User not found')
  }

  // 통계 계산
  const totalDeposit = userWithDetails.transactions
    .filter(t => t.type === 'CHARGE' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalUsed = userWithDetails.transactions
    .filter(t => t.type === 'VOUCHER_PURCHASE' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const tournamentsPlayed = userWithDetails.vouchers.filter(v => v.status === 'USED').length
  const averageBuyIn = tournamentsPlayed > 0 ? Math.round(totalUsed / tournamentsPlayed) : 0

  const profile = {
    id: userWithDetails.id,
    name: userWithDetails.name || '미입력',
    email: userWithDetails.email || '',
    phone: userWithDetails.phone || '미입력',
    grade: userWithDetails.tier,
    status: userWithDetails.status,
    joinedAt: userWithDetails.createdAt.toISOString().split('T')[0],
    lastLogin: userWithDetails.lastLoginAt ? userWithDetails.lastLoginAt.toISOString() : null,
    stats: {
      totalDeposit,
      totalUsed,
      tournamentsPlayed,
      averageBuyIn,
    },
  }
  
  return createSuccessResponse(profile)
})

export const PATCH = withErrorHandling(async (request: Request) => {
  const user = await requireAuth()
  
  // 요청 데이터 검증
  const validationSchema = z.object({
    name: z.string().min(2, '이름은 2자 이상이어야 합니다.').optional(),
    phone: z.string().regex(/^010-\d{4}-\d{4}$/, '올바른 전화번호 형식이 아닙니다.').optional(),
  })
  
  const { name, phone } = await parseAndValidateBody(request, (data) => 
    validationSchema.parse(data)
  )

  // 프로필 업데이트
  const updateData: UserUpdateData = {}
  if (name) updateData.name = name
  if (phone) updateData.phone = phone

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      tier: true,
      status: true,
      createdAt: true,
      lastLoginAt: true
    }
  })

  const profile = {
    id: updatedUser.id,
    name: updatedUser.name || '미입력',
    email: updatedUser.email || '',
    phone: updatedUser.phone || '미입력',
    grade: updatedUser.tier,
    status: updatedUser.status,
    joinedAt: updatedUser.createdAt.toISOString().split('T')[0],
    lastLogin: updatedUser.lastLoginAt ? updatedUser.lastLoginAt.toISOString() : null,
  }

  return createSuccessResponse(profile, '프로필이 업데이트되었습니다.')
})
