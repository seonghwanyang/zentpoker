<<<<<<< HEAD
import { 
  requireAuth, 
  withErrorHandling, 
  createSuccessResponse, 
  parseAndValidateBody,
  ApiError 
} from '@/lib/api/middleware';
import { rateLimitMiddlewares } from '@/lib/api/rate-limit';
import { createVoucherPurchaseTransaction } from '@/lib/db/transactions';
import { validateRebuyAmount } from '@/lib/utils/validation';
import { VoucherPurchaseRequest, VoucherPurchaseResponse } from '@/types/api';
import { z } from 'zod';

// 바우처 구매 검증 스키마
const voucherPurchaseSchema = z.object({
  voucherType: z.enum(['REBUY'], {
    errorMap: () => ({ message: '현재 리바인권만 구매 가능합니다.' }),
  }),
  quantity: z.number().min(1, '최소 1개 이상 구매해야 합니다.').max(10, '최대 10개까지 구매 가능합니다.').default(1),
  amount: z.number().min(1, '금액이 필요합니다.'),
});

// 참조 코드 생성 함수
function generateVoucherCode(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `RB-${year}${month}${day}-${random}`;
}

async function handleVoucherPurchase(request: Request) {
  // 1. Rate limiting 확인
  rateLimitMiddlewares.payment(request);

  // 2. 인증 확인
  const user = await requireAuth();

  // 3. 요청 데이터 검증
  const body = await parseAndValidateBody(request, (data) => {
    return voucherPurchaseSchema.parse(data);
  });

  const { voucherType, quantity, amount } = body as VoucherPurchaseRequest;

  // 4. 리바인권 가격 검증
  const validation = validateRebuyAmount(amount);
  if (!validation.isValid) {
    throw new ApiError(validation.message!, 400, 'INVALID_REBUY_AMOUNT');
  }

  const totalPrice = amount * quantity;

  // 5. 트랜잭션으로 구매 처리
  const { vouchers, transaction, userBalance } = await createVoucherPurchaseTransaction({
    userId: user.id,
    voucherType,
    quantity,
    unitPrice: amount,
    totalPrice,
    metadata: {
      voucherCodes: Array.from({ length: quantity }, () => generateVoucherCode()),
      purchaseType: 'REBUY_VOUCHER',
    },
  });

  // 6. 응답 데이터 구성
  const responseData: VoucherPurchaseResponse = {
    vouchers: vouchers.map(voucher => ({
      id: voucher.id,
      code: voucher.code || generateVoucherCode(),
      type: voucherType,
      status: voucher.status,
      purchasedAt: voucher.createdAt.toISOString(),
      expiresAt: voucher.expiresAt?.toISOString() || null,
      price: amount,
    })),
    transactionId: transaction.id,
    totalPrice,
    remainingBalance: userBalance,
  };

  return createSuccessResponse(responseData, `리바인권 ${quantity}개를 성공적으로 구매했습니다.`, 201);
}

export const POST = withErrorHandling(handleVoucherPurchase);
=======
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { voucherType, quantity = 1 } = body

    // 유효성 검사
    if (!voucherType || !['BUY_IN', 'RE_BUY'].includes(voucherType)) {
      return NextResponse.json(
        { success: false, error: '올바른 바인권 타입을 선택해주세요.' },
        { status: 400 }
      )
    }

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json(
        { success: false, error: '구매 수량은 1개에서 10개 사이여야 합니다.' },
        { status: 400 }
      )
    }

    // Mock 사용자 정보 (실제로는 세션에서 가져옴)
    const userGrade = 'REGULAR' // or 'GUEST'
    
    // 가격 계산
    const prices = {
      BUY_IN: userGrade === 'REGULAR' ? 50000 : 60000,
      RE_BUY: userGrade === 'REGULAR' ? 30000 : 36000,
    }
    
    const unitPrice = prices[voucherType as keyof typeof prices]
    const totalPrice = unitPrice * quantity

    // Mock 포인트 잔액 확인 (실제로는 DB에서 조회)
    const currentBalance = 150000
    
    if (currentBalance < totalPrice) {
      return NextResponse.json(
        { success: false, error: '포인트가 부족합니다.' },
        { status: 400 }
      )
    }

    // 구매 처리 (실제로는 트랜잭션으로 처리)
    const purchasedVouchers = Array.from({ length: quantity }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      type: voucherType,
      status: 'ACTIVE',
      purchasedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후
      price: unitPrice,
    }))

    return NextResponse.json({
      success: true,
      data: {
        vouchers: purchasedVouchers,
        totalPrice,
        remainingBalance: currentBalance - totalPrice,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to purchase vouchers' },
      { status: 500 }
    )
  }
}
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
