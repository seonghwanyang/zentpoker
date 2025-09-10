import { NextResponse } from 'next/server';
import { getApiUser, unauthorizedResponse } from '@/lib/auth/api-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await getApiUser();
    
    if (!user?.email) {
      return unauthorizedResponse();
    }

    // 사용자 정보 조회
    const { data: userInfo, error: userError } = await supabaseAdmin
      .from('User')
      .select('grade')
      .eq('email', user.email)
      .single();

    if (userError || !userInfo) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 활성화된 가격 정책 조회
    const { data: pricing, error: pricingError } = await supabaseAdmin
      .from('voucher_pricing')
      .select('*')
      .eq('is_active', true);

    if (pricingError || !pricing) {
      return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
    }

    // 사용자 등급에 맞는 가격 찾기
    const userPricing = pricing.filter(p => p.member_grade === userInfo.grade);
    const regularPricing = pricing.filter(p => p.member_grade === 'REGULAR');

    const buyInPrice = userPricing.find(p => p.type === 'BUYIN')?.price || 0;
    const rebuyPrice = userPricing.find(p => p.type === 'REBUY')?.price || 0;
    const regularBuyInPrice = regularPricing.find(p => p.type === 'BUYIN')?.price || 0;
    const regularRebuyPrice = regularPricing.find(p => p.type === 'REBUY')?.price || 0;

    return NextResponse.json({
      userGrade: userInfo.grade,
      prices: {
        buyIn: buyInPrice,
        rebuy: rebuyPrice,
      },
      regularPrices: {
        buyIn: regularBuyInPrice,
        rebuy: regularRebuyPrice,
      },
      discountRate: userInfo.grade === 'REGULAR' ? 
        Math.round((1 - buyInPrice / (regularBuyInPrice * 1.2)) * 100) : 0,
    });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
