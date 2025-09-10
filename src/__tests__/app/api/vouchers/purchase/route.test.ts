import { POST } from '@/app/api/vouchers/purchase/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import {
  createMockUser,
  createMockSession,
  createMockRequest,
  createMockVoucherPricing,
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
    voucherPricing: {
      findFirst: jest.fn(),
    },
    voucher: {
      createMany: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    pointLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockPrismaTransaction = prisma.$transaction as jest.MockedFunction<typeof prisma.$transaction>;

describe('/api/vouchers/purchase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Date.now mock to consistent value
    Date.now = jest.fn(() => new Date('2024-01-01').getTime());
  });

  describe('POST', () => {
    describe('Authentication Tests', () => {
      it('should purchase vouchers successfully for authenticated user', async () => {
        // Arrange
        const mockUser = createMockUser({ points: 50000, memberGrade: 'MEMBER' });
        const mockSession = createMockSession(mockUser);
        const mockPricing = createMockVoucherPricing({ price: 5000, type: 'BUYIN', memberGrade: 'MEMBER' });
        const requestBody = { type: 'BUYIN', quantity: 2 };
        
        mockGetServerSession.mockResolvedValue(mockSession);
        
        // Mock successful transaction
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            user: {
              findUnique: jest.fn().mockResolvedValue(mockUser),
              update: jest.fn().mockResolvedValue({ ...mockUser, points: 40000 }),
            },
            voucherPricing: {
              findFirst: jest.fn().mockResolvedValue(mockPricing),
            },
            voucher: {
              createMany: jest.fn().mockResolvedValue({ count: 2 }),
            },
            transaction: {
              create: jest.fn().mockResolvedValue({
                id: 'transaction-123',
                userId: mockUser.id,
                type: 'VOUCHER_PURCHASE',
                amount: -10000,
                status: 'COMPLETED',
              }),
            },
            pointLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          
          return await callback(tx);
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/vouchers/purchase', requestBody);

        // Act
        const response = await POST(request);

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        expect(responseData).toMatchObject({
          success: true,
          vouchers: 2,
          remainingPoints: 40000,
          transaction: 'transaction-123',
        });
      });

      it('should return 401 for unauthenticated user', async () => {
        // Arrange
        testErrorScenarios.unauthorized();
        const request = createMockRequest('POST', 'http://localhost:3000/api/vouchers/purchase', { type: 'BUYIN' });

        // Act
        const response = await POST(request);

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

      it('should reject invalid voucher type', async () => {
        // Arrange
        const request = createMockRequest('POST', 'http://localhost:3000/api/vouchers/purchase', { 
          type: 'INVALID_TYPE', 
          quantity: 1 
        });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 400, 'Invalid voucher type');
      });

      it('should reject missing voucher type', async () => {
        // Arrange
        const request = createMockRequest('POST', 'http://localhost:3000/api/vouchers/purchase', { quantity: 1 });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 400, 'Invalid voucher type');
      });

      it('should reject invalid quantity (too low)', async () => {
        // Arrange
        const request = createMockRequest('POST', 'http://localhost:3000/api/vouchers/purchase', { 
          type: 'BUYIN', 
          quantity: 0 
        });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 400, 'Invalid quantity');
      });

      it('should reject invalid quantity (too high)', async () => {
        // Arrange
        const request = createMockRequest('POST', 'http://localhost:3000/api/vouchers/purchase', { 
          type: 'BUYIN', 
          quantity: 11 
        });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 400, 'Invalid quantity');
      });

      it('should default quantity to 1 when not provided', async () => {
        // Arrange
        const mockUser = createMockUser({ points: 50000, memberGrade: 'MEMBER' });
        const mockPricing = createMockVoucherPricing({ price: 5000 });
        
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            user: {
              findUnique: jest.fn().mockResolvedValue(mockUser),
              update: jest.fn().mockResolvedValue({ ...mockUser, points: 45000 }),
            },
            voucherPricing: {
              findFirst: jest.fn().mockResolvedValue(mockPricing),
            },
            voucher: {
              createMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            transaction: {
              create: jest.fn().mockResolvedValue({ id: 'tx-123' }),
            },
            pointLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          
          return await callback(tx);
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/vouchers/purchase', { type: 'BUYIN' });

        // Act
        const response = await POST(request);

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        expect(responseData.vouchers).toBe(1);
      });

      it('should handle malformed JSON body', async () => {
        // Arrange
        const request = new Request('http://localhost:3000/api/vouchers/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'invalid json{',
        });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 500, 'Internal server error');
      });
    });

    describe('Business Logic Tests', () => {
      it('should calculate total price correctly for multiple quantities', async () => {
        // Arrange
        const mockUser = createMockUser({ points: 50000, memberGrade: 'MEMBER' });
        const mockSession = createMockSession(mockUser);
        const mockPricing = createMockVoucherPricing({ price: 7500, type: 'REBUY', memberGrade: 'MEMBER' });
        
        mockGetServerSession.mockResolvedValue(mockSession);
        
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            user: {
              findUnique: jest.fn().mockResolvedValue(mockUser),
              update: jest.fn().mockResolvedValue({ ...mockUser, points: 27500 }), // 50000 - (7500 * 3)
            },
            voucherPricing: {
              findFirst: jest.fn().mockResolvedValue(mockPricing),
            },
            voucher: {
              createMany: jest.fn().mockResolvedValue({ count: 3 }),
            },
            transaction: {
              create: jest.fn().mockResolvedValue({ id: 'tx-123' }),
            },
            pointLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          
          return await callback(tx);
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/vouchers/purchase', { 
          type: 'REBUY', 
          quantity: 3 
        });

        // Act
        const response = await POST(request);

        // Assert
        expect(response.status).toBe(200);
        const responseData = await response.json();
        expect(responseData.remainingPoints).toBe(27500); // 50000 - 22500
      });

      it('should reject purchase when user has insufficient points', async () => {
        // Arrange
        const mockUser = createMockUser({ points: 1000, memberGrade: 'MEMBER' });
        const mockSession = createMockSession(mockUser);
        const mockPricing = createMockVoucherPricing({ price: 5000 });
        
        mockGetServerSession.mockResolvedValue(mockSession);
        
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            user: {
              findUnique: jest.fn().mockResolvedValue(mockUser),
            },
            voucherPricing: {
              findFirst: jest.fn().mockResolvedValue(mockPricing),
            },
          };
          
          // Simulate the business logic throwing an error
          throw new Error('Insufficient points');
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/vouchers/purchase', { type: 'BUYIN' });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 400, '포인트가 부족합니다');
      });

      it('should reject purchase when user not found', async () => {
        // Arrange
        const mockSession = createMockSession();
        mockGetServerSession.mockResolvedValue(mockSession);
        
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            user: {
              findUnique: jest.fn().mockResolvedValue(null),
            },
          };
          
          throw new Error('User not found');
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/vouchers/purchase', { type: 'BUYIN' });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 500, 'Internal server error');
      });

      it('should reject purchase when pricing not found', async () => {
        // Arrange
        const mockUser = createMockUser({ points: 50000, memberGrade: 'VIP' });
        const mockSession = createMockSession(mockUser);
        
        mockGetServerSession.mockResolvedValue(mockSession);
        
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            user: {
              findUnique: jest.fn().mockResolvedValue(mockUser),
            },
            voucherPricing: {
              findFirst: jest.fn().mockResolvedValue(null), // No pricing found
            },
          };
          
          throw new Error('Pricing not found');
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/vouchers/purchase', { type: 'BUYIN' });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 500, 'Internal server error');
      });
    });

    describe('Grade-Based Pricing Tests', () => {
      it('should use correct pricing for different member grades', async () => {
        // Test MEMBER grade pricing
        const testCases = [
          { grade: 'MEMBER', expectedPrice: 5000 },
          { grade: 'VIP', expectedPrice: 4000 },
          { grade: 'PREMIUM', expectedPrice: 3000 },
        ];

        for (const testCase of testCases) {
          // Arrange
          const mockUser = createMockUser({ 
            points: 50000, 
            memberGrade: testCase.grade 
          });
          const mockSession = createMockSession(mockUser);
          const mockPricing = createMockVoucherPricing({ 
            price: testCase.expectedPrice, 
            memberGrade: testCase.grade 
          });
          
          mockGetServerSession.mockResolvedValue(mockSession);
          
          let capturedPricingQuery: any;
          mockPrismaTransaction.mockImplementation(async (callback) => {
            const tx = {
              user: {
                findUnique: jest.fn().mockResolvedValue(mockUser),
                update: jest.fn().mockResolvedValue({ 
                  ...mockUser, 
                  points: 50000 - testCase.expectedPrice 
                }),
              },
              voucherPricing: {
                findFirst: jest.fn().mockImplementation((query) => {
                  capturedPricingQuery = query;
                  return Promise.resolve(mockPricing);
                }),
              },
              voucher: {
                createMany: jest.fn().mockResolvedValue({ count: 1 }),
              },
              transaction: {
                create: jest.fn().mockResolvedValue({ id: 'tx-123' }),
              },
              pointLog: {
                create: jest.fn().mockResolvedValue({}),
              },
            };
            
            return await callback(tx);
          });

          const request = createMockRequest('POST', 'http://localhost:3000/api/vouchers/purchase', { type: 'BUYIN' });

          // Act
          const response = await POST(request);

          // Assert
          expect(response.status).toBe(200);
          expect(capturedPricingQuery.where.memberGrade).toBe(testCase.grade);
          
          const responseData = await response.json();
          expect(responseData.remainingPoints).toBe(50000 - testCase.expectedPrice);
        }
      });
    });

    describe('Transaction Integrity Tests', () => {
      it('should rollback transaction when voucher creation fails', async () => {
        // Arrange
        const mockUser = createMockUser({ points: 50000 });
        const mockSession = createMockSession(mockUser);
        const mockPricing = createMockVoucherPricing({ price: 5000 });
        
        mockGetServerSession.mockResolvedValue(mockSession);
        
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            user: {
              findUnique: jest.fn().mockResolvedValue(mockUser),
              update: jest.fn().mockResolvedValue({ ...mockUser, points: 45000 }),
            },
            voucherPricing: {
              findFirst: jest.fn().mockResolvedValue(mockPricing),
            },
            voucher: {
              createMany: jest.fn().mockRejectedValue(new Error('Voucher creation failed')),
            },
          };
          
          return await callback(tx);
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/vouchers/purchase', { type: 'BUYIN' });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 500, 'Internal server error');
        expect(mockPrismaTransaction).toHaveBeenCalled();
      });

      it('should rollback transaction when point log creation fails', async () => {
        // Arrange
        const mockUser = createMockUser({ points: 50000 });
        const mockSession = createMockSession(mockUser);
        const mockPricing = createMockVoucherPricing({ price: 5000 });
        
        mockGetServerSession.mockResolvedValue(mockSession);
        
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            user: {
              findUnique: jest.fn().mockResolvedValue(mockUser),
              update: jest.fn().mockResolvedValue({ ...mockUser, points: 45000 }),
            },
            voucherPricing: {
              findFirst: jest.fn().mockResolvedValue(mockPricing),
            },
            voucher: {
              createMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            transaction: {
              create: jest.fn().mockResolvedValue({ id: 'tx-123' }),
            },
            pointLog: {
              create: jest.fn().mockRejectedValue(new Error('Point log creation failed')),
            },
          };
          
          return await callback(tx);
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/vouchers/purchase', { type: 'BUYIN' });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 500, 'Internal server error');
      });
    });

    describe('Concurrent Request Tests', () => {
      it('should handle concurrent purchase requests safely', async () => {
        // Arrange
        const mockUser = createMockUser({ points: 50000 });
        const mockSession = createMockSession(mockUser);
        const mockPricing = createMockVoucherPricing({ price: 5000 });
        
        mockGetServerSession.mockResolvedValue(mockSession);
        
        let transactionCount = 0;
        mockPrismaTransaction.mockImplementation(async (callback) => {
          transactionCount++;
          const tx = {
            user: {
              findUnique: jest.fn().mockResolvedValue(mockUser),
              update: jest.fn().mockResolvedValue({ 
                ...mockUser, 
                points: 50000 - (5000 * transactionCount) 
              }),
            },
            voucherPricing: {
              findFirst: jest.fn().mockResolvedValue(mockPricing),
            },
            voucher: {
              createMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            transaction: {
              create: jest.fn().mockResolvedValue({ id: `tx-${transactionCount}` }),
            },
            pointLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          
          return await callback(tx);
        });

        // Act
        const results = await runConcurrentRequests(async () => {
          const request = createMockRequest('POST', 'http://localhost:3000/api/vouchers/purchase', { type: 'BUYIN' });
          return await POST(request);
        }, 3);

        // Assert
        const successfulResults = results.filter(result => 
          result.status === 'fulfilled'
        ) as PromiseFulfilledResult<Response>[];
        
        expect(successfulResults).toHaveLength(3);
        expect(mockPrismaTransaction).toHaveBeenCalledTimes(3);
        
        for (const result of successfulResults) {
          expect(result.value.status).toBe(200);
        }
      });
    });

    describe('Voucher Expiration Tests', () => {
      it('should set correct expiration date for vouchers', async () => {
        // Arrange
        const mockUser = createMockUser({ points: 50000 });
        const mockSession = createMockSession(mockUser);
        const mockPricing = createMockVoucherPricing({ price: 5000 });
        
        mockGetServerSession.mockResolvedValue(mockSession);
        
        let capturedVoucherData: any;
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            user: {
              findUnique: jest.fn().mockResolvedValue(mockUser),
              update: jest.fn().mockResolvedValue({ ...mockUser, points: 45000 }),
            },
            voucherPricing: {
              findFirst: jest.fn().mockResolvedValue(mockPricing),
            },
            voucher: {
              createMany: jest.fn().mockImplementation(({ data }) => {
                capturedVoucherData = data;
                return Promise.resolve({ count: data.length });
              }),
            },
            transaction: {
              create: jest.fn().mockResolvedValue({ id: 'tx-123' }),
            },
            pointLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          
          return await callback(tx);
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/vouchers/purchase', { 
          type: 'BUYIN', 
          quantity: 2 
        });

        // Act
        await POST(request);

        // Assert
        expect(capturedVoucherData).toHaveLength(2);
        const expectedExpirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        capturedVoucherData.forEach((voucher: any) => {
          expect(voucher.userId).toBe(mockUser.id);
          expect(voucher.type).toBe('BUYIN');
          expect(voucher.expiresAt).toEqual(expectedExpirationDate);
        });
      });
    });

    describe('Performance Tests', () => {
      it('should complete purchase within acceptable time', async () => {
        // Arrange
        const mockUser = createMockUser({ points: 50000 });
        const mockSession = createMockSession(mockUser);
        const mockPricing = createMockVoucherPricing({ price: 5000 });
        
        mockGetServerSession.mockResolvedValue(mockSession);
        
        mockPrismaTransaction.mockImplementation(async (callback) => {
          const tx = {
            user: {
              findUnique: jest.fn().mockResolvedValue(mockUser),
              update: jest.fn().mockResolvedValue({ ...mockUser, points: 45000 }),
            },
            voucherPricing: {
              findFirst: jest.fn().mockResolvedValue(mockPricing),
            },
            voucher: {
              createMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            transaction: {
              create: jest.fn().mockResolvedValue({ id: 'tx-123' }),
            },
            pointLog: {
              create: jest.fn().mockResolvedValue({}),
            },
          };
          
          return await callback(tx);
        });

        const request = createMockRequest('POST', 'http://localhost:3000/api/vouchers/purchase', { type: 'BUYIN' });

        // Act
        const { response, duration } = await measureResponseTime(async () => await POST(request));

        // Assert
        expect(response.status).toBe(200);
        expect(duration).toBeLessThan(performanceThresholds.medium);
      });
    });

    describe('Security Tests', () => {
      it('should validate voucher types against enum values', async () => {
        // Arrange
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        mockGetServerSession.mockResolvedValue(mockSession);

        const maliciousTypes = [
          'ADMIN_VOUCHER',
          'FREE_VOUCHER', 
          'UNLIMITED_VOUCHER',
          'DROP TABLE vouchers;--',
          '<script>alert("xss")</script>',
        ];

        // Act & Assert
        for (const maliciousType of maliciousTypes) {
          const request = createMockRequest('POST', 'http://localhost:3000/api/vouchers/purchase', { 
            type: maliciousType 
          });
          
          const response = await POST(request);
          expectErrorResponse(response, 400, 'Invalid voucher type');
        }
      });

      it('should prevent negative quantity injection', async () => {
        // Arrange
        const mockUser = createMockUser();
        const mockSession = createMockSession(mockUser);
        mockGetServerSession.mockResolvedValue(mockSession);

        const request = createMockRequest('POST', 'http://localhost:3000/api/vouchers/purchase', { 
          type: 'BUYIN',
          quantity: -999999
        });

        // Act
        const response = await POST(request);

        // Assert
        expectErrorResponse(response, 400, 'Invalid quantity');
      });
    });
  });
});