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

    // 오늘 날짜 계산
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 이번 달 시작일 계산
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // 전체 회원 수 및 활성 회원 수
    const { count: totalMembers } = await supabaseAdmin
      .from('User')
      .select('*', { count: 'exact', head: true });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { count: activeMembers } = await supabaseAdmin
      .from('User')
      .select('*', { count: 'exact', head: true })
      .gte('lastLoginAt', thirtyDaysAgo.toISOString());

    // 대기 중인 입금 건수 및 총액
    const { data: pendingDeposits, error: pendingError } = await supabaseAdmin
      .from('Transaction')
      .select(`
        *,
        user:User!user_id (
          name,
          email
        )
      `)
      .eq('type', 'CHARGE')
      .eq('status', 'PENDING');

    const pendingCount = pendingDeposits?.length || 0;
    const pendingTotal = pendingDeposits?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;

    // 오늘 입금액
    const { data: todayDepositsData } = await supabaseAdmin
      .from('Transaction')
      .select('amount')
      .eq('type', 'CHARGE')
      .eq('status', 'COMPLETED')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString());

    const todayAmount = todayDepositsData?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;

    // 어제 입금액 (비교용)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const { data: yesterdayDepositsData } = await supabaseAdmin
      .from('Transaction')
      .select('amount')
      .eq('type', 'CHARGE')
      .eq('status', 'COMPLETED')
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', today.toISOString());

    const yesterdayAmount = yesterdayDepositsData?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;

    // 이번 달 입금액
    const { data: monthlyDepositsData } = await supabaseAdmin
      .from('Transaction')
      .select('amount')
      .eq('type', 'CHARGE')
      .eq('status', 'COMPLETED')
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString());

    const monthlyAmount = monthlyDepositsData?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;

    // 발급된 바인권 수
    const { count: totalVouchers } = await supabaseAdmin
      .from('Voucher')
      .select('*', { count: 'exact', head: true });

    const { count: activeVouchers } = await supabaseAdmin
      .from('Voucher')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE')
      .gt('expires_at', new Date().toISOString());

    // 최근 입금 대기 목록 (상위 3개)
    const recentPendingDeposits = pendingDeposits?.slice(0, 3).map(deposit => {
      const metadata = deposit.metadata as any;
      const createdTime = new Date(deposit.created_at);
      const elapsedMinutes = Math.floor((Date.now() - createdTime.getTime()) / (1000 * 60));
      
      let elapsedText = '';
      if (elapsedMinutes < 60) {
        elapsedText = `${elapsedMinutes}분 전`;
      } else if (elapsedMinutes < 1440) {
        elapsedText = `${Math.floor(elapsedMinutes / 60)}시간 전`;
      } else {
        elapsedText = `${Math.floor(elapsedMinutes / 1440)}일 전`;
      }

      return {
        id: deposit.id,
        userName: deposit.user?.name || deposit.user?.email || 'Unknown',
        amount: deposit.amount,
        method: metadata?.method || 'UNKNOWN',
        createdAt: deposit.created_at,
        status: deposit.status,
        elapsedText
      };
    }) || [];

    // 최근 가입 회원 (상위 2명)
    const { data: recentMembersData } = await supabaseAdmin
      .from('User')
      .select('id, name, email, grade, created_at')
      .neq('role', 'ADMIN')
      .order('created_at', { ascending: false })
      .limit(2);

    const recentMembers = recentMembersData?.map(member => {
      const daysSinceJoin = Math.floor((Date.now() - new Date(member.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: member.id,
        name: member.name || 'Unknown',
        email: member.email,
        grade: member.grade,
        joinedAt: member.created_at,
        daysSinceJoin
      };
    }) || [];

    // 예정된 토너먼트
    const { data: upcomingTournamentsData } = await supabaseAdmin
      .from('Tournament')
      .select(`
        *,
        entries:TournamentEntry(count)
      `)
      .eq('status', 'UPCOMING')
      .gt('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(3);

    const upcomingTournaments = upcomingTournamentsData?.map(tournament => {
      // Count entries manually if needed
      const entryCount = Array.isArray(tournament.entries) ? tournament.entries.length : 0;
      
      return {
        id: tournament.id,
        title: tournament.title || tournament.name || 'Unnamed Tournament',
        startDate: tournament.start_date,
        location: tournament.location || '신림 잼스 홀덤펍',
        participantCount: entryCount,
        maxEntries: tournament.max_entries || 100
      };
    }) || [];

    // 어제 대비 증감률 계산
    const changePercent = yesterdayAmount > 0 
      ? Math.round(((todayAmount - yesterdayAmount) / yesterdayAmount) * 100)
      : 0;

    // 월간 목표 (임시값 - 추후 설정에서 가져올 수 있음)
    const monthlyTarget = 20000000;
    const targetPercent = Math.round((monthlyAmount / monthlyTarget) * 100);

    return NextResponse.json({
      stats: {
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        pendingDeposits: pendingCount,
        pendingAmount: pendingTotal,
        todayDeposit: todayAmount,
        yesterdayDeposit: yesterdayAmount,
        changePercent,
        monthlyDeposit: monthlyAmount,
        monthlyTarget,
        targetPercent,
        totalVouchers: totalVouchers || 0,
        activeVouchers: activeVouchers || 0,
        newVouchersThisMonth: totalVouchers || 0 // 추후 개선 필요
      },
      recentDeposits: recentPendingDeposits,
      recentMembers: recentMembers,
      upcomingTournaments: upcomingTournaments
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}