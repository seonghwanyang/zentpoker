import { faker } from '@faker-js/faker';

// 한국어 locale 설정
faker.locale = 'ko';

/**
 * 사용자 팩토리
 */
export const UserFactory = {
  build: (overrides: any = {}) => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: 'USER' as const,
    tier: faker.helpers.arrayElement(['GUEST', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] as const),
    status: 'ACTIVE' as const,
    points: faker.number.int({ min: 0, max: 100000 }),
    image: faker.image.avatar(),
    emailVerified: faker.date.recent(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  guest: (overrides: any = {}) => UserFactory.build({
    tier: 'GUEST',
    points: 0,
    ...overrides,
  }),

  bronze: (overrides: any = {}) => UserFactory.build({
    tier: 'BRONZE',
    points: faker.number.int({ min: 1000, max: 50000 }),
    ...overrides,
  }),

  silver: (overrides: any = {}) => UserFactory.build({
    tier: 'SILVER',
    points: faker.number.int({ min: 25000, max: 75000 }),
    ...overrides,
  }),

  gold: (overrides: any = {}) => UserFactory.build({
    tier: 'GOLD',
    points: faker.number.int({ min: 50000, max: 150000 }),
    ...overrides,
  }),

  platinum: (overrides: any = {}) => UserFactory.build({
    tier: 'PLATINUM',
    points: faker.number.int({ min: 100000, max: 500000 }),
    ...overrides,
  }),

  admin: (overrides: any = {}) => UserFactory.build({
    role: 'ADMIN',
    tier: 'PLATINUM',
    points: faker.number.int({ min: 500000, max: 1000000 }),
    ...overrides,
  }),

  suspended: (overrides: any = {}) => UserFactory.build({
    status: 'SUSPENDED',
    points: 0,
    ...overrides,
  }),
};

/**
 * 거래 팩토리
 */
export const TransactionFactory = {
  build: (overrides: any = {}) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    type: faker.helpers.arrayElement(['CHARGE', 'USE', 'REFUND'] as const),
    amount: faker.number.int({ min: 1000, max: 100000 }),
    status: faker.helpers.arrayElement(['PENDING', 'COMPLETED', 'FAILED'] as const),
    description: faker.commerce.productName(),
    metadata: {},
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  charge: (overrides: any = {}) => TransactionFactory.build({
    type: 'CHARGE',
    amount: faker.helpers.arrayElement([25000, 50000, 75000, 100000]),
    status: 'COMPLETED',
    description: '포인트 충전',
    ...overrides,
  }),

  use: (overrides: any = {}) => TransactionFactory.build({
    type: 'USE',
    amount: faker.number.int({ min: 5000, max: 50000 }),
    status: 'COMPLETED',
    description: faker.helpers.arrayElement(['토너먼트 참가', '바우처 구매', '기타 사용']),
    ...overrides,
  }),

  refund: (overrides: any = {}) => TransactionFactory.build({
    type: 'REFUND',
    amount: faker.number.int({ min: 1000, max: 50000 }),
    status: 'COMPLETED',
    description: '환불 처리',
    ...overrides,
  }),

  pending: (overrides: any = {}) => TransactionFactory.build({
    status: 'PENDING',
    ...overrides,
  }),

  failed: (overrides: any = {}) => TransactionFactory.build({
    status: 'FAILED',
    ...overrides,
  }),
};

/**
 * 결제 팩토리
 */
export const PaymentFactory = {
  build: (overrides: any = {}) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    transactionId: faker.string.uuid(),
    amount: faker.number.int({ min: 10000, max: 100000 }),
    method: faker.helpers.arrayElement(['KAKAO_PAY', 'CARD', 'BANK_TRANSFER'] as const),
    status: faker.helpers.arrayElement(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'] as const),
    metadata: {
      paymentKey: faker.string.uuid(),
      orderId: faker.string.uuid(),
    },
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  kakaoPay: (overrides: any = {}) => PaymentFactory.build({
    method: 'KAKAO_PAY',
    metadata: {
      paymentKey: faker.string.uuid(),
      orderId: faker.string.uuid(),
      tid: `T${faker.string.numeric(10)}`,
      cid: 'TC0ONETIME',
    },
    ...overrides,
  }),

  card: (overrides: any = {}) => PaymentFactory.build({
    method: 'CARD',
    metadata: {
      paymentKey: faker.string.uuid(),
      orderId: faker.string.uuid(),
      cardNumber: '**** **** **** ' + faker.string.numeric(4),
      cardType: faker.helpers.arrayElement(['CREDIT', 'DEBIT']),
    },
    ...overrides,
  }),

  completed: (overrides: any = {}) => PaymentFactory.build({
    status: 'COMPLETED',
    ...overrides,
  }),

  pending: (overrides: any = {}) => PaymentFactory.build({
    status: 'PENDING',
    ...overrides,
  }),

  failed: (overrides: any = {}) => PaymentFactory.build({
    status: 'FAILED',
    ...overrides,
  }),
};

/**
 * 바우처 팩토리
 */
export const VoucherFactory = {
  build: (overrides: any = {}) => ({
    id: faker.string.uuid(),
    name: faker.helpers.arrayElement(['브론즈', '실버', '골드', '플래티넘']) + ' 바우처',
    description: faker.lorem.sentence(),
    tier: faker.helpers.arrayElement(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'] as const),
    price: faker.number.int({ min: 20000, max: 100000 }),
    duration: faker.number.int({ min: 1, max: 30 }),
    isActive: true,
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  bronze: (overrides: any = {}) => VoucherFactory.build({
    name: '브론즈 바우처',
    tier: 'BRONZE',
    price: 25000,
    duration: 7,
    ...overrides,
  }),

  silver: (overrides: any = {}) => VoucherFactory.build({
    name: '실버 바우처',
    tier: 'SILVER',
    price: 45000,
    duration: 7,
    ...overrides,
  }),

  gold: (overrides: any = {}) => VoucherFactory.build({
    name: '골드 바우처',
    tier: 'GOLD',
    price: 65000,
    duration: 7,
    ...overrides,
  }),

  platinum: (overrides: any = {}) => VoucherFactory.build({
    name: '플래티넘 바우처',
    tier: 'PLATINUM',
    price: 85000,
    duration: 7,
    ...overrides,
  }),

  inactive: (overrides: any = {}) => VoucherFactory.build({
    isActive: false,
    ...overrides,
  }),
};

/**
 * 사용자 바우처 팩토리
 */
export const UserVoucherFactory = {
  build: (overrides: any = {}) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    voucherId: faker.string.uuid(),
    purchaseDate: faker.date.recent(),
    expiryDate: faker.date.future({ days: 7 }),
    status: 'ACTIVE' as const,
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  active: (overrides: any = {}) => UserVoucherFactory.build({
    status: 'ACTIVE',
    expiryDate: faker.date.future({ days: 7 }),
    ...overrides,
  }),

  expired: (overrides: any = {}) => UserVoucherFactory.build({
    status: 'EXPIRED',
    expiryDate: faker.date.past({ days: 1 }),
    ...overrides,
  }),

  used: (overrides: any = {}) => UserVoucherFactory.build({
    status: 'USED',
    ...overrides,
  }),
};

/**
 * 토너먼트 팩토리
 */
export const TournamentFactory = {
  build: (overrides: any = {}) => ({
    id: faker.string.uuid(),
    name: `${faker.company.name()} 토너먼트`,
    description: faker.lorem.paragraph(),
    entryFee: faker.number.int({ min: 10000, max: 50000 }),
    maxParticipants: faker.number.int({ min: 50, max: 200 }),
    currentParticipants: faker.number.int({ min: 0, max: 50 }),
    status: faker.helpers.arrayElement(['SCHEDULED', 'ONGOING', 'COMPLETED'] as const),
    startDate: faker.date.future(),
    endDate: faker.date.future(),
    rules: faker.lorem.paragraphs(3),
    prizes: {
      first: faker.number.int({ min: 500000, max: 2000000 }),
      second: faker.number.int({ min: 200000, max: 800000 }),
      third: faker.number.int({ min: 100000, max: 400000 }),
    },
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  scheduled: (overrides: any = {}) => TournamentFactory.build({
    status: 'SCHEDULED',
    startDate: faker.date.future(),
    currentParticipants: faker.number.int({ min: 0, max: 20 }),
    ...overrides,
  }),

  ongoing: (overrides: any = {}) => TournamentFactory.build({
    status: 'ONGOING',
    startDate: faker.date.past({ days: 1 }),
    endDate: faker.date.future({ days: 1 }),
    currentParticipants: faker.number.int({ min: 30, max: 100 }),
    ...overrides,
  }),

  completed: (overrides: any = {}) => TournamentFactory.build({
    status: 'COMPLETED',
    startDate: faker.date.past({ days: 2 }),
    endDate: faker.date.past({ days: 1 }),
    ...overrides,
  }),

  full: (overrides: any = {}) => TournamentFactory.build({
    currentParticipants: 100,
    maxParticipants: 100,
    ...overrides,
  }),
};

/**
 * 토너먼트 참가자 팩토리
 */
export const TournamentParticipantFactory = {
  build: (overrides: any = {}) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    tournamentId: faker.string.uuid(),
    registrationDate: faker.date.recent(),
    status: 'REGISTERED' as const,
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  registered: (overrides: any = {}) => TournamentParticipantFactory.build({
    status: 'REGISTERED',
    ...overrides,
  }),

  cancelled: (overrides: any = {}) => TournamentParticipantFactory.build({
    status: 'CANCELLED',
    ...overrides,
  }),

  completed: (overrides: any = {}) => TournamentParticipantFactory.build({
    status: 'COMPLETED',
    ...overrides,
  }),
};

/**
 * OAuth 계정 팩토리
 */
export const AccountFactory = {
  build: (overrides: any = {}) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    type: 'oauth' as const,
    provider: faker.helpers.arrayElement(['google', 'naver', 'kakao'] as const),
    providerAccountId: faker.string.numeric(12),
    access_token: faker.string.uuid(),
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    scope: 'openid email profile',
    id_token: faker.string.uuid(),
    ...overrides,
  }),

  google: (overrides: any = {}) => AccountFactory.build({
    provider: 'google',
    scope: 'openid email profile',
    ...overrides,
  }),

  naver: (overrides: any = {}) => AccountFactory.build({
    provider: 'naver',
    scope: 'profile email',
    ...overrides,
  }),

  kakao: (overrides: any = {}) => AccountFactory.build({
    provider: 'kakao',
    scope: 'profile_nickname account_email',
    ...overrides,
  }),
};

/**
 * 세션 팩토리
 */
export const SessionFactory = {
  build: (overrides: any = {}) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    sessionToken: faker.string.uuid(),
    expires: faker.date.future({ days: 30 }),
    ...overrides,
  }),

  expired: (overrides: any = {}) => SessionFactory.build({
    expires: faker.date.past({ days: 1 }),
    ...overrides,
  }),

  fresh: (overrides: any = {}) => SessionFactory.build({
    expires: faker.date.future({ days: 29 }),
    ...overrides,
  }),
};

/**
 * API 응답 팩토리
 */
export const ApiResponseFactory = {
  success: (data: any = {}) => ({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }),

  error: (message: string = 'An error occurred', code: string = 'UNKNOWN_ERROR') => ({
    success: false,
    error: {
      code,
      message,
    },
    timestamp: new Date().toISOString(),
  }),

  paginated: (data: any[] = [], page = 1, limit = 10) => ({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total: data.length,
      totalPages: Math.ceil(data.length / limit),
    },
    timestamp: new Date().toISOString(),
  }),
};

/**
 * 벌크 데이터 생성 헬퍼
 */
export const TestDataGenerator = {
  users: (count: number, overrides: any = {}) => 
    Array.from({ length: count }, () => UserFactory.build(overrides)),

  transactions: (count: number, overrides: any = {}) =>
    Array.from({ length: count }, () => TransactionFactory.build(overrides)),

  payments: (count: number, overrides: any = {}) =>
    Array.from({ length: count }, () => PaymentFactory.build(overrides)),

  vouchers: (count: number, overrides: any = {}) =>
    Array.from({ length: count }, () => VoucherFactory.build(overrides)),

  tournaments: (count: number, overrides: any = {}) =>
    Array.from({ length: count }, () => TournamentFactory.build(overrides)),

  /**
   * 완전한 사용자 프로필 (계정, 세션 포함)
   */
  completeUserProfile: (overrides: any = {}) => {
    const user = UserFactory.build(overrides);
    const account = AccountFactory.google({ userId: user.id });
    const session = SessionFactory.fresh({ userId: user.id });

    return {
      user,
      account,
      session,
    };
  },

  /**
   * 토너먼트와 참가자들
   */
  tournamentWithParticipants: (participantCount: number = 10, overrides: any = {}) => {
    const tournament = TournamentFactory.scheduled({
      currentParticipants: participantCount,
      ...overrides,
    });

    const participants = Array.from({ length: participantCount }, () =>
      TournamentParticipantFactory.registered({
        tournamentId: tournament.id,
        userId: faker.string.uuid(),
      })
    );

    return {
      tournament,
      participants,
    };
  },
};

/**
 * 시드 데이터 세트
 */
export const SEED_DATA = {
  // 기본 사용자들
  USERS: {
    GUEST: UserFactory.guest({ email: 'guest@test.com', name: 'Guest User' }),
    BRONZE: UserFactory.bronze({ email: 'bronze@test.com', name: 'Bronze User' }),
    SILVER: UserFactory.silver({ email: 'silver@test.com', name: 'Silver User' }),
    GOLD: UserFactory.gold({ email: 'gold@test.com', name: 'Gold User' }),
    PLATINUM: UserFactory.platinum({ email: 'platinum@test.com', name: 'Platinum User' }),
    ADMIN: UserFactory.admin({ email: 'admin@test.com', name: 'Admin User' }),
    SUSPENDED: UserFactory.suspended({ email: 'suspended@test.com', name: 'Suspended User' }),
  },

  // 기본 바우처들
  VOUCHERS: {
    BRONZE: VoucherFactory.bronze(),
    SILVER: VoucherFactory.silver(),
    GOLD: VoucherFactory.gold(),
    PLATINUM: VoucherFactory.platinum(),
  },

  // 기본 토너먼트들
  TOURNAMENTS: {
    SCHEDULED: TournamentFactory.scheduled({ name: '예정된 토너먼트' }),
    ONGOING: TournamentFactory.ongoing({ name: '진행 중인 토너먼트' }),
    COMPLETED: TournamentFactory.completed({ name: '완료된 토너먼트' }),
    FULL: TournamentFactory.full({ name: '마감된 토너먼트' }),
  },
};