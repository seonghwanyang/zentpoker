import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { VoucherType, TransactionType, TransactionStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, quantity = 1 } = body;

    if (!type || !['BUYIN', 'REBUY'].includes(type)) {
      return NextResponse.json({ error: 'Invalid voucher type' }, { status: 400 });
    }

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 사용자 조회 (with lock)
      const user = await tx.user.findUnique({
        where: { email: session.user.email! },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // 가격 정책 조회
      const pricing = await tx.voucherPricing.findFirst({
        where: {
          type: type as VoucherType,
          memberGrade: user.grade,
          isActive: true,
        },
      });

      if (!pricing) {
        throw new Error('Pricing not found');
      }

      const totalPrice = pricing.price * quantity;

      // 포인트 잔액 확인
      if (user.points < totalPrice) {
        throw new Error('Insufficient points');
      }

      // 포인트 차감
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { points: { decrement: totalPrice } },
      });

      // 바인권 생성
      const vouchers = await tx.voucher.createMany({
        data: Array(quantity).fill(null).map(() => ({
          userId: user.id,
          type: type as VoucherType,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일
        })),
      });

      // 거래 기록 생성
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          type: TransactionType.VOUCHER_PURCHASE,
          amount: -totalPrice,
          status: TransactionStatus.COMPLETED,
          description: `${type === 'BUYIN' ? 'Buy-in' : 'Re-buy'} 바인권 ${quantity}개 구매`,
          metadata: {
            voucherType: type,
            quantity,
            unitPrice: pricing.price,
            totalPrice,
          },
        },
      });

      // 포인트 로그 생성
      await tx.pointLog.create({
        data: {
          userId: user.id,
          amount: -totalPrice,
          type: '구매',
          description: `${type === 'BUYIN' ? 'Buy-in' : 'Re-buy'} 바인권 ${quantity}개 구매`,
        },
      });

      return {
        success: true,
        vouchers: vouchers.count,
        remainingPoints: updatedUser.points,
        transaction: transaction.id,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error purchasing vouchers:', error);
    
    if (error.message === 'Insufficient points') {
      return NextResponse.json({ error: '포인트가 부족합니다.' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
