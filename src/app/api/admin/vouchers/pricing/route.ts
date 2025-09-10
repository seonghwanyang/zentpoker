import { NextRequest, NextResponse } from 'next/server';
import { getApiUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/api-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser();
    
    if (!user?.email) {
      return unauthorizedResponse();
    }

    // 관리자 권한 확인
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('email', user.email)
      .single();

    if (adminError || !admin || admin.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    // 현재 활성화된 가격 정보 조회
    const pricingList = await prisma.voucherPricing.findMany({
      where: { isActive: true }
    });

    // 가격 정보를 구조화
    const pricing = {
      buyInRegular: 50000,
      buyInGuest: 60000,
      reBuyRegular: 30000,
      reBuyGuest: 35000
    };

    pricingList.forEach(item => {
      if (item.type === VoucherType.BUYIN && item.memberGrade === MemberGrade.REGULAR) {
        pricing.buyInRegular = item.price;
      } else if (item.type === VoucherType.BUYIN && item.memberGrade === MemberGrade.GUEST) {
        pricing.buyInGuest = item.price;
      } else if (item.type === VoucherType.REBUY && item.memberGrade === MemberGrade.REGULAR) {
        pricing.reBuyRegular = item.price;
      } else if (item.type === VoucherType.REBUY && item.memberGrade === MemberGrade.GUEST) {
        pricing.reBuyGuest = item.price;
      }
    });

    return NextResponse.json(pricing);
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getApiUser();
    
    if (!user?.email) {
      return unauthorizedResponse();
    }

    // 관리자 권한 확인
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('email', user.email)
      .single();

    if (adminError || !admin || admin.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    const body = await request.json();
    const { buyInRegular, buyInGuest, reBuyRegular, reBuyGuest } = body;

    // 입력값 검증
    if (!buyInRegular || !buyInGuest || !reBuyRegular || !reBuyGuest) {
      return NextResponse.json(
        { error: 'All price fields are required' },
        { status: 400 }
      );
    }

    // 가격이 0보다 큰지 확인
    if (buyInRegular <= 0 || buyInGuest <= 0 || reBuyRegular <= 0 || reBuyGuest <= 0) {
      return NextResponse.json(
        { error: 'Prices must be greater than 0' },
        { status: 400 }
      );
    }

    // 기존 가격 정보를 모두 비활성화
    await prisma.voucherPricing.updateMany({
      where: {
        isActive: true
      },
      data: {
        isActive: false
      }
    });

    // 개별 가격 설정 업데이트
    const updatedPricing = await prisma.$transaction([
      // BUYIN - REGULAR
      prisma.voucherPricing.create({
        data: {
          type: VoucherType.BUYIN,
          memberGrade: MemberGrade.REGULAR,
          price: Number(buyInRegular),
          isActive: true
        }
      }),
      // BUYIN - GUEST
      prisma.voucherPricing.create({
        data: {
          type: VoucherType.BUYIN,
          memberGrade: MemberGrade.GUEST,
          price: Number(buyInGuest),
          isActive: true
        }
      }),
      // REBUY - REGULAR
      prisma.voucherPricing.create({
        data: {
          type: VoucherType.REBUY,
          memberGrade: MemberGrade.REGULAR,
          price: Number(reBuyRegular),
          isActive: true
        }
      }),
      // REBUY - GUEST
      prisma.voucherPricing.create({
        data: {
          type: VoucherType.REBUY,
          memberGrade: MemberGrade.GUEST,
          price: Number(reBuyGuest),
          isActive: true
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      pricing: {
        buyInRegular: Number(buyInRegular),
        buyInGuest: Number(buyInGuest),
        reBuyRegular: Number(reBuyRegular),
        reBuyGuest: Number(reBuyGuest)
      }
    });
  } catch (error) {
    console.error('Error updating pricing:', error);
    return NextResponse.json(
      { error: 'Failed to update pricing' },
      { status: 500 }
    );
  }
}