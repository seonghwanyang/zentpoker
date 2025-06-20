import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { Role, TransactionType, TransactionStatus } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 관리자 권한 확인
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!admin || admin.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 대기 중인 충전 요청 조회
    const pendingCharges = await prisma.transaction.findMany({
      where: {
        type: TransactionType.CHARGE,
        status: TransactionStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            grade: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // 통계 정보
    const stats = {
      totalPending: pendingCharges.length,
      totalAmount: pendingCharges.reduce((sum, charge) => sum + charge.amount, 0),
      oldestRequest: pendingCharges[0]?.createdAt || null,
    };

    return NextResponse.json({
      charges: pendingCharges,
      stats,
    });
  } catch (error) {
    console.error('Error fetching pending charges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 관리자 권한 확인
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, name: true },
    });

    if (!admin || admin.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { transactionId, action, note } = body;

    if (!transactionId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 거래 조회
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: { user: true },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.type !== TransactionType.CHARGE || 
          transaction.status !== TransactionStatus.PENDING) {
        throw new Error('Invalid transaction status');
      }

      if (action === 'approve') {
        // 포인트 증가
        await tx.user.update({
          where: { id: transaction.userId },
          data: { points: { increment: transaction.amount } },
        });

        // 거래 상태 업데이트
        await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: TransactionStatus.COMPLETED,
            metadata: {
              ...(transaction.metadata as any),
              approvedBy: admin.name,
              approvedAt: new Date().toISOString(),
              note,
            },
          },
        });

        // 포인트 로그 생성
        await tx.pointLog.create({
          data: {
            userId: transaction.userId,
            amount: transaction.amount,
            type: '충전',
            description: `포인트 충전 승인 - ${transaction.amount.toLocaleString()}원`,
          },
        });

        return { success: true, action: 'approved' };
      } else {
        // 거래 거절
        await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: TransactionStatus.CANCELLED,
            metadata: {
              ...(transaction.metadata as any),
              rejectedBy: admin.name,
              rejectedAt: new Date().toISOString(),
              rejectReason: note || '관리자 거절',
            },
          },
        });

        return { success: true, action: 'rejected' };
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error processing charge:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
