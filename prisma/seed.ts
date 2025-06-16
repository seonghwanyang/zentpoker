<<<<<<< HEAD
// prisma/seed.ts
import { PrismaClient, Role, Tier, UserStatus, VoucherType, VoucherStatus } from '@prisma/client'
=======
import { PrismaClient } from '@prisma/client'
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
<<<<<<< HEAD
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
=======
  console.log('🌱 Starting seed...')

  // 기존 데이터 삭제
  await prisma.voucher.deleteMany()
  await prisma.tournament.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.pointLog.deleteMany()
  await prisma.user.deleteMany()

  // 관리자 계정 생성
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@zentpoker.com',
      name: '관리자',
      password: adminPassword,
      phone: '010-0000-0000',
      role: 'ADMIN',
      status: 'ACTIVE',
      points: 0,
    },
  })

  console.log('✅ Created admin user:', admin.email)

  // 테스트 사용자 생성
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'kim@example.com',
        name: '김철수',
        phone: '010-1234-5678',
        role: 'REGULAR',
        status: 'ACTIVE',
        points: 150000,
      },
    }),
    prisma.user.create({
      data: {
        email: 'lee@example.com',
        name: '이영희',
        phone: '010-2345-6789',
        role: 'GUEST',
        status: 'ACTIVE',
        points: 50000,
      },
    }),
    prisma.user.create({
      data: {
        email: 'park@example.com',
        name: '박민수',
        phone: '010-3456-7890',
        role: 'REGULAR',
        status: 'INACTIVE',
        points: 0,
      },
    }),
  ])

  console.log(`✅ Created ${users.length} test users`)

  // 포인트 거래 내역 생성
  const pointLogs = await Promise.all([
    // 김철수 거래 내역
    prisma.pointLog.create({
      data: {
        userId: users[0].id,
        amount: 200000,
        type: 'DEPOSIT',
        balance: 200000,
        description: '포인트 충전',
      },
    }),
    prisma.pointLog.create({
      data: {
        userId: users[0].id,
        amount: -50000,
        type: 'PURCHASE',
        balance: 150000,
        description: 'Buy-in 바인권 구매',
      },
    }),
    // 이영희 거래 내역
    prisma.pointLog.create({
      data: {
        userId: users[1].id,
        amount: 100000,
        type: 'DEPOSIT',
        balance: 100000,
        description: '포인트 충전',
      },
    }),
    prisma.pointLog.create({
      data: {
        userId: users[1].id,
        amount: -50000,
        type: 'PURCHASE',
        balance: 50000,
        description: 'Buy-in 바인권 구매',
      },
    }),
  ])

  console.log(`✅ Created ${pointLogs.length} point logs`)

  // 거래 내역 생성 (충전 요청)
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        userId: users[0].id,
        type: 'CHARGE',
        amount: 100000,
        status: 'PENDING',
        referenceCode: 'ZP-2024-1220-001',
        paymentMethod: 'KAKAO',
        description: '포인트 충전 요청',
      },
    }),
    prisma.transaction.create({
      data: {
        userId: users[1].id,
        type: 'CHARGE',
        amount: 50000,
        status: 'PENDING',
        referenceCode: 'ZP-2024-1220-002',
        paymentMethod: 'BANK',
        description: '포인트 충전 요청',
      },
    }),
  ])

  console.log(`✅ Created ${transactions.length} pending transactions`)

  // 바인권 생성
  const vouchers = await Promise.all([
    // 김철수 바인권
    prisma.voucher.create({
      data: {
        userId: users[0].id,
        type: 'BUY_IN',
        status: 'ACTIVE',
        price: 50000,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
      },
    }),
    prisma.voucher.create({
      data: {
        userId: users[0].id,
        type: 'RE_BUY',
        status: 'ACTIVE',
        price: 30000,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
    // 이영희 바인권
    prisma.voucher.create({
      data: {
        userId: users[1].id,
        type: 'BUY_IN',
        status: 'ACTIVE',
        price: 60000, // 게스트 가격
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
  ])

  console.log(`✅ Created ${vouchers.length} vouchers`)

  // 토너먼트 생성
  const tournament = await prisma.tournament.create({
    data: {
      name: '주말 홀덤 토너먼트',
      description: '매주 토요일 저녁 7시',
      startDate: new Date('2024-12-28T19:00:00'),
      buyIn: 50000,
      status: 'UPCOMING',
      maxPlayers: 50,
    },
  })

  console.log('✅ Created tournament:', tournament.name)

  console.log('🌱 Seed completed successfully!')
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
}

main()
  .catch((e) => {
<<<<<<< HEAD
    console.error('❌ 시드 데이터 생성 중 오류:', e)
=======
    console.error('❌ Seed failed:', e)
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
<<<<<<< HEAD
  })
=======
  })
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
