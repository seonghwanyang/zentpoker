import { NextResponse } from 'next/server';
import { getApiUser, unauthorizedResponse } from '@/lib/auth/api-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const user = await getApiUser();
    
    if (!user?.email) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // 사용자 조회
    const { data: userData, error: userError } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('email', user.email)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'User lookup failed' }, { status: 500 });
    }

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 바인권 목록 조회
    let vouchersQuery = supabaseAdmin
      .from('Voucher')
      .select(`
        *,
        tournament:Tournament(
          id,
          title,
          startDate
        )
      `)
      .eq('userId', userData.id)
      .order('createdAt', { ascending: false });

    if (status) {
      vouchersQuery = vouchersQuery.eq('status', status);
    }

    const { data: vouchers, error: vouchersError } = await vouchersQuery;

    if (vouchersError) {
      console.error('Error fetching vouchers:', vouchersError);
      return NextResponse.json({ error: 'Vouchers lookup failed' }, { status: 500 });
    }

    // 통계 정보 - Supabase doesn't have direct groupBy, so we fetch all and group manually
    const { data: allVouchers, error: statsError } = await supabaseAdmin
      .from('Voucher')
      .select('type, status')
      .eq('userId', userData.id);

    if (statsError) {
      console.error('Error fetching voucher stats:', statsError);
      return NextResponse.json({ error: 'Stats lookup failed' }, { status: 500 });
    }

    const stats = allVouchers?.reduce((acc: any, voucher: any) => {
      const key = `${voucher.type}-${voucher.status}`;
      if (!acc[key]) {
        acc[key] = { type: voucher.type, status: voucher.status, _count: 0 };
      }
      acc[key]._count += 1;
      return acc;
    }, {}) || {};

    const statsArray = Object.values(stats);

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

    statsArray.forEach((stat: any) => {
      const type = stat.type.toLowerCase() as 'buyIn' | 'rebuy';
      const status = stat.status.toLowerCase() as 'active' | 'used' | 'expired';
      if (type === 'buyin') {
        formattedStats.buyIn[status] = stat._count;
      } else {
        formattedStats.rebuy[status] = stat._count;
      }
    });

    // Add cache headers for voucher list
    return NextResponse.json(
      { vouchers, stats: formattedStats },
      {
        headers: {
          'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=59',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Revalidate every 30 seconds
export const revalidate = 30;
