import { prisma } from '@/lib/prisma'
import { UserWhereInput } from '@/types/prisma'
import {
  requireAdmin,
  withErrorHandling,
  createSuccessResponse,
  parseSearchParams,
} from '@/lib/api/middleware'

export const GET = withErrorHandling(async (request: Request) => {
  await requireAdmin()
  
  const { search, status, page, limit, skip, sortBy, sortOrder } = parseSearchParams(request)
  const { searchParams } = new URL(request.url)
  const grade = searchParams.get('grade') || 'ALL'

  // 필터 조건 생성
  const where: UserWhereInput = {}
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } }
    ]
  }
  
  if (grade !== 'ALL') {
    where.tier = grade
  }
  
  if (status && status !== 'ALL') {
    where.status = status
  }

  // 전체 회원 수 조회
  const total = await prisma.user.count({ where })

  // 회원 목록 조회
  const members = await prisma.user.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    skip,
    take: limit,
    include: {
      transactions: {
        select: {
          amount: true,
          type: true,
          status: true
        }
      }
    }
  })

  // 회원 데이터 포맷팅
  const formattedMembers = members.map(member => {
    const deposits = member.transactions
      .filter(t => t.type === 'CHARGE' && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const used = member.transactions
      .filter(t => t.type === 'VOUCHER_PURCHASE' && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return {
      id: member.id,
      name: member.name || '미입력',
      email: member.email || '',
      phone: member.phone || '미입력',
      grade: member.tier,
      status: member.status,
      points: member.points,
      joinedAt: member.createdAt.toISOString().split('T')[0],
      lastLogin: member.lastLoginAt ? member.lastLoginAt.toISOString() : null,
      totalDeposit: deposits,
      totalUsed: used,
    }
  })

  return createSuccessResponse({
    members: formattedMembers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
})