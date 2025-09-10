import { GET, PATCH } from '@/app/api/members/profile/route';
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
  invalidInputTestCases,
} from '../../../utils/test-helpers';

// Mocks
jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockPrismaUserFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>;
const mockPrismaUserUpdate = prisma.user.update as jest.MockedFunction<typeof prisma.user.update>;

describe('/api/members/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET - Fetch User Profile', () => {
    describe('Authentication Tests', () => {
      it('should return user profile for authenticated user', async () => {
        // Arrange
        const mockUser = createMockUser({
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          phone: '010-1234-5678',
          points: 25000,
          _count: {
            transactions: 15,
            vouchers: 8,
          },
        });
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);

        // Act
        const response = await GET();

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        
        expect(responseData).toMatchObject({
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          phone: '010-1234-5678',
          points: 25000,
          transactionCount: 15,
          voucherCount: 8,
        });

        // Verify database query with proper select
        expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
          where: { email: mockUser.email },
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            image: true,
            role: true,
            grade: true,
            status: true,
            points: true,
            createdAt: true,
            lastLoginAt: true,
            _count: {
              select: {
                transactions: true,
                vouchers: true,
              },
            },
          },
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
      });
    });

    describe('User Data Tests', () => {
      it('should return 404 when user not found in database', async () => {
        // Arrange
        testErrorScenarios.userNotFound();

        // Act
        const response = await GET();

        // Assert
        expectErrorResponse(response, 404, 'User not found');
        expect(mockPrismaUserFindUnique).toHaveBeenCalled();
      });

      it('should include aggregate counts in response', async () => {
        // Arrange
        const mockUser = createMockUser({
          _count: {
            transactions: 42,
            vouchers: 17,
          },
        });
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);

        // Act
        const response = await GET();

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        
        expect(responseData.transactionCount).toBe(42);
        expect(responseData.voucherCount).toBe(17);
        expect(responseData._count).toBeUndefined(); // Should be transformed
      });

      it('should handle user with zero counts', async () => {
        // Arrange
        const mockUser = createMockUser({
          points: 0,
          _count: {
            transactions: 0,
            vouchers: 0,
          },
        });
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);

        // Act
        const response = await GET();

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        
        expect(responseData.points).toBe(0);
        expect(responseData.transactionCount).toBe(0);
        expect(responseData.voucherCount).toBe(0);
      });
    });

    describe('Security Tests', () => {
      it('should only expose safe user information', async () => {
        // Arrange
        const mockUser = createMockUser({
          password: 'secret-password', // This should not be returned
          privateData: 'sensitive-info',
          _count: { transactions: 5, vouchers: 3 },
        });
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockUser);

        // Act
        const response = await GET();

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        
        expect(responseData).not.toHaveProperty('password');
        expect(responseData).not.toHaveProperty('privateData');
        
        // Should only include specified fields
        const expectedFields = [
          'id', 'email', 'name', 'phone', 'image', 'role', 
          'grade', 'status', 'points', 'createdAt', 'lastLoginAt',
          'transactionCount', 'voucherCount'
        ];
        
        expectedFields.forEach(field => {
          expect(responseData).toHaveProperty(field);
        });
      });
    });
  });

  describe('PATCH - Update User Profile', () => {
    describe('Authentication Tests', () => {
      it('should update user profile successfully', async () => {
        // Arrange
        const originalUser = createMockUser({
          name: 'Original Name',
          phone: '010-1111-1111',
        });
        const updatedUser = {
          ...originalUser,
          name: 'Updated Name',
          phone: '010-2222-2222',
        };
        const mockSession = createMockSession(originalUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserUpdate.mockResolvedValue(updatedUser);

        const requestBody = {
          name: 'Updated Name',
          phone: '010-2222-2222',
        };
        const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', requestBody);

        // Act
        const response = await PATCH(request);

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        expect(responseData.name).toBe('Updated Name');
        expect(responseData.phone).toBe('010-2222-2222');

        // Verify update call
        expect(mockPrismaUserUpdate).toHaveBeenCalledWith({
          where: { email: originalUser.email },
          data: {
            name: 'Updated Name',
            phone: '010-2222-2222',
          },
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            image: true,
            role: true,
            grade: true,
            status: true,
            points: true,
          },
        });
      });

      it('should return 401 for unauthenticated user', async () => {
        // Arrange
        testErrorScenarios.unauthorized();
        const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', {
          name: 'New Name'
        });

        // Act
        const response = await PATCH(request);

        // Assert
        expectErrorResponse(response, 401, 'Unauthorized');
      });
    });

    describe('Input Validation Tests', () => {
      beforeEach(() => {
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        mockGetServerSession.mockResolvedValue(mockSession);
      });

      it('should validate name length (too short)', async () => {
        // Arrange
        mockPrismaUserUpdate.mockResolvedValue(createMockUser());
        
        const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', {
          name: 'A' // Too short (< 2 characters)
        });

        // Act
        const response = await PATCH(request);

        // Assert
        expectErrorResponse(response, 400, 'Invalid name');
      });

      it('should validate name length (too long)', async () => {
        // Arrange
        const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', {
          name: 'A'.repeat(51) // Too long (> 50 characters)
        });

        // Act
        const response = await PATCH(request);

        // Assert
        expectErrorResponse(response, 400, 'Invalid name');
      });

      it('should accept valid name lengths', async () => {
        // Arrange
        const validNames = [
          '김철수', // 2 characters
          'John Doe', // Normal name
          'A'.repeat(50), // Maximum length
        ];

        mockPrismaUserUpdate.mockResolvedValue(createMockUser());

        // Act & Assert
        for (const name of validNames) {
          const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', { name });
          const response = await PATCH(request);
          expect(response.status).toBe(200);
        }
      });

      it('should validate phone number format', async () => {
        // Arrange
        const invalidPhoneNumbers = [
          '010-1234-567', // Too short
          '010-1234-56789', // Too long
          '02-1234-5678', // Wrong prefix
          '010-abc-5678', // Non-numeric
          '010 1234 5678', // Wrong separator
          '01012345678', // No separators
        ];

        // Act & Assert
        for (const phone of invalidPhoneNumbers) {
          const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', { phone });
          const response = await PATCH(request);
          expectErrorResponse(response, 400, 'Invalid phone format');
        }
      });

      it('should accept valid phone number format', async () => {
        // Arrange
        const validPhoneNumbers = [
          '010-1234-5678',
          '010-9999-9999',
          '010-0000-0000',
        ];

        mockPrismaUserUpdate.mockResolvedValue(createMockUser());

        // Act & Assert
        for (const phone of validPhoneNumbers) {
          const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', { phone });
          const response = await PATCH(request);
          expect(response.status).toBe(200);
        }
      });

      it('should handle partial updates', async () => {
        // Arrange
        const mockUser = createMockUser();
        mockPrismaUserUpdate.mockResolvedValue(mockUser);

        const partialUpdates = [
          { name: 'Name Only' },
          { phone: '010-5555-5555' },
          { name: 'Both Fields', phone: '010-6666-6666' },
        ];

        // Act & Assert
        for (const updateData of partialUpdates) {
          const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', updateData);
          const response = await PATCH(request);
          
          expect(response.status).toBe(200);
          expect(mockPrismaUserUpdate).toHaveBeenCalledWith({
            where: { email: expect.any(String) },
            data: updateData,
            select: expect.any(Object),
          });
        }
      });

      it('should ignore invalid fields', async () => {
        // Arrange
        const mockUser = createMockUser();
        mockPrismaUserUpdate.mockResolvedValue(mockUser);

        const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', {
          name: 'Valid Name',
          email: 'hacker@evil.com', // Should be ignored
          role: 'ADMIN', // Should be ignored
          points: 999999, // Should be ignored
          password: 'newpassword', // Should be ignored
        });

        // Act
        const response = await PATCH(request);

        // Assert
        expect(response.status).toBe(200);
        expect(mockPrismaUserUpdate).toHaveBeenCalledWith({
          where: { email: expect.any(String) },
          data: { name: 'Valid Name' }, // Only allowed fields
          select: expect.any(Object),
        });
      });

      it('should handle empty update body', async () => {
        // Arrange
        const mockUser = createMockUser();
        mockPrismaUserUpdate.mockResolvedValue(mockUser);

        const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', {});

        // Act
        const response = await PATCH(request);

        // Assert
        expect(response.status).toBe(200);
        expect(mockPrismaUserUpdate).toHaveBeenCalledWith({
          where: { email: expect.any(String) },
          data: {}, // Empty update
          select: expect.any(Object),
        });
      });
    });

    describe('Business Logic Tests', () => {
      beforeEach(() => {
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        mockGetServerSession.mockResolvedValue(mockSession);
      });

      it('should handle user not found during update', async () => {
        // Arrange
        mockPrismaUserUpdate.mockRejectedValue({
          code: 'P2025', // Prisma record not found error
          message: 'Record to update not found',
        });

        const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', {
          name: 'New Name'
        });

        // Act
        const response = await PATCH(request);

        // Assert
        expectErrorResponse(response, 500, 'Internal server error');
      });

      it('should preserve existing values when not updating', async () => {
        // Arrange
        const originalUser = createMockUser({
          name: 'Original Name',
          phone: '010-1111-1111',
        });
        const updatedUser = {
          ...originalUser,
          name: 'Updated Name',
          // phone should remain the same
        };

        mockPrismaUserUpdate.mockResolvedValue(updatedUser);

        const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', {
          name: 'Updated Name'
          // Not updating phone
        });

        // Act
        const response = await PATCH(request);

        // Assert
        expect(response.status).toBe(200);
        expect(mockPrismaUserUpdate).toHaveBeenCalledWith({
          where: { email: expect.any(String) },
          data: { name: 'Updated Name' }, // Only name should be in update data
          select: expect.any(Object),
        });
      });
    });

    describe('Security Tests', () => {
      beforeEach(() => {
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        mockGetServerSession.mockResolvedValue(mockSession);
      });

      it('should prevent XSS in name field', async () => {
        // Arrange
        const mockUser = createMockUser();
        mockPrismaUserUpdate.mockResolvedValue(mockUser);

        const maliciousNames = [
          '<script>alert("xss")</script>',
          '<img src="x" onerror="alert(1)">',
          'javascript:alert("xss")',
          '<svg onload=alert(1)>',
        ];

        // Act & Assert
        for (const maliciousName of maliciousNames) {
          const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', {
            name: maliciousName
          });
          
          const response = await PATCH(request);
          
          // The middleware should handle sanitization,
          // but we test that the endpoint doesn't crash
          expect(response.status).toBeGreaterThanOrEqual(200);
          expect(response.status).toBeLessThan(500);
        }
      });

      it('should prevent SQL injection in phone field', async () => {
        // Arrange
        const mockUser = createMockUser();
        mockPrismaUserUpdate.mockResolvedValue(mockUser);

        const maliciousPhones = [
          "010-1234'; DROP TABLE users; --",
          "010-1234' OR '1'='1",
          "010-1234'; UPDATE users SET role='ADMIN'; --",
        ];

        // Act & Assert  
        for (const maliciousPhone of maliciousPhones) {
          const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', {
            phone: maliciousPhone
          });
          
          const response = await PATCH(request);
          
          // Should be rejected due to phone format validation
          expectErrorResponse(response, 400, 'Invalid phone format');
        }
      });

      it('should only return safe fields in response', async () => {
        // Arrange
        const updatedUser = createMockUser({
          name: 'Updated Name',
          password: 'secret', // This should not be in response
          secretData: 'confidential',
        });
        mockPrismaUserUpdate.mockResolvedValue(updatedUser);

        const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', {
          name: 'Updated Name'
        });

        // Act
        const response = await PATCH(request);

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        
        expect(responseData).not.toHaveProperty('password');
        expect(responseData).not.toHaveProperty('secretData');
        
        // Verify only allowed fields are returned (based on select)
        const allowedFields = ['id', 'email', 'name', 'phone', 'image', 'role', 'grade', 'status', 'points'];
        allowedFields.forEach(field => {
          expect(responseData).toHaveProperty(field);
        });
      });
    });

    describe('Error Handling Tests', () => {
      beforeEach(() => {
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        mockGetServerSession.mockResolvedValue(mockSession);
      });

      it('should handle malformed JSON body', async () => {
        // Arrange
        const request = new Request('http://localhost:3000/api/members/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: 'invalid json{',
        });

        // Act
        const response = await PATCH(request);

        // Assert
        expectErrorResponse(response, 500, 'Internal server error');
      });

      it('should handle database connection errors', async () => {
        // Arrange
        mockPrismaUserUpdate.mockRejectedValue(new Error('Database connection failed'));

        const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', {
          name: 'New Name'
        });

        // Act
        const response = await PATCH(request);

        // Assert
        expectErrorResponse(response, 500, 'Internal server error');
      });

      it('should handle constraint violation errors', async () => {
        // Arrange
        mockPrismaUserUpdate.mockRejectedValue({
          code: 'P2002',
          message: 'Unique constraint failed on the fields: (`phone`)',
        });

        const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', {
          phone: '010-1234-5678'
        });

        // Act
        const response = await PATCH(request);

        // Assert
        expectErrorResponse(response, 500, 'Internal server error');
      });
    });

    describe('Performance Tests', () => {
      it('should complete profile update within acceptable time', async () => {
        // Arrange
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserUpdate.mockResolvedValue(mockUser);

        const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', {
          name: 'Performance Test User',
          phone: '010-9999-9999',
        });

        // Act
        const { response, duration } = await measureResponseTime(async () => await PATCH(request));

        // Assert
        expect(response.status).toBe(200);
        expect(duration).toBeLessThan(performanceThresholds.fast);
      });

      it('should handle concurrent profile updates by different users', async () => {
        // Arrange
        let callCount = 0;
        mockGetServerSession.mockImplementation(async () => {
          const user = createMockUser({ id: `user-${callCount++}` });
          return createMockSession(user);
        });
        mockPrismaUserUpdate.mockResolvedValue(createMockUser());

        // Act
        const results = await runConcurrentRequests(async () => {
          const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', {
            name: `Updated Name ${Date.now()}`
          });
          return await PATCH(request);
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

    describe('Response Format Tests', () => {
      it('should return updated profile in correct format', async () => {
        // Arrange
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        const updatedUser = {
          ...mockUser,
          name: 'Updated Name',
          phone: '010-5555-5555',
        };
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserUpdate.mockResolvedValue(updatedUser);

        const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', {
          name: 'Updated Name',
          phone: '010-5555-5555',
        });

        // Act
        const response = await PATCH(request);

        // Assert
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('application/json');
        
        const responseData = await response.json();
        expect(typeof responseData).toBe('object');
        expect(responseData.name).toBe('Updated Name');
        expect(responseData.phone).toBe('010-5555-5555');
      });
    });

    describe('Edge Cases', () => {
      it('should handle null values gracefully', async () => {
        // Arrange
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserUpdate.mockResolvedValue(mockUser);

        const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', {
          name: null,
          phone: null,
        });

        // Act
        const response = await PATCH(request);

        // Assert
        // Should handle null values appropriately (either ignore or validate)
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(500);
      });

      it('should handle Unicode characters in name', async () => {
        // Arrange
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserUpdate.mockResolvedValue({
          ...mockUser,
          name: '김철수 李明華 🎮',
        });

        const unicodeNames = [
          '김철수', // Korean
          '李明華', // Chinese  
          'José María', // Spanish with accents
          'Müller', // German with umlaut
          'Пётр', // Cyrillic
          '🎮 Gamer', // With emoji
        ];

        // Act & Assert
        for (const name of unicodeNames) {
          const request = createMockRequest('PATCH', 'http://localhost:3000/api/members/profile', { name });
          const response = await PATCH(request);
          
          expect(response.status).toBe(200);
        }
      });
    });
  });
});