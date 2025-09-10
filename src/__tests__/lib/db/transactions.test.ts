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
import { TransactionMetadata } from '@/types/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
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
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
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

describe('Transaction Integrity Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Point Charge Transactions', () => {
    describe('createPointChargeTransaction', () => {
      it('should create transaction and payment records atomically', async () => {
        const mockTransaction = {
          id: 'tx-1',
          userId: 'user-1',
          type: 'CHARGE',
          amount: 25000,
          status: 'PENDING',
        };
        const mockPayment = {
          id: 'payment-1',
          userId: 'user-1',
          amount: 25000,
          status: 'PENDING',
        };

        const mockTx = {
          transaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
          payment: {
            create: jest.fn().mockResolvedValue(mockPayment),
          },
        };

        mockPrisma.$transaction.mockImplementation(async (callback) => {
          return callback(mockTx);
        });

        const data = {
          userId: 'user-1',
          amount: 25000,
          method: 'KAKAO_PAY',
          metadata: { referenceCode: 'ref-123' } as TransactionMetadata,
        };

        const result = await createPointChargeTransaction(data);

        expect(result).toEqual({
          transaction: mockTransaction,
          payment: mockPayment,
        });
        expect(mockTx.transaction.create).toHaveBeenCalledWith({
          data: {
            userId: 'user-1',
            type: 'CHARGE',
            amount: 25000,
            status: 'PENDING',
            description: '포인트 충전 - KAKAO_PAY',
            metadata: { referenceCode: 'ref-123' },
          },
        });
        expect(mockTx.payment.create).toHaveBeenCalledWith({
          data: {
            userId: 'user-1',
            amount: 25000,
            method: 'KAKAO_PAY',
            status: 'PENDING',
            transactionId: 'tx-1',
            metadata: {
              referenceCode: 'tx-1',
              paymentMethod: 'KAKAO_PAY',
            },
          },
        });
      });

      it('should rollback if payment creation fails', async () => {
        const mockTx = {
          transaction: {
            create: jest.fn().mockResolvedValue({ id: 'tx-1' }),
          },
          payment: {
            create: jest.fn().mockRejectedValue(new Error('Payment creation failed')),
          },
        };

        mockPrisma.$transaction.mockImplementation(async (callback) => {
          return callback(mockTx);
        });

        const data = {
          userId: 'user-1',
          amount: 25000,
          method: 'KAKAO_PAY',
        };

        await expect(createPointChargeTransaction(data)).rejects.toThrow(
          'Payment creation failed'
        );
      });
    });

    describe('completePointChargeTransaction', () => {
      it('should complete transaction, payment, and update user points atomically', async () => {
        const mockExistingTransaction = {
          metadata: { referenceCode: 'ref-123' },
        };
        const mockExistingPayment = {
          metadata: { paymentMethod: 'KAKAO_PAY' },
        };
        const mockCompletedTransaction = {
          id: 'tx-1',
          userId: 'user-1',
          amount: 25000,
          status: 'COMPLETED',
        };

        const mockTx = {
          transaction: {
            findUnique: jest.fn().mockResolvedValue(mockExistingTransaction),
            update: jest.fn().mockResolvedValue(mockCompletedTransaction),
          },
          payment: {
            findUnique: jest.fn().mockResolvedValue(mockExistingPayment),
            update: jest.fn().mockResolvedValue({}),
          },
          user: {
            update: jest.fn().mockResolvedValue({}),
          },
        };

        mockPrisma.$transaction.mockImplementation(async (callback) => {
          return callback(mockTx);
        });

        const data = {
          transactionId: 'tx-1',
          paymentId: 'payment-1',
          externalTransactionId: 'ext-tx-123',
        };

        const result = await completePointChargeTransaction(data);

        expect(result).toEqual(mockCompletedTransaction);
        expect(mockTx.transaction.update).toHaveBeenCalledWith({
          where: { id: 'tx-1' },
          data: {
            status: 'COMPLETED',
            metadata: expect.objectContaining({
              referenceCode: 'ref-123',
              externalTransactionId: 'ext-tx-123',
              completedAt: expect.any(String),
            }),
          },
        });
        expect(mockTx.user.update).toHaveBeenCalledWith({
          where: { id: 'user-1' },
          data: {
            points: {
              increment: 25000,
            },
          },
        });
      });

      it('should preserve existing metadata when updating', async () => {
        const existingMetadata = {
          referenceCode: 'ref-123',
          paymentMethod: 'KAKAO_PAY',
          initialData: 'should-be-preserved',
        };

        const mockTx = {
          transaction: {
            findUnique: jest.fn().mockResolvedValue({ metadata: existingMetadata }),
            update: jest.fn().mockResolvedValue({ id: 'tx-1', userId: 'user-1', amount: 25000 }),
          },
          payment: {
            findUnique: jest.fn().mockResolvedValue({ metadata: {} }),
            update: jest.fn().mockResolvedValue({}),
          },
          user: {
            update: jest.fn().mockResolvedValue({}),
          },
        };

        mockPrisma.$transaction.mockImplementation(async (callback) => {
          return callback(mockTx);
        });

        await completePointChargeTransaction({
          transactionId: 'tx-1',
          paymentId: 'payment-1',
          externalTransactionId: 'ext-tx-123',
        });

        expect(mockTx.transaction.update).toHaveBeenCalledWith({
          where: { id: 'tx-1' },
          data: {
            status: 'COMPLETED',
            metadata: expect.objectContaining({
              referenceCode: 'ref-123',
              paymentMethod: 'KAKAO_PAY',
              initialData: 'should-be-preserved',
              externalTransactionId: 'ext-tx-123',
            }),
          },
        });
      });
    });
  });

  describe('Voucher Purchase Transactions', () => {
    describe('createVoucherPurchaseTransaction', () => {
      it('should check user balance, create transaction, vouchers, and update points atomically', async () => {
        const mockUser = { points: 50000 };
        const mockTransaction = {
          id: 'tx-voucher-1',
          userId: 'user-1',
          type: 'VOUCHER_PURCHASE',
          amount: -30000,
        };
        const mockVouchers = [
          { id: 'v-1', code: 'RB-001', type: 'REBUY' },
          { id: 'v-2', code: 'RB-002', type: 'REBUY' },
        ];
        const mockUpdatedUser = { points: 20000 };

        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue(mockUpdatedUser),
          },
          transaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
          voucher: {
            create: jest.fn()
              .mockResolvedValueOnce(mockVouchers[0])
              .mockResolvedValueOnce(mockVouchers[1]),
          },
        };

        mockPrisma.$transaction.mockImplementation(async (callback) => {
          return callback(mockTx);
        });

        const data = {
          userId: 'user-1',
          voucherType: 'REBUY',
          quantity: 2,
          unitPrice: 15000,
          totalPrice: 30000,
          metadata: {
            voucherCodes: ['RB-001', 'RB-002'],
          } as TransactionMetadata,
        };

        const result = await createVoucherPurchaseTransaction(data);

        expect(result).toEqual({
          transaction: mockTransaction,
          vouchers: mockVouchers,
          userBalance: 20000,
        });

        expect(mockTx.user.findUnique).toHaveBeenCalledWith({
          where: { id: 'user-1' },
          select: { points: true },
        });
        expect(mockTx.voucher.create).toHaveBeenCalledTimes(2);
        expect(mockTx.user.update).toHaveBeenCalledWith({
          where: { id: 'user-1' },
          data: {
            points: {
              decrement: 30000,
            },
          },
          select: { points: true },
        });
      });

      it('should throw error if user has insufficient points', async () => {
        const mockUser = { points: 10000 }; // Insufficient balance

        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue(mockUser),
          },
        };

        mockPrisma.$transaction.mockImplementation(async (callback) => {
          return callback(mockTx);
        });

        const data = {
          userId: 'user-1',
          voucherType: 'REBUY',
          quantity: 2,
          unitPrice: 15000,
          totalPrice: 30000,
        };

        await expect(createVoucherPurchaseTransaction(data)).rejects.toThrow(
          'Insufficient points'
        );
      });

      it('should throw error if user not found', async () => {
        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };

        mockPrisma.$transaction.mockImplementation(async (callback) => {
          return callback(mockTx);
        });

        const data = {
          userId: 'user-1',
          voucherType: 'REBUY',
          quantity: 1,
          unitPrice: 15000,
          totalPrice: 15000,
        };

        await expect(createVoucherPurchaseTransaction(data)).rejects.toThrow(
          'Insufficient points'
        );
      });
    });
  });

  describe('Tournament Entry Transactions', () => {
    describe('createTournamentEntryTransaction', () => {
      it('should check conditions and create entry atomically', async () => {
        const mockUser = { points: 50000 };
        const mockTournament = {
          id: 'tournament-1',
          title: 'Test Tournament',
          maxParticipants: 100,
          currentParticipants: 50,
          status: 'UPCOMING',
        };
        const mockTransaction = {
          id: 'tx-entry-1',
          userId: 'user-1',
          type: 'TOURNAMENT_ENTRY',
          amount: -10000,
        };

        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue({}),
          },
          tournament: {
            findUnique: jest.fn().mockResolvedValue(mockTournament),
            update: jest.fn().mockResolvedValue({}),
          },
          tournamentParticipant: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({}),
          },
          transaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
        };

        mockPrisma.$transaction.mockImplementation(async (callback) => {
          return callback(mockTx);
        });

        const data = {
          userId: 'user-1',
          tournamentId: 'tournament-1',
          entryFee: 10000,
        };

        const result = await createTournamentEntryTransaction(data);

        expect(result).toEqual(mockTransaction);
        expect(mockTx.tournamentParticipant.create).toHaveBeenCalledWith({
          data: {
            tournamentId: 'tournament-1',
            userId: 'user-1',
          },
        });
        expect(mockTx.tournament.update).toHaveBeenCalledWith({
          where: { id: 'tournament-1' },
          data: {
            currentParticipants: {
              increment: 1,
            },
          },
        });
      });

      it('should throw error if tournament is full', async () => {
        const mockUser = { points: 50000 };
        const mockTournament = {
          id: 'tournament-1',
          title: 'Test Tournament',
          maxParticipants: 100,
          currentParticipants: 100, // Full
          status: 'UPCOMING',
        };

        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue(mockUser),
          },
          tournament: {
            findUnique: jest.fn().mockResolvedValue(mockTournament),
          },
        };

        mockPrisma.$transaction.mockImplementation(async (callback) => {
          return callback(mockTx);
        });

        const data = {
          userId: 'user-1',
          tournamentId: 'tournament-1',
          entryFee: 10000,
        };

        await expect(createTournamentEntryTransaction(data)).rejects.toThrow(
          'Tournament is full'
        );
      });

      it('should throw error if user already registered', async () => {
        const mockUser = { points: 50000 };
        const mockTournament = {
          id: 'tournament-1',
          title: 'Test Tournament',
          maxParticipants: 100,
          currentParticipants: 50,
          status: 'UPCOMING',
        };
        const existingEntry = { id: 'entry-1' };

        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue(mockUser),
          },
          tournament: {
            findUnique: jest.fn().mockResolvedValue(mockTournament),
          },
          tournamentParticipant: {
            findFirst: jest.fn().mockResolvedValue(existingEntry),
          },
        };

        mockPrisma.$transaction.mockImplementation(async (callback) => {
          return callback(mockTx);
        });

        const data = {
          userId: 'user-1',
          tournamentId: 'tournament-1',
          entryFee: 10000,
        };

        await expect(createTournamentEntryTransaction(data)).rejects.toThrow(
          'Already registered for this tournament'
        );
      });
    });
  });

  describe('Payment Failure Transactions', () => {
    describe('failPaymentTransaction', () => {
      it('should update transaction and payment status with failure info', async () => {
        const mockExistingTransaction = { metadata: { referenceCode: 'ref-123' } };
        const mockExistingPayment = { metadata: { paymentMethod: 'KAKAO_PAY' } };

        const mockTx = {
          transaction: {
            findUnique: jest.fn().mockResolvedValue(mockExistingTransaction),
            update: jest.fn().mockResolvedValue({}),
          },
          payment: {
            findUnique: jest.fn().mockResolvedValue(mockExistingPayment),
            update: jest.fn().mockResolvedValue({}),
          },
        };

        mockPrisma.$transaction.mockImplementation(async (callback) => {
          return callback(mockTx);
        });

        const data = {
          transactionId: 'tx-1',
          paymentId: 'payment-1',
          reason: 'Insufficient funds',
        };

        await failPaymentTransaction(data);

        expect(mockTx.transaction.update).toHaveBeenCalledWith({
          where: { id: 'tx-1' },
          data: {
            status: 'FAILED',
            metadata: expect.objectContaining({
              referenceCode: 'ref-123',
              failReason: 'Insufficient funds',
              failedAt: expect.any(String),
            }),
          },
        });
        expect(mockTx.payment.update).toHaveBeenCalledWith({
          where: { id: 'payment-1' },
          data: {
            status: 'FAILED',
            metadata: expect.objectContaining({
              paymentMethod: 'KAKAO_PAY',
              failReason: 'Insufficient funds',
              failedAt: expect.any(String),
            }),
          },
        });
      });
    });
  });

  describe('Refund Transactions', () => {
    describe('createRefundTransaction', () => {
      it('should create refund transaction and restore user points', async () => {
        const mockOriginalTransaction = {
          userId: 'user-1',
          amount: 25000,
          status: 'COMPLETED',
        };
        const mockRefundTransaction = {
          id: 'refund-tx-1',
          userId: 'user-1',
          type: 'WITHDRAWAL',
          amount: 25000,
        };

        const mockTx = {
          transaction: {
            findUnique: jest.fn().mockResolvedValue(mockOriginalTransaction),
            create: jest.fn().mockResolvedValue(mockRefundTransaction),
          },
          user: {
            update: jest.fn().mockResolvedValue({}),
          },
        };

        mockPrisma.$transaction.mockImplementation(async (callback) => {
          return callback(mockTx);
        });

        const data = {
          originalTransactionId: 'tx-1',
          refundAmount: 25000,
          reason: 'Customer request',
          adminId: 'admin-1',
        };

        const result = await createRefundTransaction(data);

        expect(result).toEqual(mockRefundTransaction);
        expect(mockTx.transaction.create).toHaveBeenCalledWith({
          data: {
            userId: 'user-1',
            type: 'WITHDRAWAL',
            amount: 25000,
            status: 'COMPLETED',
            description: '환불 - Customer request',
            metadata: {
              originalTransactionId: 'tx-1',
              refundReason: 'Customer request',
              refundedBy: 'admin-1',
              refundedAt: expect.any(String),
            },
          },
        });
        expect(mockTx.user.update).toHaveBeenCalledWith({
          where: { id: 'user-1' },
          data: {
            points: {
              increment: 25000,
            },
          },
        });
      });

      it('should throw error if original transaction not found', async () => {
        const mockTx = {
          transaction: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };

        mockPrisma.$transaction.mockImplementation(async (callback) => {
          return callback(mockTx);
        });

        const data = {
          originalTransactionId: 'non-existent-tx',
          refundAmount: 25000,
          reason: 'Customer request',
          adminId: 'admin-1',
        };

        await expect(createRefundTransaction(data)).rejects.toThrow(
          'Original transaction not found or not completed'
        );
      });

      it('should throw error if original transaction not completed', async () => {
        const mockOriginalTransaction = {
          userId: 'user-1',
          amount: 25000,
          status: 'PENDING', // Not completed
        };

        const mockTx = {
          transaction: {
            findUnique: jest.fn().mockResolvedValue(mockOriginalTransaction),
          },
        };

        mockPrisma.$transaction.mockImplementation(async (callback) => {
          return callback(mockTx);
        });

        const data = {
          originalTransactionId: 'tx-1',
          refundAmount: 25000,
          reason: 'Customer request',
          adminId: 'admin-1',
        };

        await expect(createRefundTransaction(data)).rejects.toThrow(
          'Original transaction not found or not completed'
        );
      });
    });
  });

  describe('Nested Transactions', () => {
    it('should handle nested transaction operations correctly', async () => {
      // This tests the scenario where multiple operations are chained within a single transaction
      const mockUser = { points: 100000 };
      const mockTournament = {
        id: 'tournament-1',
        title: 'Test Tournament',
        maxParticipants: 100,
        currentParticipants: 50,
        status: 'UPCOMING',
      };

      const mockTx = {
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser),
          update: jest.fn().mockResolvedValue({ points: 85000 }),
        },
        tournament: {
          findUnique: jest.fn().mockResolvedValue(mockTournament),
          update: jest.fn().mockResolvedValue({}),
        },
        tournamentParticipant: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({}),
        },
        transaction: {
          create: jest.fn().mockResolvedValue({
            id: 'tx-entry-1',
            userId: 'user-1',
            type: 'TOURNAMENT_ENTRY',
            amount: -15000,
          }),
        },
        voucher: {
          create: jest.fn().mockResolvedValue({ id: 'v-1', code: 'ENTRY-001' }),
        },
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      // Simulate a complex operation that involves multiple steps
      const result = await createTournamentEntryTransaction({
        userId: 'user-1',
        tournamentId: 'tournament-1',
        entryFee: 15000,
      });

      expect(result).toBeDefined();
      expect(mockTx.user.findUnique).toHaveBeenCalled();
      expect(mockTx.tournament.findUnique).toHaveBeenCalled();
      expect(mockTx.tournamentParticipant.findFirst).toHaveBeenCalled();
      expect(mockTx.transaction.create).toHaveBeenCalled();
    });
  });

  describe('Transaction Isolation', () => {
    it('should maintain data consistency during concurrent modifications', async () => {
      // Mock scenario where user data is being modified concurrently
      const initialUser = { points: 50000 };
      const updatedUser = { points: 40000 };

      const mockTx = {
        user: {
          findUnique: jest.fn().mockResolvedValue(initialUser),
          update: jest.fn().mockResolvedValue(updatedUser),
        },
        transaction: {
          create: jest.fn().mockResolvedValue({
            id: 'tx-1',
            userId: 'user-1',
            type: 'VOUCHER_PURCHASE',
            amount: -10000,
          }),
        },
        voucher: {
          create: jest.fn().mockResolvedValue({ id: 'v-1', code: 'V-001' }),
        },
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const result = await createVoucherPurchaseTransaction({
        userId: 'user-1',
        voucherType: 'BUYIN',
        quantity: 1,
        unitPrice: 10000,
        totalPrice: 10000,
      });

      expect(result.userBalance).toBe(40000);
      // Verify that the transaction maintained consistency
      expect(mockTx.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { points: true },
      });
      expect(mockTx.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { points: { decrement: 10000 } },
        select: { points: true },
      });
    });

    it('should handle database deadlocks gracefully', async () => {
      // Simulate database deadlock error
      const deadlockError = new Error('deadlock detected');
      deadlockError.name = 'PrismaClientKnownRequestError';
      (deadlockError as any).code = 'P2034';

      mockPrisma.$transaction.mockRejectedValue(deadlockError);

      const data = {
        userId: 'user-1',
        voucherType: 'BUYIN',
        quantity: 1,
        unitPrice: 10000,
        totalPrice: 10000,
      };

      await expect(createVoucherPurchaseTransaction(data)).rejects.toThrow('deadlock detected');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle null/undefined transaction metadata', async () => {
      const mockTransaction = {
        id: 'tx-1',
        userId: 'user-1',
        type: 'CHARGE',
        amount: 25000,
        status: 'PENDING',
      };
      const mockPayment = {
        id: 'payment-1',
        userId: 'user-1',
        amount: 25000,
        status: 'PENDING',
      };

      const mockTx = {
        transaction: {
          create: jest.fn().mockResolvedValue(mockTransaction),
        },
        payment: {
          create: jest.fn().mockResolvedValue(mockPayment),
        },
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const data = {
        userId: 'user-1',
        amount: 25000,
        method: 'KAKAO_PAY',
        metadata: null as any, // null metadata
      };

      const result = await createPointChargeTransaction(data);

      expect(result).toEqual({
        transaction: mockTransaction,
        payment: mockPayment,
      });
    });

    it('should handle very large amounts', async () => {
      const largeAmount = 999999999;
      const mockUser = { points: 1000000000 };
      const mockTransaction = {
        id: 'tx-large',
        userId: 'user-1',
        type: 'VOUCHER_PURCHASE',
        amount: -largeAmount,
      };

      const mockTx = {
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser),
          update: jest.fn().mockResolvedValue({ points: 1 }),
        },
        transaction: {
          create: jest.fn().mockResolvedValue(mockTransaction),
        },
        voucher: {
          create: jest.fn().mockResolvedValue({ id: 'v-1', code: 'V-001' }),
        },
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const data = {
        userId: 'user-1',
        voucherType: 'BUYIN',
        quantity: 1,
        unitPrice: largeAmount,
        totalPrice: largeAmount,
      };

      const result = await createVoucherPurchaseTransaction(data);

      expect(result.transaction.amount).toBe(-largeAmount);
      expect(mockTx.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { points: { decrement: largeAmount } },
        select: { points: true },
      });
    });

    it('should handle zero amount transactions', async () => {
      const mockUser = { points: 50000 };
      const mockTransaction = {
        id: 'tx-zero',
        userId: 'user-1',
        type: 'VOUCHER_PURCHASE',
        amount: 0,
      };

      const mockTx = {
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser),
          update: jest.fn().mockResolvedValue(mockUser),
        },
        transaction: {
          create: jest.fn().mockResolvedValue(mockTransaction),
        },
        voucher: {
          create: jest.fn().mockResolvedValue({ id: 'v-1', code: 'V-001' }),
        },
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const data = {
        userId: 'user-1',
        voucherType: 'BUYIN',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      };

      const result = await createVoucherPurchaseTransaction(data);

      expect(result.transaction.amount).toBe(0);
      expect(result.userBalance).toBe(50000); // No change
    });

    it('should handle network timeouts during transaction', async () => {
      const timeoutError = new Error('Connection timeout');
      timeoutError.name = 'PrismaClientInitializationError';

      mockPrisma.$transaction.mockRejectedValue(timeoutError);

      const data = {
        userId: 'user-1',
        amount: 25000,
        method: 'KAKAO_PAY',
        metadata: { referenceCode: 'ref-123' } as TransactionMetadata,
      };

      await expect(createPointChargeTransaction(data)).rejects.toThrow('Connection timeout');
    });

    it('should preserve existing metadata during updates', async () => {
      const existingTransactionMetadata = {
        referenceCode: 'ref-123',
        customField: 'preserve-me',
        nestedObject: { keepThis: true },
      };
      
      const existingPaymentMetadata = {
        paymentMethod: 'KAKAO_PAY',
        externalId: 'ext-123',
        processingData: { important: 'data' },
      };

      const mockTx = {
        transaction: {
          findUnique: jest.fn().mockResolvedValue({ 
            metadata: existingTransactionMetadata,
            userId: 'user-1',
            amount: 25000,
          }),
          update: jest.fn().mockResolvedValue({ id: 'tx-1' }),
        },
        payment: {
          findUnique: jest.fn().mockResolvedValue({ 
            metadata: existingPaymentMetadata 
          }),
          update: jest.fn().mockResolvedValue({}),
        },
        user: {
          update: jest.fn().mockResolvedValue({}),
        },
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      await completePointChargeTransaction({
        transactionId: 'tx-1',
        paymentId: 'payment-1',
        externalTransactionId: 'ext-tx-456',
      });

      // Verify that existing metadata was preserved and new fields added
      expect(mockTx.transaction.update).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
        data: {
          status: 'COMPLETED',
          metadata: expect.objectContaining({
            referenceCode: 'ref-123',
            customField: 'preserve-me',
            nestedObject: { keepThis: true },
            externalTransactionId: 'ext-tx-456',
            completedAt: expect.any(String),
          }),
        },
      });

      expect(mockTx.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment-1' },
        data: {
          status: 'COMPLETED',
          metadata: expect.objectContaining({
            paymentMethod: 'KAKAO_PAY',
            externalId: 'ext-123',
            processingData: { important: 'data' },
            externalTransactionId: 'ext-tx-456',
            completedAt: expect.any(String),
          }),
        },
      });
    });
  });

  describe('Race Condition Handling', () => {
    it('should handle concurrent voucher purchases for same user', async () => {
      const mockUser = { points: 50000 };
      
      // First transaction should succeed
      const firstTx = {
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser),
          update: jest.fn().mockResolvedValue({ points: 40000 }),
        },
        transaction: {
          create: jest.fn().mockResolvedValue({
            id: 'tx-1',
            userId: 'user-1',
            type: 'VOUCHER_PURCHASE',
            amount: -10000,
          }),
        },
        voucher: {
          create: jest.fn().mockResolvedValue({ id: 'v-1', code: 'V-001' }),
        },
      };

      // Second concurrent transaction should see updated balance
      const secondTx = {
        user: {
          findUnique: jest.fn().mockResolvedValue({ points: 40000 }), // Updated balance
          update: jest.fn().mockResolvedValue({ points: 30000 }),
        },
        transaction: {
          create: jest.fn().mockResolvedValue({
            id: 'tx-2',
            userId: 'user-1',
            type: 'VOUCHER_PURCHASE',
            amount: -10000,
          }),
        },
        voucher: {
          create: jest.fn().mockResolvedValue({ id: 'v-2', code: 'V-002' }),
        },
      };

      let callCount = 0;
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        callCount++;
        if (callCount === 1) {
          return callback(firstTx);
        } else {
          return callback(secondTx);
        }
      });

      const data = {
        userId: 'user-1',
        voucherType: 'BUYIN',
        quantity: 1,
        unitPrice: 10000,
        totalPrice: 10000,
      };

      // Execute both transactions
      const result1 = await createVoucherPurchaseTransaction(data);
      const result2 = await createVoucherPurchaseTransaction(data);

      expect(result1.userBalance).toBe(40000);
      expect(result2.userBalance).toBe(30000);
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(2);
    });

    it('should handle tournament capacity race conditions', async () => {
      const mockUser = { points: 50000 };
      const almostFullTournament = {
        id: 'tournament-1',
        title: 'Almost Full Tournament',
        maxParticipants: 100,
        currentParticipants: 99, // One spot left
        status: 'UPCOMING',
      };

      let registrationAttempts = 0;
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        registrationAttempts++;
        
        const mockTx = {
          user: {
            findUnique: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue({}),
          },
          tournament: {
            findUnique: jest.fn().mockResolvedValue({
              ...almostFullTournament,
              currentParticipants: registrationAttempts === 1 ? 99 : 100, // First gets 99, second gets 100 (full)
            }),
            update: jest.fn().mockResolvedValue({}),
          },
          tournamentParticipant: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({}),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: `tx-${registrationAttempts}`,
              userId: 'user-1',
              type: 'TOURNAMENT_ENTRY',
              amount: -10000,
            }),
          },
        };

        return callback(mockTx);
      });

      const data = {
        userId: 'user-1',
        tournamentId: 'tournament-1',
        entryFee: 10000,
      };

      // First registration should succeed
      const result1 = await createTournamentEntryTransaction(data);
      expect(result1.id).toBe('tx-1');

      // Second registration should fail due to tournament being full
      await expect(createTournamentEntryTransaction({
        ...data,
        userId: 'user-2', // Different user
      })).rejects.toThrow('Tournament is full');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle bulk voucher creation efficiently', async () => {
      const mockUser = { points: 500000 };
      const largeQuantity = 50;
      const expectedVouchers = Array.from({ length: largeQuantity }, (_, i) => ({
        id: `v-${i + 1}`,
        code: `BULK-${String(i + 1).padStart(3, '0')}`,
        type: 'BUYIN',
      }));

      const mockTx = {
        user: {
          findUnique: jest.fn().mockResolvedValue(mockUser),
          update: jest.fn().mockResolvedValue({ points: 250000 }),
        },
        transaction: {
          create: jest.fn().mockResolvedValue({
            id: 'tx-bulk',
            userId: 'user-1',
            type: 'VOUCHER_PURCHASE',
            amount: -250000,
          }),
        },
        voucher: {
          create: jest.fn()
            .mockImplementation(() => Promise.resolve(expectedVouchers.shift())),
        },
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const data = {
        userId: 'user-1',
        voucherType: 'BUYIN',
        quantity: largeQuantity,
        unitPrice: 5000,
        totalPrice: 250000,
      };

      const result = await createVoucherPurchaseTransaction(data);

      expect(result.vouchers).toHaveLength(largeQuantity);
      expect(mockTx.voucher.create).toHaveBeenCalledTimes(largeQuantity);
      expect(result.userBalance).toBe(250000);
    });
  });
});