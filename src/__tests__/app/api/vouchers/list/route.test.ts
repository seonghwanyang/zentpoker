import { GET } from '@/app/api/vouchers/list/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import {
  createMockUser,
  createMockSession,
  createMockRequest,
  createMockVoucher,
  createMockTournament,
  testErrorScenarios,
  expectSuccessResponse,
  expectErrorResponse,
  runConcurrentRequests,
  measureResponseTime,
  performanceThresholds,
} from '../../../utils/test-helpers';

// Mocks
jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    voucher: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockPrismaUserFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>;
const mockPrismaVoucherFindMany = prisma.voucher.findMany as jest.MockedFunction<typeof prisma.voucher.findMany>;
const mockPrismaVoucherGroupBy = prisma.voucher.groupBy as jest.MockedFunction<typeof prisma.voucher.groupBy>;

describe('/api/vouchers/list', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    describe('Authentication Tests', () => {
      it('should return user vouchers for authenticated user', async () => {
        // Arrange
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        const mockVouchers = [
          createMockVoucher({ 
            id: 'voucher-1', 
            type: 'BUYIN', 
            status: 'ACTIVE',
            tournament: null
          }),
          createMockVoucher({ 
            id: 'voucher-2', 
            type: 'REBUY', 
            status: 'USED',
            tournament: createMockTournament({ id: 'tournament-1', title: 'Test Tournament' })
          }),
        ];
        const mockStats = [
          { type: 'BUYIN', status: 'ACTIVE', _count: 5 },
          { type: 'BUYIN', status: 'USED', _count: 2 },
          { type: 'REBUY', status: 'ACTIVE', _count: 3 },
          { type: 'REBUY', status: 'EXPIRED', _count: 1 },
        ];

        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);
        mockPrismaVoucherFindMany.mockResolvedValue(mockVouchers);
        mockPrismaVoucherGroupBy.mockResolvedValue(mockStats);

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list');

        // Act
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        
        expect(responseData.vouchers).toEqual(mockVouchers);
        expect(responseData.stats).toEqual({
          buyIn: { active: 5, used: 2, expired: 0 },
          rebuy: { active: 3, used: 0, expired: 1 }
        });

        // Verify database queries
        expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
          where: { email: mockUser.email },
        });
        expect(mockPrismaVoucherFindMany).toHaveBeenCalledWith({
          where: { userId: mockUser.id },
          include: {
            tournament: {
              select: {
                id: true,
                title: true,
                startDate: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        expect(mockPrismaVoucherGroupBy).toHaveBeenCalledWith({
          by: ['type', 'status'],
          where: { userId: mockUser.id },
          _count: true,
        });
      });

      it('should return 401 for unauthenticated user', async () => {
        // Arrange
        testErrorScenarios.unauthorized();
        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list');

        // Act
        const response = await GET(request);

        // Assert
        expectErrorResponse(response, 401, 'Unauthorized');
        expect(mockPrismaUserFindUnique).not.toHaveBeenCalled();
      });

      it('should return 401 when session has no email', async () => {
        // Arrange
        mockGetServerSession.mockResolvedValue({
          user: { name: 'Test User' },
          expires: '2024-12-31',
        } as any);

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list');

        // Act
        const response = await GET(request);

        // Assert
        expectErrorResponse(response, 401, 'Unauthorized');
      });
    });

    describe('User Validation Tests', () => {
      it('should return 404 when user not found in database', async () => {
        // Arrange
        testErrorScenarios.userNotFound();
        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list');

        // Act
        const response = await GET(request);

        // Assert
        expectErrorResponse(response, 404, 'User not found');
        expect(mockPrismaVoucherFindMany).not.toHaveBeenCalled();
      });
    });

    describe('Status Filter Tests', () => {
      beforeEach(() => {
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);
        mockPrismaVoucherGroupBy.mockResolvedValue([]);
      });

      it('should filter vouchers by ACTIVE status', async () => {
        // Arrange
        const activeVouchers = [
          createMockVoucher({ status: 'ACTIVE', type: 'BUYIN' }),
          createMockVoucher({ status: 'ACTIVE', type: 'REBUY' }),
        ];
        
        mockPrismaVoucherFindMany.mockResolvedValue(activeVouchers);

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list?status=ACTIVE');

        // Act
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(200);
        expect(mockPrismaVoucherFindMany).toHaveBeenCalledWith({
          where: { 
            userId: expect.any(String),
            status: 'ACTIVE'
          },
          include: expect.any(Object),
          orderBy: { createdAt: 'desc' },
        });
      });

      it('should filter vouchers by USED status', async () => {
        // Arrange
        const usedVouchers = [
          createMockVoucher({ status: 'USED', type: 'BUYIN' }),
        ];
        
        mockPrismaVoucherFindMany.mockResolvedValue(usedVouchers);

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list?status=USED');

        // Act
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(200);
        expect(mockPrismaVoucherFindMany).toHaveBeenCalledWith({
          where: { 
            userId: expect.any(String),
            status: 'USED'
          },
          include: expect.any(Object),
          orderBy: { createdAt: 'desc' },
        });
      });

      it('should filter vouchers by EXPIRED status', async () => {
        // Arrange
        const expiredVouchers = [
          createMockVoucher({ status: 'EXPIRED', type: 'REBUY' }),
        ];
        
        mockPrismaVoucherFindMany.mockResolvedValue(expiredVouchers);

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list?status=EXPIRED');

        // Act
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(200);
        expect(mockPrismaVoucherFindMany).toHaveBeenCalledWith({
          where: { 
            userId: expect.any(String),
            status: 'EXPIRED'
          },
          include: expect.any(Object),
          orderBy: { createdAt: 'desc' },
        });
      });

      it('should ignore invalid status filter', async () => {
        // Arrange
        mockPrismaVoucherFindMany.mockResolvedValue([]);

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list?status=INVALID_STATUS');

        // Act
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(200);
        // Should query without status filter when invalid status is provided
        expect(mockPrismaVoucherFindMany).toHaveBeenCalledWith({
          where: { userId: expect.any(String) },
          include: expect.any(Object),
          orderBy: { createdAt: 'desc' },
        });
      });

      it('should handle empty status parameter', async () => {
        // Arrange
        mockPrismaVoucherFindMany.mockResolvedValue([]);

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list?status=');

        // Act
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(200);
        expect(mockPrismaVoucherFindMany).toHaveBeenCalledWith({
          where: { userId: expect.any(String) },
          include: expect.any(Object),
          orderBy: { createdAt: 'desc' },
        });
      });
    });

    describe('Statistics Aggregation Tests', () => {
      beforeEach(() => {
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);
        mockPrismaVoucherFindMany.mockResolvedValue([]);
      });

      it('should correctly format statistics from grouped data', async () => {
        // Arrange
        const mockStats = [
          { type: 'BUYIN', status: 'ACTIVE', _count: 10 },
          { type: 'BUYIN', status: 'USED', _count: 5 },
          { type: 'BUYIN', status: 'EXPIRED', _count: 2 },
          { type: 'REBUY', status: 'ACTIVE', _count: 8 },
          { type: 'REBUY', status: 'USED', _count: 12 },
          { type: 'REBUY', status: 'EXPIRED', _count: 1 },
        ];
        
        mockPrismaVoucherGroupBy.mockResolvedValue(mockStats);

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list');

        // Act
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        
        expect(responseData.stats).toEqual({
          buyIn: { active: 10, used: 5, expired: 2 },
          rebuy: { active: 8, used: 12, expired: 1 }
        });
      });

      it('should handle empty statistics gracefully', async () => {
        // Arrange
        mockPrismaVoucherGroupBy.mockResolvedValue([]);

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list');

        // Act
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        
        expect(responseData.stats).toEqual({
          buyIn: { active: 0, used: 0, expired: 0 },
          rebuy: { active: 0, used: 0, expired: 0 }
        });
      });

      it('should handle partial statistics data', async () => {
        // Arrange
        const mockStats = [
          { type: 'BUYIN', status: 'ACTIVE', _count: 3 },
          { type: 'REBUY', status: 'EXPIRED', _count: 1 },
        ];
        
        mockPrismaVoucherGroupBy.mockResolvedValue(mockStats);

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list');

        // Act
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        
        expect(responseData.stats).toEqual({
          buyIn: { active: 3, used: 0, expired: 0 },
          rebuy: { active: 0, used: 0, expired: 1 }
        });
      });
    });

    describe('Data Integrity Tests', () => {
      it('should include tournament information for used vouchers', async () => {
        // Arrange
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        const mockTournament = createMockTournament();
        const mockVouchers = [
          createMockVoucher({ 
            status: 'USED',
            tournament: mockTournament
          }),
          createMockVoucher({ 
            status: 'ACTIVE',
            tournament: null
          }),
        ];

        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);
        mockPrismaVoucherFindMany.mockResolvedValue(mockVouchers);
        mockPrismaVoucherGroupBy.mockResolvedValue([]);

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list');

        // Act
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        
        const usedVoucher = responseData.vouchers.find((v: any) => v.status === 'USED');
        const activeVoucher = responseData.vouchers.find((v: any) => v.status === 'ACTIVE');
        
        expect(usedVoucher.tournament).toEqual(mockTournament);
        expect(activeVoucher.tournament).toBeNull();
      });

      it('should order vouchers by creation date descending', async () => {
        // Arrange
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);
        mockPrismaVoucherFindMany.mockResolvedValue([]);
        mockPrismaVoucherGroupBy.mockResolvedValue([]);

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list');

        // Act
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(200);
        expect(mockPrismaVoucherFindMany).toHaveBeenCalledWith({
          where: expect.any(Object),
          include: expect.any(Object),
          orderBy: { createdAt: 'desc' },
        });
      });
    });

    describe('Error Handling Tests', () => {
      beforeEach(() => {
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);
      });

      it('should handle database error in voucher query', async () => {
        // Arrange
        mockPrismaVoucherFindMany.mockRejectedValue(new Error('Database connection failed'));
        mockPrismaVoucherGroupBy.mockResolvedValue([]);

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list');

        // Act
        const response = await GET(request);

        // Assert
        expectErrorResponse(response, 500, 'Internal server error');
      });

      it('should handle database error in statistics query', async () => {
        // Arrange
        mockPrismaVoucherFindMany.mockResolvedValue([]);
        mockPrismaVoucherGroupBy.mockRejectedValue(new Error('Statistics query failed'));

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list');

        // Act
        const response = await GET(request);

        // Assert
        expectErrorResponse(response, 500, 'Internal server error');
      });

      it('should handle authentication session error', async () => {
        // Arrange
        mockGetServerSession.mockRejectedValue(new Error('Session error'));

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list');

        // Act
        const response = await GET(request);

        // Assert
        expectErrorResponse(response, 500, 'Internal server error');
      });
    });

    describe('Performance Tests', () => {
      it('should respond within acceptable time limit', async () => {
        // Arrange
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        const mockVouchers = Array(50).fill(null).map((_, i) => 
          createMockVoucher({ id: `voucher-${i}` })
        );
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);
        mockPrismaVoucherFindMany.mockResolvedValue(mockVouchers);
        mockPrismaVoucherGroupBy.mockResolvedValue([]);

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list');

        // Act
        const { response, duration } = await measureResponseTime(async () => await GET(request));

        // Assert
        expect(response.status).toBe(200);
        expect(duration).toBeLessThan(performanceThresholds.medium);
      });

      it('should handle concurrent requests efficiently', async () => {
        // Arrange
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        const mockVouchers = [createMockVoucher()];
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);
        mockPrismaVoucherFindMany.mockResolvedValue(mockVouchers);
        mockPrismaVoucherGroupBy.mockResolvedValue([]);

        // Act
        const results = await runConcurrentRequests(async () => {
          const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list');
          return await GET(request);
        }, 5);

        // Assert
        const successfulResults = results.filter(result => 
          result.status === 'fulfilled'
        ) as PromiseFulfilledResult<Response>[];
        
        expect(successfulResults).toHaveLength(5);
        
        for (const result of successfulResults) {
          expect(result.value.status).toBe(200);
        }
      });
    });

    describe('Security Tests', () => {
      it('should only return vouchers belonging to authenticated user', async () => {
        // Arrange
        const mockUser = createMockUser({ id: 'user-123' });
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);
        mockPrismaVoucherFindMany.mockResolvedValue([]);
        mockPrismaVoucherGroupBy.mockResolvedValue([]);

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list');

        // Act
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(200);
        expect(mockPrismaVoucherFindMany).toHaveBeenCalledWith({
          where: { userId: 'user-123' },
          include: expect.any(Object),
          orderBy: expect.any(Object),
        });
        expect(mockPrismaVoucherGroupBy).toHaveBeenCalledWith({
          by: expect.any(Array),
          where: { userId: 'user-123' },
          _count: true,
        });
      });

      it('should handle status injection attempts', async () => {
        // Arrange
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);
        mockPrismaVoucherFindMany.mockResolvedValue([]);
        mockPrismaVoucherGroupBy.mockResolvedValue([]);

        const maliciousStatuses = [
          "'; DROP TABLE vouchers; --",
          '<script>alert("xss")</script>',
          'ACTIVE OR 1=1',
          '1; DELETE FROM vouchers WHERE 1=1; --',
        ];

        // Act & Assert
        for (const maliciousStatus of maliciousStatuses) {
          const request = createMockRequest('GET', 
            `http://localhost:3000/api/vouchers/list?status=${encodeURIComponent(maliciousStatus)}`
          );
          
          const response = await GET(request);
          
          expect(response.status).toBe(200);
          // Should filter out invalid status and not include it in query
          expect(mockPrismaVoucherFindMany).toHaveBeenCalledWith({
            where: { userId: expect.any(String) },
            include: expect.any(Object),
            orderBy: expect.any(Object),
          });
        }
      });
    });

    describe('Response Format Tests', () => {
      it('should return response with correct structure', async () => {
        // Arrange
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        const mockVouchers = [createMockVoucher()];
        const mockStats = [
          { type: 'BUYIN', status: 'ACTIVE', _count: 1 },
        ];
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);
        mockPrismaVoucherFindMany.mockResolvedValue(mockVouchers);
        mockPrismaVoucherGroupBy.mockResolvedValue(mockStats);

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list');

        // Act
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        
        expect(responseData).toHaveProperty('vouchers');
        expect(responseData).toHaveProperty('stats');
        expect(Array.isArray(responseData.vouchers)).toBe(true);
        expect(typeof responseData.stats).toBe('object');
        expect(responseData.stats).toHaveProperty('buyIn');
        expect(responseData.stats).toHaveProperty('rebuy');
      });

      it('should return valid JSON with correct content type', async () => {
        // Arrange
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);
        mockPrismaVoucherFindMany.mockResolvedValue([]);
        mockPrismaVoucherGroupBy.mockResolvedValue([]);

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list');

        // Act
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('application/json');
        
        // Should be valid JSON
        const responseData = await response.json();
        expect(typeof responseData).toBe('object');
      });
    });

    describe('Edge Cases', () => {
      it('should handle user with no vouchers', async () => {
        // Arrange
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);
        mockPrismaVoucherFindMany.mockResolvedValue([]);
        mockPrismaVoucherGroupBy.mockResolvedValue([]);

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list');

        // Act
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        
        expect(responseData.vouchers).toEqual([]);
        expect(responseData.stats).toEqual({
          buyIn: { active: 0, used: 0, expired: 0 },
          rebuy: { active: 0, used: 0, expired: 0 }
        });
      });

      it('should handle malformed URL parameters gracefully', async () => {
        // Arrange
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);
        mockPrismaVoucherFindMany.mockResolvedValue([]);
        mockPrismaVoucherGroupBy.mockResolvedValue([]);

        const request = createMockRequest('GET', 'http://localhost:3000/api/vouchers/list?status=%20&type=invalid');

        // Act
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(200);
        // Should handle malformed parameters gracefully without crashing
      });
    });
  });
});