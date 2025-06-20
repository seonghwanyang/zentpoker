import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { grade: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 활성화된 가격 정책 조회
    const pricing = await prisma.voucherPricing.findMany({
      where: { isActive: true },
    });

    // 사용자 등급에 맞는 가격 찾기
    const userPricing = pricing.filter(p => p.memberGrade === user.grade);
    const regularPricing = pricing.filter(p => p.memberGrade === 'REGULAR');

    const buyInPrice = userPricing.find(p => p.type === 'BUYIN')?.price || 0;
    const rebuyPrice = userPricing.find(p => p.type === 'REBUY')?.price || 0;
    const regularBuyInPrice = regularPricing.find(p => p.type === 'BUYIN')?.price || 0;
    const regularRebuyPrice = regularPricing.find(p => p.type === 'REBUY')?.price || 0;

    return NextResponse.json({
      userGrade: user.grade,
      prices: {
        buyIn: buyInPrice,
        rebuy: rebuyPrice,
      },
      regularPrices: {
        buyIn: regularBuyInPrice,
        rebuy: regularRebuyPrice,
      },
      discountRate: user.grade === 'REGULAR' ? 
        Math.round((1 - buyInPrice / (regularBuyInPrice * 1.2)) * 100) : 0,
    });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
