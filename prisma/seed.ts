// prisma/seed.ts
import { PrismaClient, Role, Tier, UserStatus, VoucherType, VoucherStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 시드 데이터 생성 시작...')

  // 관리자 계정 생성
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@zentpoker.com'
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: '관리자',
      role: Role.ADMIN,
      tier: Tier.REGULAR,
      status: UserStatus.ACTIVE,
      points: 1000000, // 테스트용 포인트
    },
  })
  console.log('✅ 관리자 계정 생성:', admin.email)

  // 테스트 사용자들 생성
  const testUsers = [
    {
      email: 'regular@test.com',
      name: '정회원 테스트',
      tier: Tier.REGULAR,
      points: 50000,
    },
    {
      email: 'guest@test.com',
      name: '게스트 테스트',
      tier: Tier.GUEST,
      points: 30000,
    },
    {
      email: 'newuser@test.com',
      name: '신규 회원',
      tier: Tier.GUEST,
      points: 0,
    },
  ]

  for (const userData of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        role: Role.USER,
        status: UserStatus.ACTIVE,
      },
    })
    console.log('✅ 테스트 사용자 생성:', user.email)

    // 각 사용자에게 거래 내역 추가
    if (userData.points > 0) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'CHARGE',
          amount: userData.points,
          status: 'COMPLETED',
          description: '초기 충전 (테스트)',
        },
      })

      // 바인권도 몇 개 추가
      await prisma.voucher.createMany({
        data: [
          {
            userId: user.id,
            type: VoucherType.BUYIN,
            status: VoucherStatus.ACTIVE,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
          },
          {
            userId: user.id,
            type: VoucherType.REBUY,
            status: VoucherStatus.ACTIVE,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        ],
      })
    }
  }

  // 테스트 토너먼트 생성
  const tournament = await prisma.tournament.create({
    data: {
      title: '주말 정기 토너먼트',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2일 후
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
    },
  })
  console.log('✅ 테스트 토너먼트 생성:', tournament.title)

  // 대기 중인 충전 요청 생성 (관리자 테스트용)
  const pendingUser = await prisma.user.findFirst({
    where: { email: 'regular@test.com' },
  })
  
  if (pendingUser) {
    await prisma.transaction.create({
      data: {
        userId: pendingUser.id,
        type: 'CHARGE',
        amount: 100000,
        status: 'PENDING',
        description: '카카오페이 송금 대기 중',
        metadata: {
          referenceCode: 'REF-' + Date.now().toString().slice(-8),
          requestedAt: new Date().toISOString(),
        },
      },
    })
    console.log('✅ 대기 중인 충전 요청 생성')
  }

  console.log('🎉 시드 데이터 생성 완료!')
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 중 오류:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })