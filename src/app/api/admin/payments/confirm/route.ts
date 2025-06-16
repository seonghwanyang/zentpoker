import { 
  requireAdmin, 
  withErrorHandling, 
  createSuccessResponse, 
  parseAndValidateBody,
  ApiError 
} from '@/lib/api/middleware';
import { 
  completePointChargeTransaction, 
  failPaymentTransaction 
} from '@/lib/db/transactions';
import { paymentConfirmSchema } from '@/lib/utils/validation';
import { prisma } from '@/lib/prisma';

interface PaymentConfirmRequest {
  transactionId: string;
  paymentId: string;
  status: 'APPROVED' | 'REJECTED';
  memo?: string;
  rejectReason?: string;
}

async function handlePaymentConfirm(request: Request) {
  // 1. 관리자 권한 확인
  const admin = await requireAdmin();

  // 2. 요청 데이터 검증
  const body = await parseAndValidateBody(request, (data) => {
    return paymentConfirmSchema.parse(data);
  });

  const { transactionId, paymentId, status, memo, rejectReason } = body as PaymentConfirmRequest;

  // 3. 트랜잭션 조회 및 검증
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { user: true },
  });

  if (!transaction) {
    throw new ApiError('트랜잭션을 찾을 수 없습니다.', 404, 'TRANSACTION_NOT_FOUND');
  }

  if (transaction.type !== 'CHARGE' || transaction.status !== 'PENDING') {
    throw new ApiError('처리할 수 없는 트랜잭션입니다.', 400, 'INVALID_TRANSACTION_STATUS');
  }

  // 4. 결제 조회 및 검증
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment || payment.transactionId !== transactionId) {
    throw new ApiError('결제 정보를 찾을 수 없습니다.', 404, 'PAYMENT_NOT_FOUND');
  }

  // 5. 승인/거절 처리
  let result;
  if (status === 'APPROVED') {
    result = await completePointChargeTransaction({
      transactionId,
      paymentId,
      externalTransactionId: `ADMIN_APPROVED_${Date.now()}`,
    });

    // 메타데이터에 관리자 정보 추가
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        metadata: {
          ...result.metadata,
          confirmedBy: admin.id,
          confirmedAt: new Date().toISOString(),
          memo,
        },
      },
    });
  } else {
    await failPaymentTransaction({
      transactionId,
      paymentId,
      reason: rejectReason || '관리자에 의해 거절됨',
    });

    // 메타데이터에 관리자 정보 추가
    result = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        metadata: {
          ...transaction.metadata,
          rejectedBy: admin.id,
          rejectedAt: new Date().toISOString(),
          rejectReason,
          memo,
        },
      },
    });
  }

  const message = status === 'APPROVED' 
    ? '결제가 승인되었습니다.' 
    : '결제가 거절되었습니다.';

  return createSuccessResponse(
    {
      transactionId: result.id,
      status: result.status,
      amount: result.amount,
      processedBy: admin.id,
      processedAt: new Date().toISOString(),
    },
    message,
  );
}

export const POST = withErrorHandling(handlePaymentConfirm);