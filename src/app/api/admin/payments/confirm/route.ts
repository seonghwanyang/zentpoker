<<<<<<< HEAD
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
=======
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { transactionId, action, memo } = body

    // 유효성 검사
    if (!transactionId || !action) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    if (!['CONFIRM', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { success: false, error: '올바른 액션이 아닙니다.' },
        { status: 400 }
      )
    }

    if (action === 'REJECT' && !memo) {
      return NextResponse.json(
        { success: false, error: '거절 사유를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 실제로는 트랜잭션으로 처리
    // 1. Transaction 상태 업데이트
    // 2. CONFIRM인 경우 User 포인트 증가
    // 3. 로그 기록

    const result = {
      transactionId,
      action,
      memo,
      processedAt: new Date().toISOString(),
      processedBy: 'admin@zentpoker.com', // 실제로는 세션에서 가져옴
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process payment confirmation' },
      { status: 500 }
    )
  }
}

// 대기 중인 입금 확인 목록 조회
export async function GET() {
  try {
    // Mock 데이터
    const pendingPayments = [
      {
        id: '1',
        userId: '1',
        userName: '김철수',
        userEmail: 'kim@example.com',
        amount: 100000,
        referenceCode: 'ZP-2024-1220-001',
        paymentMethod: 'KAKAO',
        requestedAt: '2024-12-20T09:30:00',
        status: 'PENDING',
      },
      {
        id: '2',
        userId: '2',
        userName: '이영희',
        userEmail: 'lee@example.com',
        amount: 50000,
        referenceCode: 'ZP-2024-1220-002',
        paymentMethod: 'BANK',
        requestedAt: '2024-12-20T10:15:00',
        status: 'PENDING',
      },
    ]

    return NextResponse.json({
      success: true,
      data: pendingPayments,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pending payments' },
      { status: 500 }
    )
  }
}
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
