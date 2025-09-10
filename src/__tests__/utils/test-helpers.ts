// 테스트 헬퍼 유틸리티
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Mock 함수들
export const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

// 공통 Mock 데이터 생성자
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  phone: '010-1234-5678',
  image: null,
  role: 'USER',
  tier: 'GUEST',
  memberGrade: 'MEMBER',
  status: 'ACTIVE',
  points: 50000,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  lastLoginAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockAdmin = (overrides = {}) => ({
  id: 'test-admin-id',
  email: 'admin@example.com',
  name: 'Test Admin',
  phone: '010-9999-9999',
  image: null,
  role: 'ADMIN',
  tier: 'VIP',
  memberGrade: 'VIP',
  status: 'ACTIVE',
  points: 0,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  lastLoginAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockTransaction = (overrides = {}) => ({
  id: 'test-transaction-id',
  userId: 'test-user-id',
  type: 'CHARGE',
  amount: 25000,
  status: 'PENDING',
  description: 'Test charge transaction',
  metadata: {
    referenceCode: 'TEST-REF-123',
    paymentMethod: 'KAKAO_PAY',
    userType: 'MEMBER',
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockVoucher = (overrides = {}) => ({
  id: 'test-voucher-id',
  userId: 'test-user-id',
  type: 'BUYIN',
  status: 'ACTIVE',
  tournamentId: null,
  usedAt: null,
  expiresAt: new Date('2024-02-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockVoucherPricing = (overrides = {}) => ({
  id: 'test-pricing-id',
  type: 'BUYIN',
  memberGrade: 'MEMBER',
  price: 5000,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockTournament = (overrides = {}) => ({
  id: 'test-tournament-id',
  title: 'Test Tournament',
  startDate: new Date('2024-02-01'),
  ...overrides,
});

// Mock 세션 생성자
export const createMockSession = (user = createMockUser()) => ({
  user: {
    email: user.email,
    name: user.name,
    image: user.image,
  },
  expires: '2024-12-31',
});

// Mock 요청 생성자
export const createMockRequest = (
  method = 'GET',
  url = 'http://localhost:3000/api/test',
  body?: any,
  headers: Record<string, string> = {}
) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'User-Agent': 'Jest Test',
    ...headers,
  };

  return new Request(url, {
    method,
    headers: defaultHeaders,
    body: body ? JSON.stringify(body) : null,
  });
};

// Prisma Mock 설정 헬퍼
export const setupPrismaMocks = () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    transaction: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    payment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    voucher: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    voucherPricing: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    pointLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    tournament: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  // Mock prisma를 반환하도록 모듈 모킹
  (prisma as any).user = mockPrisma.user;
  (prisma as any).transaction = mockPrisma.transaction;
  (prisma as any).payment = mockPrisma.payment;
  (prisma as any).voucher = mockPrisma.voucher;
  (prisma as any).voucherPricing = mockPrisma.voucherPricing;
  (prisma as any).pointLog = mockPrisma.pointLog;
  (prisma as any).tournament = mockPrisma.tournament;
  (prisma as any).$transaction = mockPrisma.$transaction;

  return mockPrisma;
};

// 에러 시나리오 테스트 헬퍼
export const testErrorScenarios = {
  unauthorized: () => {
    mockGetServerSession.mockResolvedValue(null);
  },
  userNotFound: () => {
    mockGetServerSession.mockResolvedValue(createMockSession());
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
  },
  inactiveUser: () => {
    const inactiveUser = createMockUser({ status: 'INACTIVE' });
    mockGetServerSession.mockResolvedValue(createMockSession(inactiveUser));
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(inactiveUser);
  },
  insufficientRole: (role = 'USER') => {
    const user = createMockUser({ role });
    mockGetServerSession.mockResolvedValue(createMockSession(user));
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
  },
  databaseError: (operation: string) => {
    const error = new Error(`Database connection failed during ${operation}`);
    return error;
  },
};

// 응답 검증 헬퍼
export const expectSuccessResponse = (response: Response, expectedData?: any, expectedMessage?: string) => {
  expect(response.status).toBeLessThan(400);
  if (expectedData) {
    expect(response.json()).resolves.toMatchObject({
      success: true,
      data: expectedData,
    });
  }
  if (expectedMessage) {
    expect(response.json()).resolves.toMatchObject({
      message: expectedMessage,
    });
  }
};

export const expectErrorResponse = (response: Response, expectedStatus: number, expectedError?: string) => {
  expect(response.status).toBe(expectedStatus);
  if (expectedError) {
    expect(response.json()).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining(expectedError),
    });
  }
};

// 동시성 테스트 헬퍼
export const runConcurrentRequests = async (requestFn: () => Promise<Response>, count = 5) => {
  const promises = Array(count).fill(null).map(() => requestFn());
  return await Promise.allSettled(promises);
};

// 타이밍 테스트 헬퍼
export const measureResponseTime = async (requestFn: () => Promise<Response>) => {
  const start = Date.now();
  const response = await requestFn();
  const duration = Date.now() - start;
  return { response, duration };
};

// 트랜잭션 무결성 테스트 헬퍼
export const simulateTransactionFailure = (step: number, totalSteps: number) => {
  let callCount = 0;
  return jest.fn().mockImplementation(() => {
    callCount++;
    if (callCount === step) {
      throw new Error(`Transaction failed at step ${step}/${totalSteps}`);
    }
    return Promise.resolve({});
  });
};

// 입력 검증 테스트 케이스
export const invalidInputTestCases = {
  emptyBody: {},
  nullValues: { value: null },
  undefinedValues: { value: undefined },
  wrongTypes: { amount: '25000', isValid: 'true' },
  negativeNumbers: { amount: -1000, quantity: -1 },
  oversizedStrings: { name: 'a'.repeat(256), description: 'b'.repeat(1001) },
  invalidEmails: { email: 'invalid-email' },
  invalidPhoneNumbers: { phone: '123-456-7890', phone2: '01012345678' },
  sqlInjectionAttempts: { 
    name: "'; DROP TABLE users; --",
    search: "' OR 1=1 --",
    email: "test@example.com'; DELETE FROM users; --"
  },
  xssAttempts: {
    name: '<script>alert("xss")</script>',
    description: '<img src="x" onerror="alert(1)">',
  },
};

// 성능 테스트 헬퍼
export const performanceThresholds = {
  fast: 100, // 100ms
  medium: 500, // 500ms
  slow: 1000, // 1000ms
};