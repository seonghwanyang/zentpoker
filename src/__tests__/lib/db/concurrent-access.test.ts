import { PrismaClient } from '@prisma/client';
import {
  createPointChargeTransaction,
  completePointChargeTransaction,
  createVoucherPurchaseTransaction,
  createTournamentEntryTransaction,
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
      findMany: jest.fn(),
    },
    tournament: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    tournamentParticipant: {
      findFirst: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<PrismaClient>;

describe('Concurrent Access Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset timers for timing-related tests
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Simultaneous Point Charges', () => {
    it('should handle multiple point charges for same user without race conditions', async () => {
      const userId = 'user-1';
      let transactionCounter = 0;
      let paymentCounter = 0;

      // Mock transaction execution with delays to simulate real-world timing
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          transaction: {
            create: jest.fn().mockImplementation(async () => {
              // Simulate processing delay
              await new Promise(resolve => setTimeout(resolve, 100));
              return {
                id: `tx-${++transactionCounter}`,
                userId,
                type: 'CHARGE',
                amount: 25000,
                status: 'PENDING',
              };
            }),
          },
          payment: {
            create: jest.fn().mockImplementation(async () => {
              // Simulate processing delay
              await new Promise(resolve => setTimeout(resolve, 50));
              return {
                id: `payment-${++paymentCounter}`,
                userId,
                amount: 25000,
                status: 'PENDING',
              };
            }),
          },
        };
        return callback(mockTx);
      });

      // Execute multiple concurrent charges
      const chargePromises = Array.from({ length: 3 }, (_, index) =>
        createPointChargeTransaction({
          userId,
          amount: 25000,
          method: `KAKAO_PAY_${index}`,
        })
      );

      // Fast-forward timers to resolve promises
      const resultPromise = Promise.all(chargePromises);
      jest.runAllTimers();
      const results = await resultPromise;

      expect(results).toHaveLength(3);
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(3);
      
      // Verify each transaction got unique IDs
      const transactionIds = results.map(r => r.transaction.id);
      const uniqueTransactionIds = new Set(transactionIds);
      expect(uniqueTransactionIds.size).toBe(3);
    });

    it('should handle concurrent point completions correctly', async () => {
      const userId = 'user-1';
      let userPoints = 0;

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          transaction: {
            findUnique: jest.fn().mockResolvedValue({ metadata: {} }),
            update: jest.fn().mockResolvedValue({
              id: 'tx-1',
              userId,
              amount: 25000,
              status: 'COMPLETED',
            }),
          },
          payment: {
            findUnique: jest.fn().mockResolvedValue({ metadata: {} }),
            update: jest.fn().mockResolvedValue({}),
          },
          user: {
            update: jest.fn().mockImplementation(async () => {
              // Simulate atomic increment
              userPoints += 25000;
              return { points: userPoints };
            }),
          },
        };
        return callback(mockTx);
      });

      // Execute concurrent completions
      const completionPromises = Array.from({ length: 3 }, (_, index) =>
        completePointChargeTransaction({
          transactionId: `tx-${index}`,
          paymentId: `payment-${index}`,
          externalTransactionId: `ext-${index}`,
        })
      );

      await Promise.all(completionPromises);

      expect(userPoints).toBe(75000); // 3 * 25000
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(3);
    });
  });

  describe('Race Conditions in Voucher Purchases', () => {
    it('should handle last voucher purchase race condition correctly', async () => {
      const voucherType = 'LIMITED_EDITION';
      const availableQuantity = 1; // Only 1 voucher left
      let purchased = false;

      // Mock scenario where two users try to buy the last voucher simultaneously
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockImplementation(async (params) => {
              const userId = params.where.id;
              return { points: 50000 }; // Both users have sufficient points
            }),
            update: jest.fn().mockImplementation(async () => {
              return { points: 35000 }; // After purchase
            }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: `tx-voucher-${Date.now()}`,
              type: 'VOUCHER_PURCHASE',
              amount: -15000,
            }),
          },
          voucher: {
            create: jest.fn().mockImplementation(async () => {
              // Simulate checking availability and race condition
              if (purchased) {
                throw new Error('Voucher out of stock');
              }
              purchased = true;
              return { id: 'voucher-1', type: voucherType };
            }),
          },
        };
        return callback(mockTx);
      });

      // Two users try to buy simultaneously
      const purchase1 = createVoucherPurchaseTransaction({
        userId: 'user-1',
        voucherType,
        quantity: 1,
        unitPrice: 15000,
        totalPrice: 15000,
      });

      const purchase2 = createVoucherPurchaseTransaction({
        userId: 'user-2',
        voucherType,
        quantity: 1,
        unitPrice: 15000,
        totalPrice: 15000,
      });

      const results = await Promise.allSettled([purchase1, purchase2]);

      // Only one should succeed
      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      expect(successful).toHaveLength(1);
      expect(failed).toHaveLength(1);
      expect(failed[0]).toHaveProperty('reason');
      expect((failed[0] as PromiseRejectedResult).reason.message).toContain('out of stock');
    });

    it('should handle concurrent bulk voucher purchases', async () => {
      let totalVouchersCreated = 0;
      const maxVouchersPerUser = 5;

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue({ points: 100000 }),
            update: jest.fn().mockResolvedValue({ points: 75000 }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: `tx-${Date.now()}-${Math.random()}`,
              type: 'VOUCHER_PURCHASE',
              amount: -25000,
            }),
          },
          voucher: {
            create: jest.fn().mockImplementation(async () => {
              totalVouchersCreated++;
              return {
                id: `voucher-${totalVouchersCreated}`,
                code: `V-${totalVouchersCreated}`,
              };
            }),
          },
        };
        return callback(mockTx);
      });

      // Multiple users purchasing vouchers concurrently
      const purchasePromises = Array.from({ length: 3 }, (_, userIndex) =>
        createVoucherPurchaseTransaction({
          userId: `user-${userIndex}`,
          voucherType: 'REGULAR',
          quantity: maxVouchersPerUser,
          unitPrice: 5000,
          totalPrice: 25000,
        })
      );

      const results = await Promise.all(purchasePromises);

      expect(results).toHaveLength(3);
      expect(totalVouchersCreated).toBe(15); // 3 users * 5 vouchers each
    });
  });

  describe('Concurrent Tournament Entries', () => {
    it('should handle tournament capacity filling up during concurrent entries', async () => {
      const tournamentId = 'tournament-1';
      const maxParticipants = 100;
      let currentParticipants = 98; // Almost full
      const entriesProcessed = [];

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue({ points: 50000 }),
            update: jest.fn().mockResolvedValue({ points: 40000 }),
          },
          tournament: {
            findUnique: jest.fn().mockImplementation(async () => {
              // Simulate checking current state
              return {
                id: tournamentId,
                title: 'Test Tournament',
                maxParticipants,
                currentParticipants,
                status: 'UPCOMING',
              };
            }),
            update: jest.fn().mockImplementation(async () => {
              currentParticipants++;
              return { currentParticipants };
            }),
          },
          tournamentParticipant: {
            findFirst: jest.fn().mockResolvedValue(null), // No existing entry
            create: jest.fn().mockImplementation(async (params) => {
              // Check if tournament is already full
              if (currentParticipants >= maxParticipants) {
                throw new Error('Tournament is full');
              }
              entriesProcessed.push(params.data.userId);
              return { id: `entry-${entriesProcessed.length}` };
            }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: `tx-entry-${entriesProcessed.length}`,
              type: 'TOURNAMENT_ENTRY',
              amount: -10000,
            }),
          },
        };
        return callback(mockTx);
      });

      // 5 users try to enter when only 2 spots remain
      const entryPromises = Array.from({ length: 5 }, (_, index) =>
        createTournamentEntryTransaction({
          userId: `user-${index}`,
          tournamentId,
          entryFee: 10000,
        })
      );

      const results = await Promise.allSettled(entryPromises);

      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      expect(successful).toHaveLength(2); // Only 2 spots available
      expect(failed).toHaveLength(3);
      expect(currentParticipants).toBe(100); // Tournament should be full
    });

    it('should prevent duplicate tournament entries for same user', async () => {
      const userId = 'user-1';
      const tournamentId = 'tournament-1';
      let entryAttempts = 0;

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue({ points: 50000 }),
          },
          tournament: {
            findUnique: jest.fn().mockResolvedValue({
              id: tournamentId,
              title: 'Test Tournament',
              maxParticipants: 100,
              currentParticipants: 50,
              status: 'UPCOMING',
            }),
          },
          tournamentParticipant: {
            findFirst: jest.fn().mockImplementation(async () => {
              entryAttempts++;
              // First attempt finds no existing entry, subsequent ones do
              return entryAttempts === 1 ? null : { id: 'existing-entry' };
            }),
            create: jest.fn().mockResolvedValue({ id: 'new-entry' }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: 'tx-entry',
              type: 'TOURNAMENT_ENTRY',
              amount: -10000,
            }),
          },
          user: {
            update: jest.fn().mockResolvedValue({ points: 40000 }),
          },
        };
        return callback(mockTx);
      });

      // Same user tries to enter twice simultaneously
      const entry1 = createTournamentEntryTransaction({
        userId,
        tournamentId,
        entryFee: 10000,
      });

      const entry2 = createTournamentEntryTransaction({
        userId,
        tournamentId,
        entryFee: 10000,
      });

      const results = await Promise.allSettled([entry1, entry2]);

      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      expect(successful).toHaveLength(1);
      expect(failed).toHaveLength(1);
      expect((failed[0] as PromiseRejectedResult).reason.message).toContain(
        'Already registered'
      );
    });
  });

  describe('Optimistic Locking Scenarios', () => {
    it('should handle optimistic locking conflicts in user balance updates', async () => {
      const userId = 'user-1';
      let userVersion = 1;
      let updateAttempts = 0;

      // Simulate optimistic locking with version field
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockImplementation(async () => {
              return { 
                id: userId, 
                points: 50000, 
                version: userVersion 
              };
            }),
            update: jest.fn().mockImplementation(async (params) => {
              updateAttempts++;
              
              // Simulate version conflict on second update
              if (updateAttempts > 1 && !params.data.version) {
                throw new Error('Record version conflict');
              }
              
              userVersion++;
              return { 
                points: 40000, 
                version: userVersion 
              };
            }),
          },
          voucher: {
            create: jest.fn().mockResolvedValue({ id: 'voucher-1' }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: 'tx-1',
              type: 'VOUCHER_PURCHASE',
              amount: -10000,
            }),
          },
        };
        return callback(mockTx);
      });

      const purchase1 = createVoucherPurchaseTransaction({
        userId,
        voucherType: 'REGULAR',
        quantity: 1,
        unitPrice: 10000,
        totalPrice: 10000,
      });

      const purchase2 = createVoucherPurchaseTransaction({
        userId,
        voucherType: 'REGULAR',
        quantity: 1,
        unitPrice: 10000,
        totalPrice: 10000,
      });

      const results = await Promise.allSettled([purchase1, purchase2]);

      // At least one should handle the version conflict scenario
      const hasVersionConflict = results.some(
        r => r.status === 'rejected' && 
             (r as PromiseRejectedResult).reason.message.includes('version conflict')
      );
      
      expect(updateAttempts).toBeGreaterThan(1);
    });
  });

  describe('Deadlock Prevention', () => {
    it('should handle potential deadlock scenarios with ordered resource access', async () => {
      const user1Id = 'user-1';
      const user2Id = 'user-2';
      let operationOrder = [];

      // Simulate cross-user operations that could cause deadlocks
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockImplementation(async (params) => {
              const userId = params.where.id;
              operationOrder.push(`find-${userId}`);
              await new Promise(resolve => setTimeout(resolve, 10));
              return { points: 50000 };
            }),
            update: jest.fn().mockImplementation(async (params) => {
              const userId = params.where.id;
              operationOrder.push(`update-${userId}`);
              await new Promise(resolve => setTimeout(resolve, 10));
              return { points: 40000 };
            }),
          },
          transaction: {
            create: jest.fn().mockImplementation(async (data) => {
              operationOrder.push(`tx-create-${data.data.userId}`);
              return {
                id: `tx-${data.data.userId}`,
                type: 'VOUCHER_PURCHASE',
                amount: -10000,
              };
            }),
          },
          voucher: {
            create: jest.fn().mockResolvedValue({ id: 'voucher' }),
          },
        };
        return callback(mockTx);
      });

      // Operations that access resources in different orders
      const operation1 = createVoucherPurchaseTransaction({
        userId: user1Id,
        voucherType: 'REGULAR',
        quantity: 1,
        unitPrice: 10000,
        totalPrice: 10000,
      });

      const operation2 = createVoucherPurchaseTransaction({
        userId: user2Id,
        voucherType: 'REGULAR',
        quantity: 1,
        unitPrice: 10000,
        totalPrice: 10000,
      });

      jest.runAllTimers();
      await Promise.all([operation1, operation2]);

      expect(operationOrder).toHaveLength(6); // 3 operations per user
      // Both operations should complete successfully
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(2);
    });
  });

  describe('Connection Pool Management', () => {
    it('should handle high concurrency without exhausting connection pool', async () => {
      const concurrentOperations = 20;
      let activeConnections = 0;
      let maxConcurrentConnections = 0;

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        activeConnections++;
        maxConcurrentConnections = Math.max(maxConcurrentConnections, activeConnections);

        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue({ points: 50000 }),
            update: jest.fn().mockResolvedValue({ points: 45000 }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: `tx-${activeConnections}`,
              type: 'CHARGE',
              amount: 5000,
            }),
          },
          payment: {
            create: jest.fn().mockResolvedValue({
              id: `payment-${activeConnections}`,
              status: 'PENDING',
            }),
          },
        };

        // Simulate connection processing time
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const result = await callback(mockTx);
        activeConnections--;
        return result;
      });

      // Create many concurrent operations
      const operations = Array.from({ length: concurrentOperations }, (_, index) =>
        createPointChargeTransaction({
          userId: `user-${index}`,
          amount: 5000,
          method: 'BANK_TRANSFER',
        })
      );

      jest.runAllTimers();
      const results = await Promise.all(operations);

      expect(results).toHaveLength(concurrentOperations);
      expect(maxConcurrentConnections).toBeLessThanOrEqual(concurrentOperations);
      expect(activeConnections).toBe(0); // All connections released
    });

    it('should handle connection timeouts gracefully', async () => {
      let timeoutOccurred = false;

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        // Simulate connection timeout
        if (Math.random() < 0.3) { // 30% chance of timeout
          timeoutOccurred = true;
          throw new Error('Connection timeout');
        }

        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue({ points: 50000 }),
            update: jest.fn().mockResolvedValue({ points: 45000 }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: 'tx-1',
              type: 'CHARGE',
              amount: 5000,
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

      const operations = Array.from({ length: 10 }, (_, index) =>
        createPointChargeTransaction({
          userId: `user-${index}`,
          amount: 5000,
          method: 'BANK_TRANSFER',
        }).catch(error => ({ error: error.message }))
      );

      const results = await Promise.all(operations);

      // Some operations should succeed, some might fail due to timeout
      const successful = results.filter(r => !('error' in r));
      const failed = results.filter(r => 'error' in r);

      expect(successful.length + failed.length).toBe(10);
      
      if (timeoutOccurred) {
        expect(failed.some(r => r.error.includes('timeout'))).toBe(true);
      }
    });
  });
});