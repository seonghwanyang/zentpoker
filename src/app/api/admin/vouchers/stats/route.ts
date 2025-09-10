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

    // 바우처 통계 조회
    const [
      totalIssued,
      activeVouchers,
      expiredVouchers,
      buyinCount,
      rebuyCount
    ] = await Promise.all([
      // 총 발급 바우처
      prisma.voucher.count(),
      
      // 활성 바우처
      prisma.voucher.count({
        where: {
          status: VoucherStatus.ACTIVE,
          expiresAt: {
            gt: new Date()
          }
        }
      }),
      
      // 만료된 바우처
      prisma.voucher.count({
        where: {
          OR: [
            { status: VoucherStatus.EXPIRED },
            { status: VoucherStatus.USED },
            {
              expiresAt: {
                lte: new Date()
              }
            }
          ]
        }
      }),
      
      // Buy-in 바우처 수
      prisma.voucher.count({
        where: {
          type: VoucherType.BUYIN
        }
      }),
      
      // Re-buy 바우처 수
      prisma.voucher.count({
        where: {
          type: VoucherType.REBUY
        }
      })
    ]);

    // 바우처 가격 정보 조회
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

    // 총 입금액 계산 (발급된 바인권 수 * 가격)
    // 실제로는 외부에서 현금을 받고 수동 발급하므로 추정치
    const totalDeposit = (buyinCount * ((pricing.buyInRegular + pricing.buyInGuest) / 2)) + 
                        (rebuyCount * ((pricing.reBuyRegular + pricing.reBuyGuest) / 2));

    // 최근 바우처 발급 내역 (10개)
    const recentVouchers = await prisma.voucher.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
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

    // 최근 바우처 발급 내역 포맷
    const formattedRecentVouchers = recentVouchers.map(voucher => {
      // 사용자 등급에 따른 가격 계산
      const isGuest = voucher.user.grade === 'GUEST';
      const price = voucher.type === VoucherType.BUYIN
        ? (isGuest ? pricing.buyInGuest : pricing.buyInRegular)
        : (isGuest ? pricing.reBuyGuest : pricing.reBuyRegular);

      return {
        id: voucher.id,
        createdAt: voucher.createdAt,
        userName: voucher.user.name || voucher.user.email,
        userGrade: voucher.user.grade,
        type: voucher.type,
        price,
        status: voucher.status,
        expiresAt: voucher.expiresAt,
        tournamentName: voucher.tournament?.title || voucher.tournament?.name || null
      };
    });

    // 이번 달 신규 바우처 수
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const newVouchersThisMonth = await prisma.voucher.count({
      where: {
        createdAt: {
          gte: thisMonth
        }
      }
    });

    return NextResponse.json({
      stats: {
        totalIssued,
        activeVouchers,
        expiredVouchers,
        buyinCount,
        rebuyCount,
        totalDeposit: Math.round(totalDeposit),
        newVouchersThisMonth
      },
      pricing: {
        BUYIN: {
          REGULAR: pricing.buyInRegular,
          GUEST: pricing.buyInGuest
        },
        REBUY: {
          REGULAR: pricing.reBuyRegular,
          GUEST: pricing.reBuyGuest
        }
      },
      recentVouchers: formattedRecentVouchers
    });
  } catch (error) {
    console.error('Voucher stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voucher statistics' },
      { status: 500 }
    );
  }
}