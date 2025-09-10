import { GET, POST } from '@/app/api/admin/payments/confirm/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import {
  createMockUser,
  createMockAdmin,
  createMockSession,
  createMockRequest,
  createMockTransaction,
  testErrorScenarios,
  expectSuccessResponse,
  expectErrorResponse,
  runConcurrentRequests,
  measureResponseTime,
  performanceThresholds,
  invalidInputTestCases,
  simulateTransactionFailure,
} from '../../../utils/test-helpers';

// Mocks
jest.mock('next-auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    pointLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockPrismaUserFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>;
const mockPrismaTransactionFindMany = prisma.transaction.findMany as jest.MockedFunction<typeof prisma.transaction.findMany>;
const mockPrismaTransaction = prisma.$transaction as jest.MockedFunction<typeof prisma.$transaction>;

describe('/api/admin/payments/confirm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Date.now mock
    Date.now = jest.fn(() => new Date('2024-01-01').getTime());
  });

  describe('GET - Fetch Pending Charges', () => {
    describe('Authentication and Authorization Tests', () => {
      it('should return pending charges for admin user', async () => {
        // Arrange
        const mockAdmin = createMockAdmin();
        const mockSession = createMockSession(mockAdmin);
        const mockPendingCharges = [
          createMockTransaction({ 
            id: 'charge-1',
            amount: 25000,
            status: 'PENDING',
            user: createMockUser({ id: 'user-1', email: 'user1@example.com' })
          }),
          createMockTransaction({ 
            id: 'charge-2',
            amount: 50000,
            status: 'PENDING',
            user: createMockUser({ id: 'user-2', email: 'user2@example.com' })
          }),
        ];

        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockAdmin);
        mockPrismaTransactionFindMany.mockResolvedValue(mockPendingCharges);

        // Act
        const response = await GET();

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        
        expect(responseData.charges).toEqual(mockPendingCharges);
        expect(responseData.stats).toEqual({
          totalPending: 2,
          totalAmount: 75000,
          oldestRequest: mockPendingCharges[0].createdAt,
        });

        // Verify admin check
        expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
          where: { email: mockAdmin.email },
          select: { role: true },
        });

        // Verify query for pending charges
        expect(mockPrismaTransactionFindMany).toHaveBeenCalledWith({
          where: {
            type: 'CHARGE',
            status: 'PENDING',
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                grade: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        });
      });

      it('should return 401 for unauthenticated user', async () => {
        // Arrange
        testErrorScenarios.unauthorized();

        // Act
        const response = await GET();

        // Assert
        expectErrorResponse(response, 401, 'Unauthorized');
        expect(mockPrismaTransactionFindMany).not.toHaveBeenCalled();
      });

      it('should return 403 for non-admin user', async () => {
        // Arrange
        const regularUser = createMockUser({ role: 'USER' });
        const mockSession = createMockSession(regularUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(regularUser);

        // Act
        const response = await GET();

        // Assert
        expectErrorResponse(response, 403, 'Forbidden');
        expect(mockPrismaTransactionFindMany).not.toHaveBeenCalled();
      });

      it('should return 404 when admin user not found', async () => {
        // Arrange
        const mockSession = createMockSession();
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(null);

        // Act
        const response = await GET();

        // Assert
        expectErrorResponse(response, 403, 'Forbidden');
      });
    });

    describe('Data Handling Tests', () => {
      beforeEach(() => {
        const mockAdmin = createMockAdmin();
        const mockSession = createMockSession(mockAdmin);
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockAdmin);
      });

      it('should handle empty pending charges list', async () => {
        // Arrange
        mockPrismaTransactionFindMany.mockResolvedValue([]);

        // Act
        const response = await GET();

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        
        expect(responseData.charges).toEqual([]);
        expect(responseData.stats).toEqual({
          totalPending: 0,
          totalAmount: 0,
          oldestRequest: null,
        });
      });

      it('should calculate statistics correctly', async () => {
        // Arrange
        const oldestDate = new Date('2024-01-01');
        const mockPendingCharges = [
          createMockTransaction({ 
            amount: 10000,
            createdAt: oldestDate
          }),
          createMockTransaction({ 
            amount: 25000,
            createdAt: new Date('2024-01-02')
          }),
          createMockTransaction({ 
            amount: 50000,
            createdAt: new Date('2024-01-03')
          }),
        ];

        mockPrismaTransactionFindMany.mockResolvedValue(mockPendingCharges);

        // Act
        const response = await GET();

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        
        expect(responseData.stats).toEqual({
          totalPending: 3,
          totalAmount: 85000, // 10000 + 25000 + 50000
          oldestRequest: oldestDate,
        });
      });
    });

    describe('Error Handling Tests', () => {
      it('should handle database error gracefully', async () => {
        // Arrange
        const mockAdmin = createMockAdmin();
        const mockSession = createMockSession(mockAdmin);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockAdmin);
        mockPrismaTransactionFindMany.mockRejectedValue(new Error('Database connection failed'));

        // Act
        const response = await GET();

        // Assert
        expectErrorResponse(response, 500, 'Internal server error');
      });
    });
  });

  describe('POST - Process Payment Confirmation', () => {
    describe('Authentication and Authorization Tests', () => {
      it('should approve charge request successfully', async () => {
        // Arrange
        const mockAdmin = createMockAdmin({ name: 'Admin User' });
        const mockUser = createMockUser({ points: 10000 });
        const mockTransaction = createMockTransaction({ 
          id: 'tx-123',
          userId: mockUser.id,
          amount: 25000,
          status: 'PENDING',
          user: mockUser
        });
        const mockSession = createMockSession(mockAdmin);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockAdmin);
        
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            transaction: {
              findUnique: jest.fn().mockResolvedValue(mockTransaction),
              update: jest.fn().mockResolvedValue({
                ...mockTransaction,
                status: 'COMPLETED',
                metadata: {
                  ...mockTransaction.metadata,
                  approvedBy: mockAdmin.name,
                  approvedAt: new Date().toISOString(),
                  note: 'Approved by admin',
                },
              }),
            },
            user: {
              update: jest.fn().mockResolvedValue({
                ...mockUser,
                points: 35000, // 10000 + 25000
              }),
            },
            pointLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          
          return await callback(tx);
        });

        const requestBody = { 
          transactionId: 'tx-123', 
          action: 'approve', 
          note: 'Approved by admin' 
        };
        const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', requestBody);

        // Act
        const response = await POST(request);

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        
        expect(responseData).toEqual({
          success: true,
          action: 'approved',
        });
      });

      it('should reject charge request successfully', async () => {
        // Arrange
        const mockAdmin = createMockAdmin({ name: 'Admin User' });
        const mockUser = createMockUser();
        const mockTransaction = createMockTransaction({ 
          id: 'tx-123',
          userId: mockUser.id,
          status: 'PENDING',
          user: mockUser
        });
        const mockSession = createMockSession(mockAdmin);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockAdmin);
        
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            transaction: {
              findUnique: jest.fn().mockResolvedValue(mockTransaction),
              update: jest.fn().mockResolvedValue({
                ...mockTransaction,
                status: 'CANCELLED',
                metadata: {
                  ...mockTransaction.metadata,
                  rejectedBy: mockAdmin.name,
                  rejectedAt: new Date().toISOString(),
                  rejectReason: 'Invalid payment proof',
                },
              }),
            },
          };
          
          return await callback(tx);
        });

        const requestBody = { 
          transactionId: 'tx-123', 
          action: 'reject', 
          note: 'Invalid payment proof' 
        };
        const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', requestBody);

        // Act
        const response = await POST(request);

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        
        expect(responseData).toEqual({
          success: true,
          action: 'rejected',
        });
      });

      it('should return 401 for unauthenticated user', async () => {
        // Arrange
        testErrorScenarios.unauthorized();
        const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', { 
          transactionId: 'tx-123', 
          action: 'approve' 
        });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 401, 'Unauthorized');
      });

      it('should return 403 for non-admin user', async () => {
        // Arrange
        const regularUser = createMockUser({ role: 'USER' });
        const mockSession = createMockSession(regularUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(regularUser);

        const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', { 
          transactionId: 'tx-123', 
          action: 'approve' 
        });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 403, 'Forbidden');
      });
    });

    describe('Input Validation Tests', () => {
      beforeEach(() => {
        const mockAdmin = createMockAdmin();
        const mockSession = createMockSession(mockAdmin);
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockAdmin);
      });

      it('should reject missing transaction ID', async () => {
        // Arrange
        const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', { 
          action: 'approve' 
        });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 400, 'Invalid request');
      });

      it('should reject invalid action', async () => {
        // Arrange
        const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', { 
          transactionId: 'tx-123',
          action: 'invalid_action'
        });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 400, 'Invalid request');
      });

      it('should accept valid actions', async () => {
        // Test both approve and reject actions
        const validActions = ['approve', 'reject'];
        
        for (const action of validActions) {
          // Arrange
          const mockTransaction = createMockTransaction({ status: 'PENDING', type: 'CHARGE' });
          
          mockPrismaTransaction.mockImplementation(async (callback) => {
            const tx = {
              transaction: {
                findUnique: jest.fn().mockResolvedValue(mockTransaction),
                update: jest.fn().mockResolvedValue(mockTransaction),
              },
              user: {
                update: jest.fn().mockResolvedValue({}),
              },
              pointLog: {
                create: jest.fn().mockResolvedValue({}),
              },
            };
            
            return await callback(tx);
          });

          const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', { 
            transactionId: 'tx-123',
            action
          });

          // Act
          const response = await POST(request);

          // Assert
          expect(response.status).toBe(200);
        }
      });

      it('should handle missing note gracefully', async () => {
        // Arrange
        const mockTransaction = createMockTransaction({ status: 'PENDING', type: 'CHARGE' });
        
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            transaction: {
              findUnique: jest.fn().mockResolvedValue(mockTransaction),
              update: jest.fn().mockResolvedValue(mockTransaction),
            },
          };
          
          return await callback(tx);
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', { 
          transactionId: 'tx-123',
          action: 'reject'
          // note is optional
        });

        // Act
        const response = await POST(request);

        // Assert
        expect(response.status).toBe(200);
      });
    });

    describe('Business Logic Tests', () => {
      beforeEach(() => {
        const mockAdmin = createMockAdmin();
        const mockSession = createMockSession(mockAdmin);
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockAdmin);
      });

      it('should reject non-existent transaction', async () => {
        // Arrange
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            transaction: {
              findUnique: jest.fn().mockResolvedValue(null),
            },
          };
          
          throw new Error('Transaction not found');
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', { 
          transactionId: 'non-existent-tx',
          action: 'approve'
        });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 500, 'Transaction not found');
      });

      it('should reject non-charge transaction', async () => {
        // Arrange
        const mockTransaction = createMockTransaction({ type: 'VOUCHER_PURCHASE' });
        
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            transaction: {
              findUnique: jest.fn().mockResolvedValue(mockTransaction),
            },
          };
          
          throw new Error('Invalid transaction status');
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', { 
          transactionId: 'tx-123',
          action: 'approve'
        });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 500, 'Invalid transaction status');
      });

      it('should reject already processed transaction', async () => {
        // Arrange
        const mockTransaction = createMockTransaction({ status: 'COMPLETED', type: 'CHARGE' });
        
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            transaction: {
              findUnique: jest.fn().mockResolvedValue(mockTransaction),
            },
          };
          
          throw new Error('Invalid transaction status');
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', { 
          transactionId: 'tx-123',
          action: 'approve'
        });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 500, 'Invalid transaction status');
      });
    });

    describe('Transaction Integrity Tests', () => {
      it('should rollback transaction when point update fails', async () => {
        // Arrange
        const mockAdmin = createMockAdmin();
        const mockSession = createMockSession(mockAdmin);
        const mockTransaction = createMockTransaction({ 
          status: 'PENDING', 
          type: 'CHARGE',
          amount: 25000
        });
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockAdmin);
        
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            transaction: {
              findUnique: jest.fn().mockResolvedValue(mockTransaction),
              update: jest.fn().mockResolvedValue(mockTransaction),
            },
            user: {
              update: jest.fn().mockRejectedValue(new Error('Point update failed')),
            },
          };
          
          return await callback(tx);
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', { 
          transactionId: 'tx-123',
          action: 'approve'
        });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 500, 'Internal server error');
        expect(mockPrismaTransaction).toHaveBeenCalled();
      });

      it('should rollback transaction when point log creation fails', async () => {
        // Arrange
        const mockAdmin = createMockAdmin();
        const mockSession = createMockSession(mockAdmin);
        const mockTransaction = createMockTransaction({ 
          status: 'PENDING', 
          type: 'CHARGE'
        });
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockAdmin);
        
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            transaction: {
              findUnique: jest.fn().mockResolvedValue(mockTransaction),
              update: jest.fn().mockResolvedValue(mockTransaction),
            },
            user: {
              update: jest.fn().mockResolvedValue({}),
            },
            pointLog: {
              create: jest.fn().mockRejectedValue(new Error('Point log creation failed')),
            },
          };
          
          return await callback(tx);
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', { 
          transactionId: 'tx-123',
          action: 'approve'
        });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 500, 'Internal server error');
      });
    });

    describe('Audit Trail Tests', () => {
      it('should record admin approval details in metadata', async () => {
        // Arrange
        const mockAdmin = createMockAdmin({ name: 'John Admin' });
        const mockSession = createMockSession(mockAdmin);
        const mockTransaction = createMockTransaction({ status: 'PENDING', type: 'CHARGE' });
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockAdmin);
        
        let capturedUpdateData: any;
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            transaction: {
              findUnique: jest.fn().mockResolvedValue(mockTransaction),
              update: jest.fn().mockImplementation(({ where, data }) => {
                capturedUpdateData = data;
                return Promise.resolve(mockTransaction);
              }),
            },
            user: {
              update: jest.fn().mockResolvedValue({}),
            },
            pointLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          
          return await callback(tx);
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', { 
          transactionId: 'tx-123',
          action: 'approve',
          note: 'Payment verified'
        });

        // Act
        await POST(request);

        // Assert
        expect(capturedUpdateData.metadata).toMatchObject({
          approvedBy: 'John Admin',
          approvedAt: expect.any(String),
          note: 'Payment verified',
        });
      });

      it('should record admin rejection details in metadata', async () => {
        // Arrange
        const mockAdmin = createMockAdmin({ name: 'Jane Admin' });
        const mockSession = createMockSession(mockAdmin);
        const mockTransaction = createMockTransaction({ status: 'PENDING', type: 'CHARGE' });
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockAdmin);
        
        let capturedUpdateData: any;
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            transaction: {
              findUnique: jest.fn().mockResolvedValue(mockTransaction),
              update: jest.fn().mockImplementation(({ where, data }) => {
                capturedUpdateData = data;
                return Promise.resolve(mockTransaction);
              }),
            },
          };
          
          return await callback(tx);
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', { 
          transactionId: 'tx-123',
          action: 'reject',
          note: 'Insufficient payment proof'
        });

        // Act
        await POST(request);

        // Assert
        expect(capturedUpdateData.metadata).toMatchObject({
          rejectedBy: 'Jane Admin',
          rejectedAt: expect.any(String),
          rejectReason: 'Insufficient payment proof',
        });
      });

      it('should use default reject reason when note is not provided', async () => {
        // Arrange
        const mockAdmin = createMockAdmin();
        const mockSession = createMockSession(mockAdmin);
        const mockTransaction = createMockTransaction({ status: 'PENDING', type: 'CHARGE' });
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockAdmin);
        
        let capturedUpdateData: any;
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            transaction: {
              findUnique: jest.fn().mockResolvedValue(mockTransaction),
              update: jest.fn().mockImplementation(({ where, data }) => {
                capturedUpdateData = data;
                return Promise.resolve(mockTransaction);
              }),
            },
          };
          
          return await callback(tx);
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', { 
          transactionId: 'tx-123',
          action: 'reject'
        });

        // Act
        await POST(request);

        // Assert
        expect(capturedUpdateData.metadata.rejectReason).toBe('관리자 거절');
      });
    });

    describe('Performance Tests', () => {
      it('should complete confirmation within acceptable time', async () => {
        // Arrange
        const mockAdmin = createMockAdmin();
        const mockSession = createMockSession(mockAdmin);
        const mockTransaction = createMockTransaction({ status: 'PENDING', type: 'CHARGE' });
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockAdmin);
        
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            transaction: {
              findUnique: jest.fn().mockResolvedValue(mockTransaction),
              update: jest.fn().mockResolvedValue(mockTransaction),
            },
            user: {
              update: jest.fn().mockResolvedValue({}),
            },
            pointLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          
          return await callback(tx);
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', { 
          transactionId: 'tx-123',
          action: 'approve'
        });

        // Act
        const { response, duration } = await measureResponseTime(async () => await POST(request));

        // Assert
        expect(response.status).toBe(200);
        expect(duration).toBeLessThan(performanceThresholds.medium);
      });
    });

    describe('Security Tests', () => {
      it('should prevent non-admin from confirming payments', async () => {
        // Arrange
        const regularUser = createMockUser({ role: 'USER' });
        const mockSession = createMockSession(regularUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(regularUser);

        const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', { 
          transactionId: 'tx-123',
          action: 'approve'
        });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 403, 'Forbidden');
        expect(mockPrismaTransaction).not.toHaveBeenCalled();
      });

      it('should validate transaction ID format', async () => {
        // Arrange
        const mockAdmin = createMockAdmin();
        const mockSession = createMockSession(mockAdmin);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockAdmin);

        const maliciousIds = [
          "'; DROP TABLE transactions; --",
          '<script>alert("xss")</script>',
          '../../etc/passwd',
          null,
          undefined,
        ];

        // Act & Assert
        for (const maliciousId of maliciousIds) {
          const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', { 
            transactionId: maliciousId,
            action: 'approve'
          });
          
          const response = await POST(request);
          expectErrorResponse(response, 400, 'Invalid request');
        }
      });

      it('should validate action parameter against enum values', async () => {
        // Arrange
        const mockAdmin = createMockAdmin();
        const mockSession = createMockSession(mockAdmin);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        mockPrismaUserFindUnique.mockResolvedValue(mockAdmin);

        const maliciousActions = [
          'admin_override',
          'delete',
          'bypass',
          'sudo',
          'exec',
        ];

        // Act & Assert
        for (const maliciousAction of maliciousActions) {
          const request = createMockRequest('POST', 'http://localhost:3000/api/admin/payments/confirm', { 
            transactionId: 'tx-123',
            action: maliciousAction
          });
          
          const response = await POST(request);
          expectErrorResponse(response, 400, 'Invalid request');
        }
      });
    });
  });
});