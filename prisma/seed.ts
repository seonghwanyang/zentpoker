// prisma/seed.ts
import { PrismaClient, MemberGrade, VoucherType, VoucherStatus, UserStatus, TransactionType, TransactionStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 시드 데이터 생성 시작...')

  // 개발 환경에서만 기존 데이터 삭제 (옵션)
  const shouldCleanData = process.env.CLEAN_SEED === 'true'
  if (shouldCleanData) {
    console.log('🗑️ 기존 데이터 삭제 중...')
    
    try {
      // 의존성 순서대로 삭제
      await prisma.tournamentEntry.deleteMany()
      await prisma.voucher.deleteMany()
      await prisma.pointLog.deleteMany()
      await prisma.transaction.deleteMany()
      await prisma.tournament.deleteMany()
      await prisma.session.deleteMany()
      await prisma.account.deleteMany()
      // 관리자 계정을 제외한 사용자 삭제
      await prisma.user.deleteMany({
        where: {
          role: { not: 'ADMIN' }
        }
      })
      await prisma.voucherPricing.deleteMany()
      
      console.log('✅ 기존 데이터 삭제 완료')
    } catch (error) {
      console.log('⚠️ 데이터 삭제 중 오류 발생:', error)
    }
  }

  // 1. 시스템 설정
  console.log('⚙️ 시스템 설정 중...')
  await prisma.systemSetting.upsert({
    where: { key: 'maintenance_mode' },
    update: { value: 'false' },
    create: {
      key: 'maintenance_mode',
      value: 'false',
      description: '시스템 점검 모드'
    }
  })

  // 2. 바인권 가격 정책 설정
  console.log('💰 바인권 가격 정책 설정 중...')
  const pricingData = [
    { type: VoucherType.BUYIN, memberGrade: MemberGrade.GUEST, price: 60000 },
    { type: VoucherType.BUYIN, memberGrade: MemberGrade.REGULAR, price: 50000 },
    { type: VoucherType.REBUY, memberGrade: MemberGrade.GUEST, price: 35000 },
    { type: VoucherType.REBUY, memberGrade: MemberGrade.REGULAR, price: 30000 },
  ]

  for (const pricing of pricingData) {
    await prisma.voucherPricing.upsert({
      where: {
        type_memberGrade_isActive: {
          type: pricing.type,
          memberGrade: pricing.memberGrade,
          isActive: true
        }
      },
      update: {
        price: pricing.price
      },
      create: {
        ...pricing,
        isActive: true
      }
    })
  }
  console.log('✅ 바인권 가격 정책 설정 완료')

  // 3. 관리자 계정 생성
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@zentpoker.com'
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: '관리자',
      role: 'ADMIN',
      grade: MemberGrade.ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: adminEmail,
      name: '관리자',
      phone: '010-0000-0000',
      role: 'ADMIN',
      grade: MemberGrade.ADMIN,
      status: UserStatus.ACTIVE,
      points: 0,
    },
  })
  console.log('✅ 관리자 계정 생성:', admin.email)

  // 4. 테스트 사용자 생성
  const testUsers = [
    {
      email: 'regular@test.com',
      name: '정회원 테스트',
      phone: '010-1234-5678',
      grade: MemberGrade.REGULAR,
      points: 150000,
    },
    {
      email: 'guest@test.com',
      name: '게스트 테스트',
      phone: '010-2345-6789',
      grade: MemberGrade.GUEST,
      points: 50000,
    },
    {
      email: 'newuser@test.com',
      name: '신규 회원',
      phone: '010-3456-7890',
      grade: MemberGrade.GUEST,
      points: 0,
    },
  ]

  for (const userData of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        phone: userData.phone,
        grade: userData.grade,
        points: userData.points,
      },
      create: {
        ...userData,
        role: 'USER',
        status: UserStatus.ACTIVE,
      },
    })
    console.log('✅ 테스트 사용자 생성:', user.email)

    // 포인트가 있는 사용자에게 거래 내역과 바인권 추가
    if (userData.points > 0) {
      // 충전 거래 내역
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: TransactionType.CHARGE,
          amount: userData.points,
          status: TransactionStatus.COMPLETED,
          description: '초기 충전 (테스트)',
          metadata: {
            method: 'TEST',
            timestamp: new Date().toISOString()
          }
        },
      })

      // 포인트 로그
      await prisma.pointLog.create({
        data: {
          userId: user.id,
          amount: userData.points,
          type: '충전',
          description: '초기 포인트 충전',
        },
      })

      // 바인권 구매 거래
      const buyinPrice = userData.grade === MemberGrade.REGULAR ? 50000 : 60000
      const rebuyPrice = userData.grade === MemberGrade.REGULAR ? 30000 : 35000

      // Buy-in 바인권
      await prisma.voucher.create({
        data: {
          userId: user.id,
          type: VoucherType.BUYIN,
          status: VoucherStatus.ACTIVE,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
        },
      })

      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: TransactionType.VOUCHER_PURCHASE,
          amount: -buyinPrice,
          status: TransactionStatus.COMPLETED,
          description: 'Buy-in 바인권 구매',
          metadata: {
            voucherType: 'BUYIN',
            price: buyinPrice
          }
        },
      })

      await prisma.pointLog.create({
        data: {
          userId: user.id,
          amount: -buyinPrice,
          type: '구매',
          description: 'Buy-in 바인권 구매',
        },
      })

      // Re-buy 바인권 (정회원만)
      if (userData.grade === MemberGrade.REGULAR) {
        await prisma.voucher.create({
          data: {
            userId: user.id,
            type: VoucherType.REBUY,
            status: VoucherStatus.ACTIVE,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })

        await prisma.transaction.create({
          data: {
            userId: user.id,
            type: TransactionType.VOUCHER_PURCHASE,
            amount: -rebuyPrice,
            status: TransactionStatus.COMPLETED,
            description: 'Re-buy 바인권 구매',
            metadata: {
              voucherType: 'REBUY',
              price: rebuyPrice
            }
          },
        })

        await prisma.pointLog.create({
          data: {
            userId: user.id,
            amount: -rebuyPrice,
            type: '구매',
            description: 'Re-buy 바인권 구매',
          },
        })
      }

      // 포인트 잔액 업데이트
      const totalSpent = userData.grade === MemberGrade.REGULAR ? (buyinPrice + rebuyPrice) : buyinPrice
      await prisma.user.update({
        where: { id: user.id },
        data: { points: userData.points - totalSpent }
      })
    }
  }

  // 5. 토너먼트 생성
  const tournaments = [
    {
      title: '주말 정기 토너먼트',
      name: '토요일 저녁 홀덤',
      description: '매주 토요일 저녁 7시에 시작하는 정기 토너먼트입니다.',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2일 후
      endDate: new Date(Date.now() + 2.5 * 24 * 60 * 60 * 1000), // 2.5일 후
      maxEntries: 50,
      buyinRequired: 1,
      rebuyAllowed: true,
      status: 'UPCOMING',
      createdBy: admin.id,
    },
    {
      title: '월간 챔피언십',
      name: '12월 챔피언십',
      description: '매월 마지막 주 일요일에 열리는 월간 챔피언십',
      startDate: new Date('2024-12-29T19:00:00'),
      endDate: new Date('2024-12-29T23:00:00'),
      maxEntries: 100,
      buyinRequired: 2,
      rebuyAllowed: false,
      status: 'UPCOMING',
      createdBy: admin.id,
    }
  ]

  for (const tournamentData of tournaments) {
    const tournament = await prisma.tournament.create({
      data: tournamentData
    })
    console.log('✅ 토너먼트 생성:', tournament.title)
  }

  // 6. 대기 중인 충전 요청 생성 (관리자 테스트용)
  const regularUser = await prisma.user.findFirst({
    where: { email: 'regular@test.com' },
  })
  
  if (regularUser) {
    const pendingCharges = [
      {
        userId: regularUser.id,
        type: TransactionType.CHARGE,
        amount: 100000,
        status: TransactionStatus.PENDING,
        description: '카카오페이 송금 대기 중',
        metadata: {
          method: 'KAKAO_PAY',
          referenceCode: 'KP-' + Date.now().toString().slice(-8),
          requestedAt: new Date().toISOString(),
          senderName: '정회원테스트'
        },
      },
      {
        userId: regularUser.id,
        type: TransactionType.CHARGE,
        amount: 50000,
        status: TransactionStatus.PENDING,
        description: '계좌이체 확인 대기 중',
        metadata: {
          method: 'BANK_TRANSFER',
          referenceCode: 'BT-' + Date.now().toString().slice(-8),
          requestedAt: new Date(Date.now() - 3600000).toISOString(), // 1시간 전
          bank: '국민은행',
          accountNumber: '****-****-1234'
        },
      }
    ]

    for (const charge of pendingCharges) {
      await prisma.transaction.create({ data: charge })
    }
    console.log('✅ 대기 중인 충전 요청 생성')
  }

  // 7. 일부 완료된 거래 내역 추가 (통계용)
  const guestUser = await prisma.user.findFirst({
    where: { email: 'guest@test.com' },
  })

  if (guestUser) {
    const completedTransactions = [
      {
        userId: guestUser.id,
        type: TransactionType.CHARGE,
        amount: 200000,
        status: TransactionStatus.COMPLETED,
        description: '포인트 충전 완료',
        metadata: {
          method: 'TOSS',
          completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7일 전
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ]

    for (const transaction of completedTransactions) {
      await prisma.transaction.create({ data: transaction })
    }
  }

  // 8. 시스템 통계 출력
  const stats = {
    users: await prisma.user.count(),
    vouchers: await prisma.voucher.count(),
    tournaments: await prisma.tournament.count(),
    pendingCharges: await prisma.transaction.count({
      where: { 
        type: TransactionType.CHARGE,
        status: TransactionStatus.PENDING 
      }
    }),
    totalPoints: await prisma.user.aggregate({
      _sum: { points: true }
    })
  }

  console.log('\n📊 시드 데이터 생성 결과:')
  console.log(`  - 사용자: ${stats.users}명`)
  console.log(`  - 바인권: ${stats.vouchers}개`)
  console.log(`  - 토너먼트: ${stats.tournaments}개`)
  console.log(`  - 대기 중인 충전: ${stats.pendingCharges}건`)
  console.log(`  - 총 포인트: ${stats.totalPoints._sum.points?.toLocaleString() || 0}P`)
  
  console.log('\n🎉 시드 데이터 생성 완료!')
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 중 오류:', e)
    console.error('상세 오류:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })