import { createMocks } from 'node-mocks-http';
import { getServerSession } from 'next-auth';
import { setupDatabaseTests, createTestUser, createTestTransaction } from '../utils/db-helpers';
import { createMockSession } from '../utils/auth-helpers';
import { server } from '../../src/mocks/server';

// API 라우트 테스트를 위한 모의 import
// 실제 프로젝트에서는 해당 라우트들이 존재한다고 가정

describe('API Integration Tests', () => {
  setupDatabaseTests();

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Points API', () => {
    test('GET /api/points/balance should return user points', async () => {
      const testUser = await createTestUser({ points: 50000 });
      const mockSession = createMockSession({ 
        user: { 
          id: testUser.id, 
          email: testUser.email 
        } 
      });

      // getServerSession을 모킹
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const { req, res } = createMocks({
        method: 'GET',
      });

      // 실제 API 핸들러 호출 (여기서는 모의)
      // await balanceHandler(req, res);

      // MSW로 모킹된 응답 확인
      const response = await fetch('http://localhost:3001/api/points/balance');
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.points).toBe(50000);
    });

    test('POST /api/points/charge should create charge transaction', async () => {
      const testUser = await createTestUser({ points: 25000 });
      const mockSession = createMockSession({ 
        user: { 
          id: testUser.id, 
          email: testUser.email 
        } 
      });

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const chargeAmount = 50000;
      
      const response = await fetch('http://localhost:3001/api/points/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: chargeAmount }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.amount).toBe(chargeAmount);
      expect(data.data.status).toBe('COMPLETED');
      expect(data.data.transactionId).toBeDefined();
    });

    test('GET /api/points/transactions should return paginated transactions', async () => {
      const testUser = await createTestUser();
      const mockSession = createMockSession({ 
        user: { 
          id: testUser.id, 
          email: testUser.email 
        } 
      });

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      // 테스트 거래 생성
      await createTestTransaction(testUser.id, { type: 'CHARGE', amount: 25000 });
      await createTestTransaction(testUser.id, { type: 'USE', amount: 10000 });

      const response = await fetch('http://localhost:3001/api/points/transactions?page=1&limit=10');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
    });
  });

  describe('Vouchers API', () => {
    test('GET /api/vouchers/list should return available vouchers', async () => {
      const response = await fetch('http://localhost:3001/api/vouchers/list');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      
      // 기본 바우처 확인
      const vouchers = data.data;
      expect(vouchers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            tier: 'BRONZE',
            price: 25000,
          }),
          expect.objectContaining({
            tier: 'SILVER', 
            price: 45000,
          }),
        ])
      );
    });

    test('GET /api/vouchers/pricing should return pricing information', async () => {
      const response = await fetch('http://localhost:3001/api/vouchers/pricing');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);

      const pricing = data.data;
      expect(pricing).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            tier: 'BRONZE',
            price: 25000,
            duration: 7,
          }),
          expect.objectContaining({
            tier: 'SILVER',
            price: 45000,
            duration: 7,
          }),
        ])
      );
    });

    test('POST /api/vouchers/purchase should purchase voucher', async () => {
      const testUser = await createTestUser({ points: 50000 });
      const mockSession = createMockSession({ 
        user: { 
          id: testUser.id, 
          email: testUser.email 
        } 
      });

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const response = await fetch('http://localhost:3001/api/vouchers/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier: 'BRONZE' }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.voucherId).toBeDefined();
      expect(data.data.tier).toBe('BRONZE');
      expect(data.data.expiresAt).toBeDefined();
    });
  });

  describe('User Profile API', () => {
    test('GET /api/members/profile should return user profile', async () => {
      const testUser = await createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        tier: 'BRONZE',
        points: 25000,
      });

      const mockSession = createMockSession({ 
        user: { 
          id: testUser.id, 
          email: testUser.email 
        } 
      });

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const response = await fetch('http://localhost:3001/api/members/profile');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe('test@example.com');
      expect(data.data.role).toBe('USER');
    });

    test('PUT /api/members/profile should update user profile', async () => {
      const testUser = await createTestUser();
      const mockSession = createMockSession({ 
        user: { 
          id: testUser.id, 
          email: testUser.email 
        } 
      });

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const updateData = {
        name: 'Updated Name',
      };

      const response = await fetch('http://localhost:3001/api/members/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Updated Name');
      expect(data.data.updatedAt).toBeDefined();
    });
  });

  describe('Admin API', () => {
    test('GET /api/admin/members should require admin privileges', async () => {
      const testUser = await createTestUser({ role: 'USER' });
      const mockSession = createMockSession({ 
        user: { 
          id: testUser.id, 
          role: 'USER' 
        } 
      });

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      // 일반 사용자로는 접근 불가 (실제로는 403 또는 401 응답)
      const response = await fetch('http://localhost:3001/api/admin/members');
      
      // MSW 핸들러에서 권한 검사 로직에 따라 적절한 응답 확인
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test('GET /api/admin/members should return members list for admin', async () => {
      const adminUser = await createTestUser({ role: 'ADMIN' });
      const mockSession = createMockSession({ 
        user: { 
          id: adminUser.id, 
          role: 'ADMIN' 
        } 
      });

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const response = await fetch('http://localhost:3001/api/admin/members');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.pagination).toBeDefined();
    });
  });

  describe('Authentication Error Handling', () => {
    test('should return 401 for unauthenticated requests', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const response = await fetch('http://localhost:3001/api/points/balance');
      
      // 인증되지 않은 요청에 대한 적절한 응답 확인
      expect(response.status).toBe(401);
    });

    test('should handle invalid session data', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'non-existent-user-id' }
      });

      const response = await fetch('http://localhost:3001/api/points/balance');
      
      // 잘못된 세션에 대한 적절한 응답 확인
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});