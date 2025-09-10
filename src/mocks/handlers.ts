import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

// API 베이스 URL
const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

// 모의 사용자 데이터
const mockUsers = [
  {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    tier: 'BRONZE',
    status: 'ACTIVE',
    points: 50000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
    tier: 'PLATINUM',
    status: 'ACTIVE',
    points: 1000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// 모의 거래 내역
const mockTransactions = Array.from({ length: 10 }, (_, index) => ({
  id: `transaction-${index + 1}`,
  userId: 'user-1',
  type: faker.helpers.arrayElement(['CHARGE', 'USE', 'REFUND']),
  amount: faker.number.int({ min: 1000, max: 100000 }),
  status: faker.helpers.arrayElement(['PENDING', 'COMPLETED', 'FAILED']),
  description: faker.commerce.productName(),
  metadata: {},
  createdAt: faker.date.recent().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
}));

// 모의 바우처 데이터
const mockVouchers = [
  {
    id: 'voucher-1',
    name: '브론즈 바우처',
    description: '7일간 사용 가능한 브론즈 등급 바우처',
    tier: 'BRONZE',
    price: 25000,
    duration: 7,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'voucher-2',
    name: '실버 바우처',
    description: '7일간 사용 가능한 실버 등급 바우처',
    tier: 'SILVER',
    price: 45000,
    duration: 7,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// 모의 토너먼트 데이터
const mockTournaments = Array.from({ length: 5 }, (_, index) => ({
  id: `tournament-${index + 1}`,
  name: `${faker.company.name()} 토너먼트`,
  description: faker.lorem.paragraph(),
  entryFee: faker.number.int({ min: 10000, max: 50000 }),
  maxParticipants: faker.number.int({ min: 50, max: 200 }),
  currentParticipants: faker.number.int({ min: 10, max: 50 }),
  status: faker.helpers.arrayElement(['SCHEDULED', 'ONGOING', 'COMPLETED']),
  startDate: faker.date.future().toISOString(),
  endDate: faker.date.future().toISOString(),
  createdAt: faker.date.recent().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
}));

export const handlers = [
  // Google OAuth 모의
  http.get('https://accounts.google.com/oauth/authorize', () => {
    return HttpResponse.redirect(`${API_BASE}/api/auth/callback/google?code=mock-auth-code&state=mock-state`);
  }),

  http.post('https://oauth2.googleapis.com/token', () => {
    return HttpResponse.json({
      access_token: 'mock-google-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: 'mock-google-refresh-token',
      scope: 'openid email profile',
      id_token: 'mock-google-id-token',
    });
  }),

  http.get('https://www.googleapis.com/oauth2/v2/userinfo', () => {
    return HttpResponse.json({
      id: '123456789',
      email: 'test@gmail.com',
      verified_email: true,
      name: 'Test User',
      given_name: 'Test',
      family_name: 'User',
      picture: 'https://example.com/avatar.jpg',
      locale: 'ko',
    });
  }),

  // KakaoPay 모의
  http.post('https://open-api.kakaopay.com/online/v1/payment/ready', () => {
    return HttpResponse.json({
      tid: 'mock-kakao-transaction-id',
      next_redirect_pc_url: `${API_BASE}/api/payment/kakao/approve?partner_order_id=mock-order-id&partner_user_id=user-1`,
      next_redirect_mobile_url: `${API_BASE}/api/payment/kakao/approve?partner_order_id=mock-order-id&partner_user_id=user-1`,
      created_at: new Date().toISOString(),
    });
  }),

  http.post('https://open-api.kakaopay.com/online/v1/payment/approve', () => {
    return HttpResponse.json({
      aid: 'mock-kakao-approval-id',
      tid: 'mock-kakao-transaction-id',
      cid: 'mock-kakao-cid',
      sid: 'mock-kakao-sid',
      partner_order_id: 'mock-order-id',
      partner_user_id: 'user-1',
      payment_method_type: 'MONEY',
      item_name: '포인트 충전',
      item_code: 'POINTS',
      quantity: 1,
      created_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
      amount: {
        total: 25000,
        tax_free: 0,
        vat: 2500,
        point: 0,
        discount: 0,
        green_deposit: 0,
      },
    });
  }),

  // 포인트 관련 API
  http.get('/api/points/balance', ({ request }) => {
    const url = new URL(request.url);
    const forceError = url.searchParams.get('forceError');
    
    if (forceError === 'unauthorized') {
      return new HttpResponse(null, { status: 401 });
    }
    
    if (forceError === 'server') {
      return new HttpResponse(null, { status: 500 });
    }

    return HttpResponse.json({
      success: true,
      data: { points: 50000 },
    });
  }),

  http.post('/api/points/charge', async ({ request }) => {
    const url = new URL(request.url);
    const forceError = url.searchParams.get('forceError');
    
    if (forceError === 'unauthorized') {
      return HttpResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (forceError === 'insufficient_points') {
      return HttpResponse.json(
        { success: false, error: '포인트가 부족합니다' },
        { status: 400 }
      );
    }
    
    if (forceError === 'payment_failed') {
      return HttpResponse.json(
        { success: false, error: '결제 처리에 실패했습니다' },
        { status: 400 }
      );
    }
    
    if (forceError === 'network') {
      return new HttpResponse(null, { status: 503 });
    }

    const body = await request.json();
    
    // Validate charge amount
    if (!body.amount || body.amount < 1000) {
      return HttpResponse.json(
        { success: false, error: '최소 충전 금액은 1,000원입니다' },
        { status: 400 }
      );
    }
    
    if (body.amount > 1000000) {
      return HttpResponse.json(
        { success: false, error: '최대 충전 금액은 1,000,000원입니다' },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    return HttpResponse.json({
      success: true,
      data: {
        transactionId: faker.string.uuid(),
        amount: body.amount,
        status: 'COMPLETED',
        paymentUrl: `${API_BASE}/payment/kakao/redirect?tid=mock-tid`,
      },
    });
  }),

  http.get('/api/points/transactions', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const forceError = url.searchParams.get('forceError');
    
    if (forceError === 'unauthorized') {
      return new HttpResponse(null, { status: 401 });
    }
    
    if (forceError === 'server') {
      return new HttpResponse(null, { status: 500 });
    }

    let filteredTransactions = [...mockTransactions];
    
    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }
    
    if (status) {
      filteredTransactions = filteredTransactions.filter(t => t.status === status);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: paginatedTransactions,
      pagination: {
        page,
        limit,
        total: filteredTransactions.length,
        totalPages: Math.ceil(filteredTransactions.length / limit),
      },
    });
  }),

  // 바우처 관련 API
  http.get('/api/vouchers/list', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const forceError = url.searchParams.get('forceError');
    
    if (forceError === 'unauthorized') {
      return new HttpResponse(null, { status: 401 });
    }
    
    if (forceError === 'server') {
      return new HttpResponse(null, { status: 500 });
    }

    let filteredVouchers = [...mockVouchers];
    
    if (status) {
      // Add status filtering if needed
      filteredVouchers = filteredVouchers.filter(v => v.isActive === (status === 'ACTIVE'));
    }

    // Mock voucher statistics
    const stats = {
      buyIn: { active: 5, used: 2, expired: 1 },
      rebuy: { active: 3, used: 4, expired: 0 }
    };

    return HttpResponse.json({
      success: true,
      data: {
        vouchers: filteredVouchers,
        stats,
      },
    });
  }),

  http.get('/api/vouchers/pricing', ({ request }) => {
    const url = new URL(request.url);
    const forceError = url.searchParams.get('forceError');
    
    if (forceError === 'server') {
      return new HttpResponse(null, { status: 500 });
    }

    return HttpResponse.json({
      success: true,
      data: [
        { type: 'BUYIN', memberGrade: 'MEMBER', price: 5000 },
        { type: 'BUYIN', memberGrade: 'VIP', price: 4000 },
        { type: 'BUYIN', memberGrade: 'PREMIUM', price: 3000 },
        { type: 'REBUY', memberGrade: 'MEMBER', price: 7500 },
        { type: 'REBUY', memberGrade: 'VIP', price: 6500 },
        { type: 'REBUY', memberGrade: 'PREMIUM', price: 5500 },
      ],
    });
  }),

  http.post('/api/vouchers/purchase', async ({ request }) => {
    const url = new URL(request.url);
    const forceError = url.searchParams.get('forceError');
    
    if (forceError === 'unauthorized') {
      return HttpResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (forceError === 'insufficient_points') {
      return HttpResponse.json(
        { success: false, error: '포인트가 부족합니다' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    if (!body.type || !['BUYIN', 'REBUY'].includes(body.type)) {
      return HttpResponse.json(
        { success: false, error: 'Invalid voucher type' },
        { status: 400 }
      );
    }
    
    const quantity = body.quantity || 1;
    if (quantity < 1 || quantity > 10) {
      return HttpResponse.json(
        { success: false, error: 'Invalid quantity' },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));

    const vouchers = Array.from({ length: quantity }, (_, index) => ({
      id: faker.string.uuid(),
      code: `${body.type}-${faker.string.alphanumeric(6).toUpperCase()}`,
      type: body.type,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    return HttpResponse.json({
      success: true,
      data: {
        vouchers: quantity,
        transaction: faker.string.uuid(),
        remainingPoints: 45000, // Mock remaining balance
        voucherDetails: vouchers,
      },
    });
  }),

  // 사용자 프로필 API
  http.get('/api/members/profile', () => {
    return HttpResponse.json({
      success: true,
      data: mockUsers[0],
    });
  }),

  http.put('/api/members/profile', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: {
        ...mockUsers[0],
        ...body,
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  // 토너먼트 API
  http.get('/api/tournaments', () => {
    return HttpResponse.json({
      success: true,
      data: mockTournaments,
      pagination: {
        page: 1,
        limit: 10,
        total: mockTournaments.length,
        totalPages: 1,
      },
    });
  }),

  http.get('/api/tournaments/:id', ({ params }) => {
    const tournament = mockTournaments.find(t => t.id === params.id);
    if (!tournament) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({
      success: true,
      data: tournament,
    });
  }),

  // 관리자 API
  http.get('/api/admin/members', () => {
    return HttpResponse.json({
      success: true,
      data: mockUsers,
      pagination: {
        page: 1,
        limit: 10,
        total: mockUsers.length,
        totalPages: 1,
      },
    });
  }),

  http.get('/api/admin/members/:id', ({ params }) => {
    const user = mockUsers.find(u => u.id === params.id);
    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({
      success: true,
      data: user,
    });
  }),

  http.put('/api/admin/members/:id', async ({ params, request }) => {
    const body = await request.json();
    const userIndex = mockUsers.findIndex(u => u.id === params.id);
    
    if (userIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      data: mockUsers[userIndex],
    });
  }),

  http.post('/api/admin/points/adjust', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: {
        transactionId: faker.string.uuid(),
        userId: body.userId,
        amount: body.amount,
        type: body.type,
        description: body.description,
        status: 'COMPLETED',
      },
    });
  }),

  http.post('/api/admin/payments/confirm', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: {
        transactionId: body.transactionId,
        status: 'CONFIRMED',
        confirmedAt: new Date().toISOString(),
      },
    });
  }),

  // 테스트 데이터베이스 리셋 엔드포인트
  http.post('/api/test/reset-database', () => {
    // 실제로는 테스트 데이터베이스를 리셋하는 로직이 들어갑니다
    return HttpResponse.json({
      success: true,
      message: 'Database reset successfully',
    });
  }),

  http.post('/api/test/seed-database', () => {
    // 실제로는 테스트 데이터로 시드하는 로직이 들어갑니다
    return HttpResponse.json({
      success: true,
      message: 'Database seeded successfully',
    });
  }),

  // 404 처리
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return new HttpResponse(null, { status: 404 });
  }),
];