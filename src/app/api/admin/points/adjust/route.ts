import { NextResponse } from 'next/server';
import { getApiUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/api-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const user = await getApiUser();
    
    if (!user?.email) {
      return unauthorizedResponse();
    }

    // 관리자 권한 확인
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('User')
      .select('id, role, name')
      .eq('email', user.email)
      .single();

    if (adminError || !admin || admin.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    const body = await request.json();
    const { userId, amount, reason } = body;

    if (!userId || !amount || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (amount === 0) {
      return NextResponse.json({ error: 'Amount cannot be zero' }, { status: 400 });
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 사용자 조회
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // 차감 시 잔액 확인
      if (amount < 0 && user.points + amount < 0) {
        throw new Error('Insufficient points');
      }

      // 포인트 업데이트
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          points: { increment: amount },
        },
      });

      // 거래 기록 생성
      const transaction = await tx.transaction.create({
        data: {
          userId: userId,
          type: TransactionType.ADMIN_ADJUSTMENT,
          amount: amount,
          status: TransactionStatus.COMPLETED,
          description: reason,
          metadata: {
            adjustedBy: admin.name,
            adjustedAt: new Date().toISOString(),
            adminId: admin.id,
          },
        },
      });

      // 포인트 로그 생성
      await tx.pointLog.create({
        data: {
          userId: userId,
          amount: amount,
          type: amount > 0 ? '관리자 지급' : '관리자 차감',
          description: reason,
        },
      });

      return {
        success: true,
        newBalance: updatedUser.points,
        transactionId: transaction.id,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error adjusting points:', error);
    
    if (error.message === 'Insufficient points') {
      return NextResponse.json({ error: '포인트가 부족합니다.' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
