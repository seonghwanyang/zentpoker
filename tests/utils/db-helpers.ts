import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

// 테스트 전용 Prisma 클라이언트
let testPrisma: PrismaClient | null = null;

/**
 * 테스트용 데이터베이스 클라이언트 초기화
 */
export function getTestDb(): PrismaClient {
  if (!testPrisma) {
    testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
        },
      },
    });
  }
  return testPrisma;
}

/**
 * 테스트 데이터베이스 정리
 */
export async function cleanupTestDb(): Promise<void> {
  const db = getTestDb();
  
  try {
    // 관계가 있는 테이블부터 역순으로 정리
    await db.userVoucher.deleteMany();
    await db.tournamentParticipant.deleteMany();
    await db.transaction.deleteMany();
    await db.payment.deleteMany();
    await db.tournament.deleteMany();
    await db.voucher.deleteMany();
    await db.user.deleteMany();
    await db.account.deleteMany();
    await db.session.deleteMany();
    await db.verificationToken.deleteMany();
  } catch (error) {
    console.warn('Database cleanup warning:', error);
  }
}

/**
 * 테스트 데이터베이스 연결 종료
 */
export async function disconnectTestDb(): Promise<void> {
  if (testPrisma) {
    await testPrisma.$disconnect();
    testPrisma = null;
  }
}

/**
 * 테스트용 사용자 생성
 */
export async function createTestUser(overrides: any = {}) {
  const db = getTestDb();
  
  return await db.user.create({
    data: {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: 'USER',
      tier: 'BRONZE',
      status: 'ACTIVE',
      points: faker.number.int({ min: 0, max: 100000 }),
      image: faker.image.avatar(),
      emailVerified: new Date(),
      ...overrides,
    },
  });
}

/**
 * 테스트용 관리자 사용자 생성
 */
export async function createTestAdmin(overrides: any = {}) {
  return await createTestUser({
    role: 'ADMIN',
    tier: 'PLATINUM',
    points: 1000000,
    ...overrides,
  });
}

/**
 * 테스트용 거래 내역 생성
 */
export async function createTestTransaction(userId: string, overrides: any = {}) {
  const db = getTestDb();
  
  return await db.transaction.create({
    data: {
      userId,
      type: faker.helpers.arrayElement(['CHARGE', 'USE', 'REFUND']),
      amount: faker.number.int({ min: 1000, max: 100000 }),
      status: faker.helpers.arrayElement(['PENDING', 'COMPLETED', 'FAILED']),
      description: faker.commerce.productName(),
      metadata: {},
      ...overrides,
    },
  });
}

/**
 * 테스트용 결제 내역 생성
 */
export async function createTestPayment(userId: string, overrides: any = {}) {
  const db = getTestDb();
  
  return await db.payment.create({
    data: {
      userId,
      transactionId: faker.string.uuid(),
      amount: faker.number.int({ min: 10000, max: 100000 }),
      method: faker.helpers.arrayElement(['KAKAO_PAY', 'CARD', 'BANK_TRANSFER']),
      status: faker.helpers.arrayElement(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']),
      metadata: {
        paymentKey: faker.string.uuid(),
        orderId: faker.string.uuid(),
      },
      ...overrides,
    },
  });
}

/**
 * 테스트용 바우처 생성
 */
export async function createTestVoucher(overrides: any = {}) {
  const db = getTestDb();
  
  return await db.voucher.create({
    data: {
      name: `${faker.helpers.arrayElement(['브론즈', '실버', '골드', '플래티넘'])} 바우처`,
      description: faker.lorem.sentence(),
      tier: faker.helpers.arrayElement(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']),
      price: faker.number.int({ min: 20000, max: 100000 }),
      duration: faker.number.int({ min: 1, max: 30 }),
      isActive: true,
      ...overrides,
    },
  });
}

/**
 * 테스트용 사용자 바우처 생성
 */
export async function createTestUserVoucher(userId: string, voucherId: string, overrides: any = {}) {
  const db = getTestDb();
  
  return await db.userVoucher.create({
    data: {
      userId,
      voucherId,
      purchaseDate: new Date(),
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
      status: 'ACTIVE',
      ...overrides,
    },
  });
}

/**
 * 테스트용 토너먼트 생성
 */
export async function createTestTournament(overrides: any = {}) {
  const db = getTestDb();
  
  return await db.tournament.create({
    data: {
      name: `${faker.company.name()} 토너먼트`,
      description: faker.lorem.paragraph(),
      entryFee: faker.number.int({ min: 10000, max: 50000 }),
      maxParticipants: faker.number.int({ min: 50, max: 200 }),
      currentParticipants: faker.number.int({ min: 0, max: 50 }),
      status: faker.helpers.arrayElement(['SCHEDULED', 'ONGOING', 'COMPLETED']),
      startDate: faker.date.future(),
      endDate: faker.date.future(),
      rules: faker.lorem.paragraphs(3),
      prizes: {
        first: faker.number.int({ min: 500000, max: 2000000 }),
        second: faker.number.int({ min: 200000, max: 800000 }),
        third: faker.number.int({ min: 100000, max: 400000 }),
      },
      ...overrides,
    },
  });
}

/**
 * 테스트용 토너먼트 참가자 생성
 */
export async function createTestTournamentParticipant(userId: string, tournamentId: string, overrides: any = {}) {
  const db = getTestDb();
  
  return await db.tournamentParticipant.create({
    data: {
      userId,
      tournamentId,
      registrationDate: new Date(),
      status: 'REGISTERED',
      ...overrides,
    },
  });
}

/**
 * 테스트용 계정 생성 (OAuth)
 */
export async function createTestAccount(userId: string, overrides: any = {}) {
  const db = getTestDb();
  
  return await db.account.create({
    data: {
      userId,
      type: 'oauth',
      provider: 'google',
      providerAccountId: faker.string.numeric(12),
      access_token: faker.string.uuid(),
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      scope: 'openid email profile',
      id_token: faker.string.uuid(),
      ...overrides,
    },
  });
}

/**
 * 테스트용 세션 생성
 */
export async function createTestSession(userId: string, overrides: any = {}) {
  const db = getTestDb();
  
  return await db.session.create({
    data: {
      userId,
      sessionToken: faker.string.uuid(),
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
      ...overrides,
    },
  });
}

/**
 * 데이터베이스 시드 (테스트 데이터 생성)
 */
export async function seedTestDatabase() {
  try {
    // 기본 사용자들 생성
    const user1 = await createTestUser({
      email: 'test@example.com',
      name: 'Test User',
      points: 50000,
    });

    const admin = await createTestAdmin({
      email: 'admin@example.com',
      name: 'Admin User',
    });

    const premiumUser = await createTestUser({
      email: 'premium@example.com',
      name: 'Premium User',
      tier: 'GOLD',
      points: 150000,
    });

    // 바우처들 생성
    const bronzeVoucher = await createTestVoucher({
      name: '브론즈 바우처',
      tier: 'BRONZE',
      price: 25000,
    });

    const silverVoucher = await createTestVoucher({
      name: '실버 바우처',
      tier: 'SILVER',
      price: 45000,
    });

    // 토너먼트 생성
    const tournament = await createTestTournament({
      name: '테스트 토너먼트',
      status: 'SCHEDULED',
      entryFee: 25000,
    });

    // 거래 내역 생성
    await createTestTransaction(user1.id, {
      type: 'CHARGE',
      amount: 50000,
      status: 'COMPLETED',
      description: '포인트 충전',
    });

    await createTestTransaction(premiumUser.id, {
      type: 'USE',
      amount: 25000,
      status: 'COMPLETED',
      description: '토너먼트 참가',
    });

    // OAuth 계정 생성
    await createTestAccount(user1.id);
    await createTestAccount(admin.id);
    await createTestAccount(premiumUser.id);

    console.log('✅ Test database seeded successfully');

    return {
      users: { user1, admin, premiumUser },
      vouchers: { bronzeVoucher, silverVoucher },
      tournament,
    };
  } catch (error) {
    console.error('❌ Error seeding test database:', error);
    throw error;
  }
}

/**
 * 테스트 환경 설정
 */
export async function setupTestEnvironment() {
  // 기존 데이터 정리
  await cleanupTestDb();
  
  // 테스트 데이터 생성
  const seedData = await seedTestDatabase();
  
  return seedData;
}

/**
 * 테스트 환경 정리
 */
export async function teardownTestEnvironment() {
  await cleanupTestDb();
  await disconnectTestDb();
}

/**
 * Jest 테스트를 위한 DB 설정 헬퍼
 */
export function setupDatabaseTests() {
  beforeAll(async () => {
    await cleanupTestDb();
  });

  beforeEach(async () => {
    await cleanupTestDb();
  });

  afterAll(async () => {
    await cleanupTestDb();
    await disconnectTestDb();
  });
}

/**
 * 특정 테이블의 레코드 수 확인
 */
export async function getTableCounts() {
  const db = getTestDb();
  
  return {
    users: await db.user.count(),
    transactions: await db.transaction.count(),
    payments: await db.payment.count(),
    vouchers: await db.voucher.count(),
    userVouchers: await db.userVoucher.count(),
    tournaments: await db.tournament.count(),
    tournamentParticipants: await db.tournamentParticipant.count(),
    accounts: await db.account.count(),
    sessions: await db.session.count(),
  };
}