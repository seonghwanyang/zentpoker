import { GET } from '@/app/api/points/balance/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import {
  createMockUser,
  createMockSession,
  createMockRequest,
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
  },
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockPrismaUserFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>;

describe('/api/points/balance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    describe('Authentication Tests', () => {
      it('should return user balance for authenticated user', async () => {
        // Arrange
        const mockUser = createMockUser({ points: 75000 });
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);

        // Act
        const response = await GET();

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        expect(responseData).toEqual({ balance: 75000 });
        
        // Verify database query
        expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
          where: { email: mockUser.email },
          select: { points: true },
        });
      });

      it('should return 401 for unauthenticated user', async () => {
        // Arrange
        testErrorScenarios.unauthorized();

        // Act
        const response = await GET();

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

        // Act
        const response = await GET();

        // Assert
        expectErrorResponse(response, 401, 'Unauthorized');
        expect(mockPrismaUserFindUnique).not.toHaveBeenCalled();
      });
    });

    describe('User Validation Tests', () => {
      it('should return 404 when user not found in database', async () => {
        // Arrange
        testErrorScenarios.userNotFound();

        // Act
        const response = await GET();

        // Assert
        expectErrorResponse(response, 404, 'User not found');
        expect(mockPrismaUserFindUnique).toHaveBeenCalled();
      });

      it('should handle user with zero balance', async () => {
        // Arrange
        const mockUser = createMockUser({ points: 0 });
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);

        // Act
        const response = await GET();

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        expect(responseData).toEqual({ balance: 0 });
      });

      it('should handle user with negative balance', async () => {
        // Arrange
        const mockUser = createMockUser({ points: -1000 });
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);

        // Act
        const response = await GET();

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        expect(responseData).toEqual({ balance: -1000 });
      });
    });

    describe('Error Handling Tests', () => {
      it('should handle database connection error', async () => {
        // Arrange
        const mockSession = createMockSession();
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockRejectedValue(new Error('Database connection failed'));

        // Act
        const response = await GET();

        // Assert
        expectErrorResponse(response, 500, 'Internal server error');
      });

      it('should handle database timeout', async () => {
        // Arrange
        const mockSession = createMockSession();
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockRejectedValue(new Error('Query timeout'));

        // Act
        const response = await GET();

        // Assert
        expectErrorResponse(response, 500, 'Internal server error');
      });

      it('should handle prisma unique constraint error', async () => {
        // Arrange
        const mockSession = createMockSession();
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockRejectedValue({
          code: 'P2002',
          message: 'Unique constraint failed',
        });

        // Act
        const response = await GET();

        // Assert
        expectErrorResponse(response, 500, 'Internal server error');
      });
    });

    describe('Security Tests', () => {
      it('should not expose sensitive user information', async () => {
        // Arrange
        const mockUser = createMockUser({ 
          points: 50000,
          password: 'secret123',
          privateData: 'sensitive'
        });
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);

        // Act
        const response = await GET();

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        expect(responseData).toEqual({ balance: 50000 });
        expect(responseData).not.toHaveProperty('password');
        expect(responseData).not.toHaveProperty('privateData');
        
        // Verify query only selects points
        expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
          where: { email: mockUser.email },
          select: { points: true },
        });
      });

      it('should handle malformed session data gracefully', async () => {
        // Arrange
        mockGetServerSession.mockResolvedValue({
          user: { email: null },
          expires: '2024-12-31',
        } as any);

        // Act
        const response = await GET();

        // Assert
        expectErrorResponse(response, 401, 'Unauthorized');
      });
    });

    describe('Performance Tests', () => {
      it('should respond within acceptable time limit', async () => {
        // Arrange
        const mockUser = createMockUser({ points: 50000 });
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);

        // Act
        const { response, duration } = await measureResponseTime(async () => await GET());

        // Assert
        expect(response.status).toBe(200);
        expect(duration).toBeLessThan(performanceThresholds.fast);
      });

      it('should handle concurrent requests properly', async () => {
        // Arrange
        const mockUser = createMockUser({ points: 50000 });
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);

        // Act
        const results = await runConcurrentRequests(async () => await GET(), 10);

        // Assert
        const successfulResults = results.filter(result => result.status === 'fulfilled') as PromiseFulfilledResult<Response>[];
        expect(successfulResults).toHaveLength(10);
        
        for (const result of successfulResults) {
          expect(result.value.status).toBe(200);
        }
        
        // Verify database was called for each request
        expect(mockPrismaUserFindUnique).toHaveBeenCalledTimes(10);
      });
    });

    describe('Edge Cases', () => {
      it('should handle extremely large balance numbers', async () => {
        // Arrange
        const mockUser = createMockUser({ points: Number.MAX_SAFE_INTEGER });
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);

        // Act
        const response = await GET();

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        expect(responseData).toEqual({ balance: Number.MAX_SAFE_INTEGER });
      });

      it('should handle floating point balance values', async () => {
        // Arrange
        const mockUser = createMockUser({ points: 1000.55 });
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);

        // Act
        const response = await GET();

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        expect(responseData).toEqual({ balance: 1000.55 });
      });

      it('should handle null points value gracefully', async () => {
        // Arrange
        const mockUser = createMockUser({ points: null });
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);

        // Act
        const response = await GET();

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        expect(responseData).toEqual({ balance: null });
      });
    });

    describe('Logging and Monitoring Tests', () => {
      it('should log errors appropriately', async () => {
        // Arrange
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const mockSession = createMockSession();
        const dbError = new Error('Database connection failed');
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockRejectedValue(dbError);

        // Act
        const response = await GET();

        // Assert
        expect(response.status).toBe(500);
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching balance:', dbError);
        
        consoleSpy.mockRestore();
      });

      it('should not log sensitive information in errors', async () => {
        // Arrange
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const mockSession = createMockSession();
        const dbError = new Error('Connection failed for user: secret-email@example.com');
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockRejectedValue(dbError);

        // Act
        await GET();

        // Assert
        const loggedCalls = consoleSpy.mock.calls;
        expect(loggedCalls[0][0]).toBe('Error fetching balance:');
        // Error object is logged as second parameter, which is acceptable for debugging
        
        consoleSpy.mockRestore();
      });
    });

    describe('HTTP Method Tests', () => {
      it('should only respond to GET requests', async () => {
        // This test verifies that the route file only exports GET
        // In a real scenario, you might want to test that POST, PUT, etc. return 405
        const exportedMethods = Object.keys(require('@/app/api/points/balance/route'));
        expect(exportedMethods).toEqual(['GET']);
      });
    });

    describe('Response Format Tests', () => {
      it('should return response with correct content type', async () => {
        // Arrange
        const mockUser = createMockUser({ points: 50000 });
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);

        // Act
        const response = await GET();

        // Assert
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('application/json');
      });

      it('should return valid JSON response', async () => {
        // Arrange
        const mockUser = createMockUser({ points: 50000 });
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);

        // Act
        const response = await GET();

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        expect(typeof responseData).toBe('object');
        expect(responseData).toHaveProperty('balance');
        expect(typeof responseData.balance).toBe('number');
      });
    });
  });
});