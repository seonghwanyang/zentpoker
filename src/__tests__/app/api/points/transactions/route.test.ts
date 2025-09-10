import { GET } from '@/app/api/points/transactions/route';

// Mock dependencies
jest.mock('@/lib/api/middleware');
jest.mock('@/lib/prisma');

describe('/api/points/transactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return user transactions successfully', async () => {
      const { requireAuth, createSuccessResponse } = require('@/lib/api/middleware');
      const { prisma } = require('@/lib/prisma');

      const mockUser = createMockUser();
      const mockTransactions = [
        createMockTransaction({ type: 'CHARGE', amount: 25000 }),
        createMockTransaction({ type: 'PAYMENT', amount: -5000 }),
        createMockTransaction({ type: 'REFUND', amount: 2000 }),
      ];

      requireAuth.mockResolvedValue(mockUser);
      prisma.transaction.findMany.mockResolvedValue(mockTransactions);
      createSuccessResponse.mockReturnValue(new Response());

      const request = createMockApiRequest('GET', 'http://localhost:3000/api/points/transactions');

      await GET(request);

      expect(requireAuth).toHaveBeenCalledWith(request);
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });
      expect(createSuccessResponse).toHaveBeenCalledWith({
        transactions: mockTransactions,
        meta: {
          page: 1,
          limit: 50,
          total: mockTransactions.length,
        },
      });
    });

    it('should handle pagination parameters', async () => {
      const { requireAuth, createSuccessResponse } = require('@/lib/api/middleware');
      const { prisma } = require('@/lib/prisma');

      const mockUser = createMockUser();
      const mockTransactions = [createMockTransaction()];

      requireAuth.mockResolvedValue(mockUser);
      prisma.transaction.findMany.mockResolvedValue(mockTransactions);
      prisma.transaction.count.mockResolvedValue(100);
      createSuccessResponse.mockReturnValue(new Response());

      const request = createMockApiRequest(
        'GET', 
        'http://localhost:3000/api/points/transactions?page=2&limit=10'
      );

      await GET(request);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 10,
      });
      expect(prisma.transaction.count).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
      expect(createSuccessResponse).toHaveBeenCalledWith({
        transactions: mockTransactions,
        meta: {
          page: 2,
          limit: 10,
          total: 100,
        },
      });
    });

    it('should filter transactions by type', async () => {
      const { requireAuth, createSuccessResponse } = require('@/lib/api/middleware');
      const { prisma } = require('@/lib/prisma');

      const mockUser = createMockUser();
      const mockTransactions = [createMockTransaction({ type: 'CHARGE' })];

      requireAuth.mockResolvedValue(mockUser);
      prisma.transaction.findMany.mockResolvedValue(mockTransactions);
      createSuccessResponse.mockReturnValue(new Response());

      const request = createMockApiRequest(
        'GET',
        'http://localhost:3000/api/points/transactions?type=CHARGE'
      );

      await GET(request);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { 
          userId: mockUser.id,
          type: 'CHARGE'
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });
    });

    it('should filter transactions by status', async () => {
      const { requireAuth, createSuccessResponse } = require('@/lib/api/middleware');
      const { prisma } = require('@/lib/prisma');

      const mockUser = createMockUser();
      const mockTransactions = [createMockTransaction({ status: 'COMPLETED' })];

      requireAuth.mockResolvedValue(mockUser);
      prisma.transaction.findMany.mockResolvedValue(mockTransactions);
      createSuccessResponse.mockReturnValue(new Response());

      const request = createMockApiRequest(
        'GET',
        'http://localhost:3000/api/points/transactions?status=COMPLETED'
      );

      await GET(request);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { 
          userId: mockUser.id,
          status: 'COMPLETED'
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });
    });

    it('should filter transactions by date range', async () => {
      const { requireAuth, createSuccessResponse } = require('@/lib/api/middleware');
      const { prisma } = require('@/lib/prisma');

      const mockUser = createMockUser();
      const mockTransactions = [createMockTransaction()];

      requireAuth.mockResolvedValue(mockUser);
      prisma.transaction.findMany.mockResolvedValue(mockTransactions);
      createSuccessResponse.mockReturnValue(new Response());

      const fromDate = '2024-01-01';
      const toDate = '2024-01-31';
      const request = createMockApiRequest(
        'GET',
        `http://localhost:3000/api/points/transactions?from=${fromDate}&to=${toDate}`
      );

      await GET(request);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { 
          userId: mockUser.id,
          createdAt: {
            gte: new Date(fromDate),
            lte: new Date(toDate),
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });
    });

    it('should handle empty results', async () => {
      const { requireAuth, createSuccessResponse } = require('@/lib/api/middleware');
      const { prisma } = require('@/lib/prisma');

      const mockUser = createMockUser();

      requireAuth.mockResolvedValue(mockUser);
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.transaction.count.mockResolvedValue(0);
      createSuccessResponse.mockReturnValue(new Response());

      const request = createMockApiRequest('GET', 'http://localhost:3000/api/points/transactions');

      await GET(request);

      expect(createSuccessResponse).toHaveBeenCalledWith({
        transactions: [],
        meta: {
          page: 1,
          limit: 50,
          total: 0,
        },
      });
    });

    it('should handle unauthenticated request', async () => {
      const { requireAuth, ApiError } = require('@/lib/api/middleware');

      requireAuth.mockRejectedValue(new ApiError('Unauthorized', 401));

      const request = createMockApiRequest('GET', 'http://localhost:3000/api/points/transactions');

      await expect(GET(request)).rejects.toThrow(ApiError);
    });

    it('should validate pagination limits', async () => {
      const { requireAuth, createSuccessResponse } = require('@/lib/api/middleware');
      const { prisma } = require('@/lib/prisma');

      const mockUser = createMockUser();
      const mockTransactions = [createMockTransaction()];

      requireAuth.mockResolvedValue(mockUser);
      prisma.transaction.findMany.mockResolvedValue(mockTransactions);
      createSuccessResponse.mockReturnValue(new Response());

      // Test with excessive limit
      const request = createMockApiRequest(
        'GET',
        'http://localhost:3000/api/points/transactions?limit=200'
      );

      await GET(request);

      // Should cap at 100 max
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        orderBy: { createdAt: 'desc' },
        take: 100,
        skip: 0,
      });
    });

    it('should handle database errors', async () => {
      const { requireAuth } = require('@/lib/api/middleware');
      const { prisma } = require('@/lib/prisma');

      const mockUser = createMockUser();

      requireAuth.mockResolvedValue(mockUser);
      prisma.transaction.findMany.mockRejectedValue(new Error('Database connection error'));

      const request = createMockApiRequest('GET', 'http://localhost:3000/api/points/transactions');

      await expect(GET(request)).rejects.toThrow('Database connection error');
    });

    it('should handle multiple filters combined', async () => {
      const { requireAuth, createSuccessResponse } = require('@/lib/api/middleware');
      const { prisma } = require('@/lib/prisma');

      const mockUser = createMockUser();
      const mockTransactions = [createMockTransaction()];

      requireAuth.mockResolvedValue(mockUser);
      prisma.transaction.findMany.mockResolvedValue(mockTransactions);
      createSuccessResponse.mockReturnValue(new Response());

      const request = createMockApiRequest(
        'GET',
        'http://localhost:3000/api/points/transactions?type=CHARGE&status=COMPLETED&page=2&limit=20'
      );

      await GET(request);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { 
          userId: mockUser.id,
          type: 'CHARGE',
          status: 'COMPLETED'
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 20,
      });
    });
  });
});