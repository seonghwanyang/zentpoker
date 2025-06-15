import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
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
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
