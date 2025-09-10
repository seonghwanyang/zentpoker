import { NextRequest, NextResponse } from 'next/server';
import { getApiUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/api-auth';
import { supabaseAdmin } from '@/lib/supabase';

// 바인권 수동 발급 API
export async function POST(request: NextRequest) {
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
    const { 
      userId, 
      voucherType, // BUYIN or REBUY
      tournamentId, // 토너먼트 ID (선택사항)
      expiresAt // 만료일 (선택사항, 기본값: 30일 후)
    } = body;

    // 필수 필드 검증
    if (!userId || !voucherType) {
      return NextResponse.json(
        { error: 'User ID and voucher type are required' },
        { status: 400 }
      );
    }

    // 유효한 바인권 타입인지 확인
    if (!Object.values(VoucherType).includes(voucherType)) {
      return NextResponse.json(
        { error: 'Invalid voucher type' },
        { status: 400 }
      );
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        name: true, 
        email: true,
        grade: true 
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 현재 활성화된 가격 정보 조회
    const pricingList = await prisma.voucherPricing.findMany({
      where: { 
        isActive: true,
        type: voucherType,
        memberGrade: user.grade || MemberGrade.GUEST
      }
    });

    // 가격 계산
    let price = 0;
    if (pricingList.length > 0) {
      price = pricingList[0].price;
    } else {
      // 기본 가격 (가격 정보가 없을 경우)
      if (voucherType === VoucherType.BUYIN) {
        price = user.grade === MemberGrade.REGULAR ? 50000 : 60000;
      } else {
        price = user.grade === MemberGrade.REGULAR ? 30000 : 35000;
      }
    }

    // 만료일 설정 (기본값: 30일 후)
    const expiration = expiresAt 
      ? new Date(expiresAt) 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // 바인권 발급
    const voucher = await prisma.voucher.create({
      data: {
        userId,
        type: voucherType,
        status: VoucherStatus.ACTIVE,
        expiresAt: expiration,
        tournamentId: tournamentId || null
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            grade: true
          }
        },
        tournament: {
          select: {
            title: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      voucher: {
        id: voucher.id,
        userName: voucher.user.name || voucher.user.email,
        userGrade: voucher.user.grade,
        type: voucher.type,
        price: price, // 계산된 가격 사용
        status: voucher.status,
        expiresAt: voucher.expiresAt,
        tournamentName: voucher.tournament?.title || voucher.tournament?.name || null,
        createdAt: voucher.createdAt
      }
    });
  } catch (error) {
    console.error('Error issuing voucher:', error);
    return NextResponse.json(
      { error: 'Failed to issue voucher' },
      { status: 500 }
    );
  }
}

// 바인권 목록 조회
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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    // 필터 조건 구성
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status as VoucherStatus;
    if (type) where.type = type as VoucherType;

    // 바인권 목록 조회
    const vouchers = await prisma.voucher.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: 50, // 최대 50개
      include: {
        user: {
          select: {
            name: true,
            email: true,
            grade: true
          }
        },
        tournament: {
          select: {
            title: true,
            name: true
          }
        }
      }
    });

    // 응답 포맷팅
    const formattedVouchers = vouchers.map(voucher => ({
      id: voucher.id,
      userName: voucher.user.name || voucher.user.email,
      userGrade: voucher.user.grade,
      type: voucher.type,
      price: 0, // 가격 정보는 별도 계산 필요
      status: voucher.status,
      expiresAt: voucher.expiresAt,
      tournamentName: voucher.tournament?.title || voucher.tournament?.name || null,
      createdAt: voucher.createdAt
    }));

    return NextResponse.json({
      vouchers: formattedVouchers,
      total: formattedVouchers.length
    });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vouchers' },
      { status: 500 }
    );
  }
}