import { prisma } from '@/lib/prisma';
import { TransactionMetadata, PaymentMetadata } from '@/types/prisma';

// 포인트 충전 트랜잭션
export async function createPointChargeTransaction(data: {
  userId: string;
  amount: number;
  method: string;
  metadata?: TransactionMetadata;
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. 트랜잭션 레코드 생성
    const transaction = await tx.transaction.create({
      data: {
        userId: data.userId,
        type: 'CHARGE',
        amount: data.amount,
        status: 'PENDING',
        description: `포인트 충전 - ${data.method}`,
        metadata: data.metadata || {},
      },
    });

    // 2. 결제 레코드 생성
    const payment = await tx.payment.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        method: data.method,
        status: 'PENDING',
        transactionId: transaction.id,
        metadata: {
          referenceCode: transaction.id,
          paymentMethod: data.method,
        } as PaymentMetadata,
      },
    });

    return { transaction, payment };
  });
}

// 포인트 충전 완료 트랜잭션
export async function completePointChargeTransaction(data: {
  transactionId: string;
  paymentId: string;
  externalTransactionId?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. 트랜잭션 상태 업데이트
    const transaction = await tx.transaction.update({
      where: { id: data.transactionId },
      data: {
        status: 'COMPLETED',
        metadata: {
          ...(await tx.transaction.findUnique({
            where: { id: data.transactionId },
            select: { metadata: true },
          }))?.metadata,
          externalTransactionId: data.externalTransactionId,
          completedAt: new Date().toISOString(),
        } as TransactionMetadata,
      },
    });

    // 2. 결제 상태 업데이트
    await tx.payment.update({
      where: { id: data.paymentId },
      data: {
        status: 'COMPLETED',
        metadata: {
          ...(await tx.payment.findUnique({
            where: { id: data.paymentId },
            select: { metadata: true },
          }))?.metadata,
          externalTransactionId: data.externalTransactionId,
          completedAt: new Date().toISOString(),
        } as PaymentMetadata,
      },
    });

    // 3. 사용자 포인트 업데이트
    await tx.user.update({
      where: { id: transaction.userId },
      data: {
        points: {
          increment: transaction.amount,
        },
      },
    });

    return transaction;
  });
}

// 바우처 구매 트랜잭션
export async function createVoucherPurchaseTransaction(data: {
  userId: string;
  voucherType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  metadata?: TransactionMetadata;
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. 사용자 포인트 확인
    const user = await tx.user.findUnique({
      where: { id: data.userId },
      select: { points: true },
    });

    if (!user || user.points < data.totalPrice) {
      throw new Error('Insufficient points');
    }

    // 2. 트랜잭션 생성
    const transaction = await tx.transaction.create({
      data: {
        userId: data.userId,
        type: 'VOUCHER_PURCHASE',
        amount: -data.totalPrice, // 차감이므로 음수
        status: 'COMPLETED',
        description: `${data.voucherType === 'REBUY' ? '리바인권' : '바우처'} ${data.quantity}개 구매`,
        metadata: {
          voucherType: data.voucherType,
          quantity: data.quantity,
          unitPrice: data.unitPrice,
          totalPrice: data.totalPrice,
          ...data.metadata,
        } as TransactionMetadata,
      },
    });

    // 3. 바우처들 생성
    const voucherPromises = Array.from({ length: data.quantity }, (_, index) =>
      tx.voucher.create({
        data: {
          userId: data.userId,
          type: data.voucherType === 'REBUY' ? 'REBUY' : 'BUYIN',
          status: 'ACTIVE',
          code: data.metadata?.voucherCodes?.[index] || `RB-${Date.now()}-${index}`,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
          price: data.unitPrice,
        },
      })
    );
    const vouchers = await Promise.all(voucherPromises);

    // 4. 사용자 포인트 차감 및 잔액 조회
    const updatedUser = await tx.user.update({
      where: { id: data.userId },
      data: {
        points: {
          decrement: data.totalPrice,
        },
      },
      select: { points: true },
    });

    return {
      transaction,
      vouchers,
      userBalance: updatedUser.points,
    };
  });
}

// 토너먼트 참가 트랜잭션
export async function createTournamentEntryTransaction(data: {
  userId: string;
  tournamentId: string;
  entryFee: number;
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. 사용자 포인트 확인
    const user = await tx.user.findUnique({
      where: { id: data.userId },
      select: { points: true },
    });

    if (!user || user.points < data.entryFee) {
      throw new Error('Insufficient points');
    }

    // 2. 토너먼트 정보 확인
    const tournament = await tx.tournament.findUnique({
      where: { id: data.tournamentId },
      select: { 
        id: true, 
        title: true, 
        maxParticipants: true,
        currentParticipants: true,
        status: true 
      },
    });

    if (!tournament || tournament.status !== 'UPCOMING') {
      throw new Error('Tournament not available');
    }

    if (tournament.currentParticipants >= tournament.maxParticipants) {
      throw new Error('Tournament is full');
    }

    // 3. 중복 참가 확인
    const existingEntry = await tx.tournamentParticipant.findFirst({
      where: {
        tournamentId: data.tournamentId,
        userId: data.userId,
      },
    });

    if (existingEntry) {
      throw new Error('Already registered for this tournament');
    }

    // 4. 트랜잭션 생성
    const transaction = await tx.transaction.create({
      data: {
        userId: data.userId,
        type: 'TOURNAMENT_ENTRY',
        amount: -data.entryFee, // 차감이므로 음수
        status: 'COMPLETED',
        description: `토너먼트 참가 - ${tournament.title}`,
        metadata: {
          tournamentId: data.tournamentId,
          tournamentTitle: tournament.title,
          entryFee: data.entryFee,
        } as TransactionMetadata,
      },
    });

    // 5. 사용자 포인트 차감
    await tx.user.update({
      where: { id: data.userId },
      data: {
        points: {
          decrement: data.entryFee,
        },
      },
    });

    // 6. 토너먼트 참가자 추가
    await tx.tournamentParticipant.create({
      data: {
        tournamentId: data.tournamentId,
        userId: data.userId,
      },
    });

    // 7. 토너먼트 참가자 수 업데이트
    await tx.tournament.update({
      where: { id: data.tournamentId },
      data: {
        currentParticipants: {
          increment: 1,
        },
      },
    });

    return transaction;
  });
}

// 결제 실패 처리 트랜잭션
export async function failPaymentTransaction(data: {
  transactionId: string;
  paymentId: string;
  reason: string;
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. 트랜잭션 상태 업데이트
    await tx.transaction.update({
      where: { id: data.transactionId },
      data: {
        status: 'FAILED',
        metadata: {
          ...(await tx.transaction.findUnique({
            where: { id: data.transactionId },
            select: { metadata: true },
          }))?.metadata,
          failReason: data.reason,
          failedAt: new Date().toISOString(),
        } as TransactionMetadata,
      },
    });

    // 2. 결제 상태 업데이트
    await tx.payment.update({
      where: { id: data.paymentId },
      data: {
        status: 'FAILED',
        metadata: {
          ...(await tx.payment.findUnique({
            where: { id: data.paymentId },
            select: { metadata: true },
          }))?.metadata,
          failReason: data.reason,
          failedAt: new Date().toISOString(),
        } as PaymentMetadata,
      },
    });
  });
}

// 환불 처리 트랜잭션
export async function createRefundTransaction(data: {
  originalTransactionId: string;
  refundAmount: number;
  reason: string;
  adminId: string;
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. 원본 트랜잭션 확인
    const originalTransaction = await tx.transaction.findUnique({
      where: { id: data.originalTransactionId },
      select: { userId: true, amount: true, status: true },
    });

    if (!originalTransaction || originalTransaction.status !== 'COMPLETED') {
      throw new Error('Original transaction not found or not completed');
    }

    // 2. 환불 트랜잭션 생성
    const refundTransaction = await tx.transaction.create({
      data: {
        userId: originalTransaction.userId,
        type: 'WITHDRAWAL',
        amount: data.refundAmount,
        status: 'COMPLETED',
        description: `환불 - ${data.reason}`,
        metadata: {
          originalTransactionId: data.originalTransactionId,
          refundReason: data.reason,
          refundedBy: data.adminId,
          refundedAt: new Date().toISOString(),
        } as TransactionMetadata,
      },
    });

    // 3. 사용자 포인트 복구
    await tx.user.update({
      where: { id: originalTransaction.userId },
      data: {
        points: {
          increment: data.refundAmount,
        },
      },
    });

    return refundTransaction;
  });
}