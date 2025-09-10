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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7days';
    const reportType = searchParams.get('type') || 'revenue';
    
    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // 성능 최적화: 병렬 쿼리 실행
    const [depositsResult, membersResult, transactionsResult] = await Promise.all([
      // Total deposits - CHARGE 타입의 총액
      supabaseAdmin
        .from('Transaction')
        .select('amount')
        .eq('type', 'CHARGE')
        .eq('status', 'COMPLETED')  // 완료된 거래만
        .gte('createdAt', startDate.toISOString())
        .lte('createdAt', now.toISOString()),
      
      // Total members
      supabaseAdmin
        .from('User')
        .select('id', { count: 'exact', head: true }), // COUNT만 필요
      
      // Total transactions
      supabaseAdmin
        .from('Transaction')
        .select('id', { count: 'exact', head: true })
        .gte('createdAt', startDate.toISOString())
        .lte('createdAt', now.toISOString())
    ]);

    const totalDeposits = depositsResult.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    const totalMembers = membersResult.count || 0;
    const totalTransactions = transactionsResult.count || 0;
    const avgTransaction = totalTransactions > 0 ? Math.round(totalDeposits / totalTransactions) : 0;

    // Get daily revenue data for chart
    const dailyRevenue = await getDailyRevenue(startDate, now);
    
    // Get voucher type distribution
    const voucherDistribution = await getVoucherDistribution();
    
    // Get top members
    const topMembers = await getTopMembers(startDate, now);
    
    // Get detailed report data based on type
    const detailedData = await getDetailedReportData(reportType, startDate, now);

    return NextResponse.json({
      summary: {
        totalDeposits,
        totalMembers,
        totalTransactions,
        avgTransaction,
        depositChange: 12.5, // TODO: 실제 계산 필요
        memberChange: 8.3,
        transactionChange: 18.2,
        avgTransactionChange: -5.2,
      },
      charts: {
        dailyRevenue,
        voucherDistribution,
      },
      topMembers,
      detailedReport: detailedData
    });
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    );
  }
}

async function getDailyRevenue(startDate: Date, endDate: Date) {
  // 성능 최적화: 한 번의 쿼리로 모든 데이터 가져오기
  const { data: transactions } = await supabaseAdmin
    .from('Transaction')
    .select('amount, createdAt')
    .eq('type', 'CHARGE')
    .eq('status', 'COMPLETED')
    .gte('createdAt', startDate.toISOString())
    .lte('createdAt', endDate.toISOString())
    .order('createdAt');

  // 날짜별로 그룹화
  const dailyMap = new Map();
  const currentDate = new Date(startDate);
  
  // 모든 날짜 초기화
  while (currentDate <= endDate) {
    const dateKey = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
    dailyMap.set(dateKey, { revenue: 0, transactions: 0 });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // 트랜잭션 데이터 집계
  transactions?.forEach(t => {
    const date = new Date(t.createdAt);
    const dateKey = `${date.getMonth() + 1}/${date.getDate()}`;
    if (dailyMap.has(dateKey)) {
      const current = dailyMap.get(dateKey);
      current.revenue += t.amount || 0;
      current.transactions += 1;
    }
  });

  // 배열로 변환
  return Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    transactions: data.transactions
  }));
}

async function getVoucherDistribution() {
  // 성능 최적화: COUNT 쿼리 사용
  const [buyInResult, reBuyResult] = await Promise.all([
    supabaseAdmin
      .from('Voucher')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'BUYIN'),
    supabaseAdmin
      .from('Voucher')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'REBUY')
  ]);
  
  const buyInVouchers = buyInResult.count || 0;
  const reBuyVouchers = reBuyResult.count || 0;
  const total = buyInVouchers + reBuyVouchers;
  
  return [
    {
      name: 'Buy-in',
      value: buyInVouchers,
      percentage: total > 0 ? Math.round((buyInVouchers / total) * 100) : 0
    },
    {
      name: 'Re-buy',
      value: reBuyVouchers,
      percentage: total > 0 ? Math.round((reBuyVouchers / total) * 100) : 0
    }
  ];
}

async function getTopMembers(startDate: Date, endDate: Date) {
  // 성능 최적화: 집계 쿼리로 한 번에 처리
  const { data: transactions } = await supabaseAdmin
    .from('Transaction')
    .select('userId, amount')
    .eq('type', 'VOUCHER_PURCHASE')
    .eq('status', 'COMPLETED')
    .gte('createdAt', startDate.toISOString())
    .lte('createdAt', endDate.toISOString());

  // 사용자별 집계
  const userAggregates = new Map();
  
  transactions?.forEach(t => {
    const userId = t.userId;
    if (!userAggregates.has(userId)) {
      userAggregates.set(userId, {
        userId,
        totalPoints: 0,
        transactionCount: 0
      });
    }
    const user = userAggregates.get(userId);
    user.totalPoints += t.amount || 0;
    user.transactionCount += 1;
  });

  // 상위 5명 선택
  const topUserIds = Array.from(userAggregates.values())
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5)
    .map(u => u.userId);

  if (topUserIds.length === 0) {
    return [];
  }

  // 사용자 정보 가져오기
  const { data: users } = await supabaseAdmin
    .from('User')
    .select('id, name, email')
    .in('id', topUserIds);

  // 최종 데이터 조합
  return topUserIds.map((userId, index) => {
    const userData = users?.find(u => u.id === userId);
    const stats = userAggregates.get(userId);
    return {
      rank: index + 1,
      name: userData?.name || userData?.email || 'Unknown',
      totalPoints: stats.totalPoints,
      voucherCount: stats.transactionCount,
      tournamentCount: 0, // TODO: 실제 토너먼트 참가 수 계산
      grade: stats.totalPoints > 300000 ? 'VIP' : 'REGULAR'
    };
  });
}

async function getDetailedReportData(type: string, startDate: Date, endDate: Date) {
  switch (type) {
    case 'revenue':
      // 일별 수익 데이터 (getDailyRevenue와 동일하지만 다른 형식)
      const { data } = await supabaseAdmin
        .from('Transaction')
        .select('amount, createdAt')
        .eq('type', 'CHARGE')
        .eq('status', 'COMPLETED')
        .gte('createdAt', startDate.toISOString())
        .lte('createdAt', endDate.toISOString())
        .order('createdAt');
      
      // 날짜별 집계
      const revenueMap = new Map();
      data?.forEach(t => {
        const date = new Date(t.createdAt);
        const dateKey = `${date.getMonth() + 1}/${date.getDate()}`;
        const current = revenueMap.get(dateKey) || 0;
        revenueMap.set(dateKey, current + (t.amount || 0));
      });
      
      return Array.from(revenueMap.entries()).map(([date, amount]) => ({
        date,
        amount
      }));
      
    case 'members':
      // 회원 가입 추이
      const { data: memberData } = await supabaseAdmin
        .from('User')
        .select('createdAt')
        .gte('createdAt', startDate.toISOString())
        .lte('createdAt', endDate.toISOString())
        .order('createdAt');
      
      return memberData || [];
      
    case 'vouchers':
      // 바인권 사용 데이터
      const { data: voucherData } = await supabaseAdmin
        .from('Voucher')
        .select('type, status, createdAt')
        .gte('createdAt', startDate.toISOString())
        .lte('createdAt', endDate.toISOString());
      
      return voucherData || [];
      
    default:
      return [];
  }
}