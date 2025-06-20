import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { VoucherStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as VoucherStatus | null;

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 바인권 조회 조건
    const where: any = { userId: user.id };
    if (status) where.status = status;

    // 바인권 목록 조회
    const vouchers = await prisma.voucher.findMany({
      where,
      include: {
        tournament: {
          select: {
            id: true,
            title: true,
            startDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 통계 정보
    const stats = await prisma.voucher.groupBy({
      by: ['type', 'status'],
      where: { userId: user.id },
      _count: true,
    });

    const formattedStats = {
      buyIn: {
        active: 0,
        used: 0,
        expired: 0,
      },
      rebuy: {
        active: 0,
        used: 0,
        expired: 0,
      },
    };

    stats.forEach((stat) => {
      const type = stat.type.toLowerCase() as 'buyIn' | 'rebuy';
      const status = stat.status.toLowerCase() as 'active' | 'used' | 'expired';
      if (type === 'buyin') {
        formattedStats.buyIn[status] = stat._count;
      } else {
        formattedStats.rebuy[status] = stat._count;
      }
    });

    return NextResponse.json({ vouchers, stats: formattedStats });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
