import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 활성화된 가격 정책 조회
    const pricing = await prisma.voucherPricing.findMany({
      where: { isActive: true },
      orderBy: [
        { type: 'asc' },
        { memberGrade: 'asc' },
      ],
    });

    // 등급별로 정리
    const priceByGrade = {
      GUEST: {
        BUYIN: 0,
        REBUY: 0,
      },
      REGULAR: {
        BUYIN: 0,
        REBUY: 0,
      },
    };

    pricing.forEach((price) => {
      if (price.memberGrade === 'GUEST' || price.memberGrade === 'REGULAR') {
        priceByGrade[price.memberGrade][price.type] = price.price;
      }
    });

    return NextResponse.json({
      pricing: priceByGrade,
      lastUpdated: pricing[0]?.updatedAt || new Date(),
    });
  } catch (error) {
    console.error('Error fetching public pricing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
