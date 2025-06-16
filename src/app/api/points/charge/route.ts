<<<<<<< HEAD
import { 
  requireAuth, 
  withErrorHandling, 
  createSuccessResponse, 
  parseAndValidateBody,
  ApiError 
} from '@/lib/api/middleware';
import { rateLimitMiddlewares } from '@/lib/api/rate-limit';
import { createPointChargeTransaction } from '@/lib/db/transactions';
import { pointChargeSchema, validateChargeAmount } from '@/lib/utils/validation';
import { PointChargeRequest, PointChargeResponse } from '@/types/api';

// 참조 코드 생성 함수
function generateReferenceCode(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `ZP-${year}-${month}${day}-${random}`;
}

async function handlePointCharge(request: Request) {
  // 1. Rate limiting 확인
  rateLimitMiddlewares.payment(request);

  // 2. 인증 확인
  const user = await requireAuth();

  // 2. 요청 데이터 검증
  const body = await parseAndValidateBody(request, (data) => {
    return pointChargeSchema.parse(data);
  });

  const { amount, method, userType } = body as PointChargeRequest;

  // 3. 충전 정책 검증
  const validation = validateChargeAmount(amount, userType);
  if (!validation.isValid) {
    throw new ApiError(validation.message!, 400, 'INVALID_CHARGE_AMOUNT');
  }

  // 4. 트랜잭션 생성
  const referenceCode = generateReferenceCode();
  const { transaction, payment } = await createPointChargeTransaction({
    userId: user.id,
    amount,
    method,
    metadata: {
      referenceCode,
      paymentMethod: method,
      userType,
    },
  });

  // 5. 응답 데이터 구성
  const responseData: PointChargeResponse = {
    transactionId: transaction.id,
    amount,
    status: 'PENDING',
    paymentUrl: method === 'KAKAO_PAY' ? `/payment/kakao/${payment.id}` : undefined,
  };

  return createSuccessResponse(responseData, '충전 요청이 생성되었습니다.', 201);
}

export const POST = withErrorHandling(handlePointCharge);
=======
import { NextResponse } from 'next/server'

// 참조 코드 생성 함수
function generateReferenceCode() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  
  return `ZP-${year}-${month}${day}-${random}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, paymentMethod } = body

    // 유효성 검사
    if (!amount || amount < 10000) {
      return NextResponse.json(
        { success: false, error: '최소 충전 금액은 10,000원입니다.' },
        { status: 400 }
      )
    }

    // 실제로는 DB에 거래 기록 생성
    const transaction = {
      id: Date.now().toString(),
      userId: '1', // 실제로는 세션에서 가져옴
      amount,
      paymentMethod,
      referenceCode: generateReferenceCode(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create charge request' },
      { status: 500 }
    )
  }
}
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
