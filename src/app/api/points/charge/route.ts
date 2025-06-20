import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { TransactionType, TransactionStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, method } = body;

    if (!amount || amount < 10000) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 참조 코드 생성
    const referenceCode = `${method === 'KAKAO_PAY' ? 'KP' : 'BT'}-${Date.now().toString().slice(-8)}`;

    // 충전 트랜잭션 생성
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: TransactionType.CHARGE,
        amount: amount,
        status: TransactionStatus.PENDING,
        description: `${method === 'KAKAO_PAY' ? '카카오페이' : '계좌이체'} 충전 신청`,
        metadata: {
          method,
          referenceCode,
          requestedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      referenceCode,
      transactionId: transaction.id,
    });
  } catch (error) {
    console.error('Error creating charge request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
