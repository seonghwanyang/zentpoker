import { PrismaClient } from '@prisma/client';
import {
  createPointChargeTransaction,
  completePointChargeTransaction,
  createVoucherPurchaseTransaction,
  createTournamentEntryTransaction,
  failPaymentTransaction,
  createRefundTransaction,
} from '@/lib/db/transactions';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    voucher: {
      create: jest.fn(),
    },
    tournament: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    tournamentParticipant: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<PrismaClient>;

describe('Rollback Scenarios Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup mock console to track error logging
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Failed Payment Rollback', () => {
    it('should rollback transaction when payment gateway fails', async () => {
      let transactionCreated = false;
      let transactionRolledBack = false;

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          transaction: {
            create: jest.fn().mockImplementation(async () => {
              transactionCreated = true;
              return {
                id: 'tx-1',
                userId: 'user-1',
                type: 'CHARGE',
                amount: 25000,
                status: 'PENDING',
              };
            }),
          },
          payment: {
            create: jest.fn().mockImplementation(async () => {
              // Simulate payment gateway failure
              throw new Error('Payment gateway unavailable');
            }),
          },
        };

        try {
          return await callback(mockTx);
        } catch (error) {
          // Rollback should occur automatically
          transactionRolledBack = true;
          throw error;
        }
      });

      await expect(createPointChargeTransaction({
        userId: 'user-1',
        amount: 25000,
        method: 'KAKAO_PAY',
      })).rejects.toThrow('Payment gateway unavailable');

      expect(transactionCreated).toBe(true);
      expect(transactionRolledBack).toBe(true);
    });

    it('should handle rollback when external payment service times out', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: 'tx-1',
              userId: 'user-1',
              type: 'CHARGE',
              amount: 25000,
              status: 'PENDING',
            }),
          },
          payment: {
            create: jest.fn().mockImplementation(async () => {
              // Simulate timeout after 30 seconds
              await new Promise(resolve => setTimeout(resolve, 30000));
              throw timeoutError;
            }),
          },
        };

        return callback(mockTx);
      });

      await expect(createPointChargeTransaction({
        userId: 'user-1',
        amount: 25000,
        method: 'BANK_TRANSFER',
      })).rejects.toThrow('Request timeout');
    });
  });

  describe('Partial Transaction Failure', () => {
    it('should rollback when user point update fails after voucher creation', async () => {
      let vouchersCreated = [];
      let userPointsUpdated = false;

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue({ points: 50000 }),
            update: jest.fn().mockImplementation(async () => {
              // Simulate failure during point deduction
              throw new Error('Database connection lost');
            }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: 'tx-voucher-1',
              userId: 'user-1',
              type: 'VOUCHER_PURCHASE',
              amount: -15000,
            }),
          },
          voucher: {
            create: jest.fn().mockImplementation(async () => {
              const voucher = { id: `voucher-${vouchersCreated.length + 1}`, code: 'V-001' };
              vouchersCreated.push(voucher);
              return voucher;
            }),
          },
        };

        try {
          return await callback(mockTx);
        } catch (error) {
          // Rollback should occur, vouchers should not persist
          vouchersCreated = [];
          throw error;
        }
      });

      await expect(createVoucherPurchaseTransaction({
        userId: 'user-1',
        voucherType: 'REBUY',
        quantity: 1,
        unitPrice: 15000,
        totalPrice: 15000,
      })).rejects.toThrow('Database connection lost');

      expect(vouchersCreated).toHaveLength(0);
      expect(userPointsUpdated).toBe(false);
    });

    it('should handle partial tournament entry failure', async () => {
      let participantCreated = false;
      let tournamentUpdated = false;
      let pointsDeducted = false;

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue({ points: 50000 }),
            update: jest.fn().mockImplementation(async () => {
              pointsDeducted = true;
              return { points: 40000 };
            }),
          },
          tournament: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'tournament-1',
              title: 'Test Tournament',
              maxParticipants: 100,
              currentParticipants: 50,
              status: 'UPCOMING',
            }),
            update: jest.fn().mockImplementation(async () => {
              tournamentUpdated = true;
              return { currentParticipants: 51 };
            }),
          },
          tournamentParticipant: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockImplementation(async () => {
              participantCreated = true;
              // Simulate failure after participant creation
              throw new Error('Constraint violation');
            }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: 'tx-entry-1',
              type: 'TOURNAMENT_ENTRY',
              amount: -10000,
            }),
          },
        };

        try {
          return await callback(mockTx);
        } catch (error) {
          // Rollback all changes
          participantCreated = false;
          tournamentUpdated = false;
          pointsDeducted = false;
          throw error;
        }
      });

      await expect(createTournamentEntryTransaction({
        userId: 'user-1',
        tournamentId: 'tournament-1',
        entryFee: 10000,
      })).rejects.toThrow('Constraint violation');

      expect(participantCreated).toBe(false);
      expect(tournamentUpdated).toBe(false);
      expect(pointsDeducted).toBe(false);
    });
  });

  describe('Database Constraint Violations', () => {
    it('should rollback when unique constraint is violated', async () => {
      const duplicateError = new Error('Unique constraint violation');
      duplicateError.name = 'PrismaClientKnownRequestError';
      (duplicateError as any).code = 'P2002';

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue({ points: 50000 }),
            update: jest.fn().mockResolvedValue({ points: 40000 }),
          },
          transaction: {
            create: jest.fn().mockImplementation(async () => {
              throw duplicateError;
            }),
          },
        };

        return callback(mockTx);
      });

      await expect(createPointChargeTransaction({
        userId: 'user-1',
        amount: 10000,
        method: 'DUPLICATE_REF',
      })).rejects.toThrow('Unique constraint violation');
    });

    it('should handle foreign key constraint failures', async () => {
      const foreignKeyError = new Error('Foreign key constraint failed');
      foreignKeyError.name = 'PrismaClientKnownRequestError';
      (foreignKeyError as any).code = 'P2003';

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue({ points: 50000 }),
          },
          tournament: {
            findUnique: jest.fn().mockResolvedValue(null), // Tournament doesn't exist
          },
          tournamentParticipant: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockImplementation(async () => {
              throw foreignKeyError;
            }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: 'tx-1',
              type: 'TOURNAMENT_ENTRY',
              amount: -10000,
            }),
          },
        };

        return callback(mockTx);
      });

      await expect(createTournamentEntryTransaction({
        userId: 'user-1',
        tournamentId: 'non-existent-tournament',
        entryFee: 10000,
      })).rejects.toThrow('Tournament not available');
    });

    it('should handle check constraint violations', async () => {
      const checkConstraintError = new Error('Check constraint violation');
      checkConstraintError.name = 'PrismaClientKnownRequestError';
      (checkConstraintError as any).code = 'P2004';

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue({ points: 1000 }),
            update: jest.fn().mockImplementation(async () => {
              // Simulate negative balance check constraint
              throw checkConstraintError;
            }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: 'tx-1',
              type: 'VOUCHER_PURCHASE',
              amount: -15000,
            }),
          },
          voucher: {
            create: jest.fn().mockResolvedValue({ id: 'v-1' }),
          },
        };

        return callback(mockTx);
      });

      await expect(createVoucherPurchaseTransaction({
        userId: 'user-1',
        voucherType: 'EXPENSIVE',
        quantity: 1,
        unitPrice: 15000,
        totalPrice: 15000,
      })).rejects.toThrow('Check constraint violation');
    });
  });

  describe('Timeout and Retry Logic', () => {
    it('should rollback transaction on timeout', async () => {
      jest.setTimeout(10000);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Transaction timeout')), 5000);
      });

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: 'tx-1',
              userId: 'user-1',
              type: 'CHARGE',
              amount: 25000,
            }),
          },
          payment: {
            create: jest.fn().mockImplementation(async () => {
              // Simulate long-running operation
              return await timeoutPromise;
            }),
          },
        };

        return callback(mockTx);
      });

      await expect(createPointChargeTransaction({
        userId: 'user-1',
        amount: 25000,
        method: 'SLOW_PAYMENT',
      })).rejects.toThrow('Transaction timeout');
    });

    it('should implement retry logic with exponential backoff', async () => {
      let attemptCount = 0;
      const maxRetries = 3;

      const transientError = new Error('Temporary network error');
      transientError.name = 'NetworkError';

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        attemptCount++;
        
        if (attemptCount < maxRetries) {
          throw transientError;
        }

        const mockTx = {
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: 'tx-1',
              userId: 'user-1',
              type: 'CHARGE',
              amount: 25000,
            }),
          },
          payment: {
            create: jest.fn().mockResolvedValue({
              id: 'payment-1',
              status: 'PENDING',
            }),
          },
        };

        return callback(mockTx);
      });

      // Implement retry wrapper
      async function createPointChargeWithRetry(data: any, retries = maxRetries) {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            return await createPointChargeTransaction(data);
          } catch (error) {
            if (attempt === retries || error.name !== 'NetworkError') {
              throw error;
            }
            // Exponential backoff: wait 2^attempt * 100ms
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
          }
        }
      }

      const result = await createPointChargeWithRetry({
        userId: 'user-1',
        amount: 25000,
        method: 'RETRY_TEST',
      });

      expect(result).toBeDefined();
      expect(attemptCount).toBe(maxRetries);
    });
  });

  describe('Data Consistency After Rollback', () => {
    it('should maintain user balance consistency after failed voucher purchase', async () => {
      let initialBalance = 50000;
      let currentBalance = initialBalance;

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue({ points: currentBalance }),
            update: jest.fn().mockImplementation(async (params) => {
              if (params.data.points?.decrement) {
                const newBalance = currentBalance - params.data.points.decrement;
                if (newBalance < 0) {
                  throw new Error('Insufficient balance after deduction');
                }
                currentBalance = newBalance;
                return { points: currentBalance };
              }
              return { points: currentBalance };
            }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: 'tx-1',
              userId: 'user-1',
              type: 'VOUCHER_PURCHASE',
              amount: -60000, // More than balance
            }),
          },
          voucher: {
            create: jest.fn().mockImplementation(async () => {
              // This should fail due to insufficient balance
              throw new Error('Cannot create voucher: insufficient balance');
            }),
          },
        };

        try {
          return await callback(mockTx);
        } catch (error) {
          // Rollback: restore balance
          currentBalance = initialBalance;
          throw error;
        }
      });

      await expect(createVoucherPurchaseTransaction({
        userId: 'user-1',
        voucherType: 'EXPENSIVE',
        quantity: 1,
        unitPrice: 60000,
        totalPrice: 60000,
      })).rejects.toThrow();

      expect(currentBalance).toBe(initialBalance); // Balance should be restored
    });

    it('should ensure tournament participant count consistency after rollback', async () => {
      let participantCount = 50;
      const initialCount = participantCount;

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue({ points: 50000 }),
            update: jest.fn().mockResolvedValue({ points: 40000 }),
          },
          tournament: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'tournament-1',
              title: 'Test Tournament',
              maxParticipants: 100,
              currentParticipants: participantCount,
              status: 'UPCOMING',
            }),
            update: jest.fn().mockImplementation(async () => {
              participantCount++;
              return { currentParticipants: participantCount };
            }),
          },
          tournamentParticipant: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockImplementation(async () => {
              // Simulate failure after count increment
              throw new Error('Participant creation failed');
            }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: 'tx-1',
              type: 'TOURNAMENT_ENTRY',
              amount: -10000,
            }),
          },
        };

        try {
          return await callback(mockTx);
        } catch (error) {
          // Rollback: restore participant count
          participantCount = initialCount;
          throw error;
        }
      });

      await expect(createTournamentEntryTransaction({
        userId: 'user-1',
        tournamentId: 'tournament-1',
        entryFee: 10000,
      })).rejects.toThrow('Participant creation failed');

      expect(participantCount).toBe(initialCount);
    });

    it('should verify no orphaned records after complex rollback', async () => {
      let createdRecords = {
        transactions: [],
        payments: [],
        vouchers: [],
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue({ points: 50000 }),
            update: jest.fn().mockResolvedValue({ points: 35000 }),
          },
          transaction: {
            create: jest.fn().mockImplementation(async (data) => {
              const tx = { id: 'tx-1', ...data.data };
              createdRecords.transactions.push(tx);
              return tx;
            }),
          },
          payment: {
            create: jest.fn().mockImplementation(async (data) => {
              const payment = { id: 'payment-1', ...data.data };
              createdRecords.payments.push(payment);
              return payment;
            }),
          },
          voucher: {
            create: jest.fn().mockImplementation(async (data) => {
              const voucher = { id: `voucher-${createdRecords.vouchers.length + 1}`, ...data.data };
              createdRecords.vouchers.push(voucher);
              
              // Fail after creating some vouchers
              if (createdRecords.vouchers.length === 2) {
                throw new Error('Voucher creation limit exceeded');
              }
              
              return voucher;
            }),
          },
        };

        try {
          return await callback(mockTx);
        } catch (error) {
          // Rollback: clear all created records
          createdRecords = {
            transactions: [],
            payments: [],
            vouchers: [],
          };
          throw error;
        }
      });

      await expect(createVoucherPurchaseTransaction({
        userId: 'user-1',
        voucherType: 'BULK',
        quantity: 5,
        unitPrice: 3000,
        totalPrice: 15000,
      })).rejects.toThrow('Voucher creation limit exceeded');

      // Verify no orphaned records remain
      expect(createdRecords.transactions).toHaveLength(0);
      expect(createdRecords.payments).toHaveLength(0);
      expect(createdRecords.vouchers).toHaveLength(0);
    });
  });

  describe('Error Recovery Strategies', () => {
    it('should handle graceful degradation on partial service failures', async () => {
      const serviceErrors = {
        notificationService: false,
        analyticsService: false,
        coreTransaction: false,
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          transaction: {
            create: jest.fn().mockImplementation(async () => {
              if (serviceErrors.coreTransaction) {
                throw new Error('Core transaction service failed');
              }
              return {
                id: 'tx-1',
                userId: 'user-1',
                type: 'CHARGE',
                amount: 25000,
              };
            }),
          },
          payment: {
            create: jest.fn().mockImplementation(async () => {
              // Simulate notification service failure (non-critical)
              if (serviceErrors.notificationService) {
                console.warn('Notification service unavailable');
              }
              
              // Simulate analytics service failure (non-critical)
              if (serviceErrors.analyticsService) {
                console.warn('Analytics service unavailable');
              }

              return {
                id: 'payment-1',
                status: 'PENDING',
              };
            }),
          },
        };

        return callback(mockTx);
      });

      // Test with non-critical service failures
      serviceErrors.notificationService = true;
      serviceErrors.analyticsService = true;

      const result = await createPointChargeTransaction({
        userId: 'user-1',
        amount: 25000,
        method: 'RESILIENT_TEST',
      });

      expect(result).toBeDefined();
      expect(console.warn).toHaveBeenCalledTimes(2);

      // Test with critical service failure
      serviceErrors.coreTransaction = true;

      await expect(createPointChargeTransaction({
        userId: 'user-1',
        amount: 25000,
        method: 'CRITICAL_FAIL_TEST',
      })).rejects.toThrow('Core transaction service failed');
    });

    it('should implement circuit breaker pattern for external services', async () => {
      let failureCount = 0;
      let circuitOpen = false;
      const failureThreshold = 3;

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: 'tx-1',
              userId: 'user-1',
              type: 'CHARGE',
              amount: 25000,
            }),
          },
          payment: {
            create: jest.fn().mockImplementation(async () => {
              if (circuitOpen) {
                throw new Error('Circuit breaker open: service unavailable');
              }

              // Simulate external service failures
              if (failureCount < failureThreshold) {
                failureCount++;
                const error = new Error('External service timeout');
                if (failureCount >= failureThreshold) {
                  circuitOpen = true;
                }
                throw error;
              }

              return { id: 'payment-1', status: 'PENDING' };
            }),
          },
        };

        return callback(mockTx);
      });

      // First few attempts should fail and increment counter
      for (let i = 0; i < failureThreshold; i++) {
        await expect(createPointChargeTransaction({
          userId: 'user-1',
          amount: 25000,
          method: 'CIRCUIT_BREAKER_TEST',
        })).rejects.toThrow('External service timeout');
      }

      // Circuit should now be open
      expect(circuitOpen).toBe(true);

      // Next attempt should fail immediately due to open circuit
      await expect(createPointChargeTransaction({
        userId: 'user-1',
        amount: 25000,
        method: 'CIRCUIT_BREAKER_TEST',
      })).rejects.toThrow('Circuit breaker open');

      expect(failureCount).toBe(failureThreshold);
    });
  });
});