'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutWrapper } from '@/components/layout';
import { BalanceCard } from '@/components/points/balance-card';
import { VoucherCard } from '@/components/vouchers/voucher-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  CreditCard, 
  Trophy, 
  TrendingUp,
  Clock,
  ChevronRight,
  AlertCircle,
  Loader2,
  Ticket,
  RefreshCw,
  Wallet,
  DollarSign
} from 'lucide-react';
import { useTournamentStore } from '@/stores/tournament-store'
import Link from 'next/link';

interface DashboardData {
  balance: number;
  vouchers: any[];
  recentTransactions: any[];
  stats: {
    totalVouchers: number;
    monthlyUsage: number;
    pendingTournaments: number;
    winRate: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const tournaments = useTournamentStore((state) => state.tournaments)
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    balance: 0,
    vouchers: [],
    recentTransactions: [],
    stats: {
      totalVouchers: 0,
      monthlyUsage: 0,
      pendingTournaments: 0,
      winRate: 0
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session) return;
      
      try {
        // 포인트 잔액 가져오기
        const balanceRes = await fetch('/api/points/balance');
        const balanceData = await balanceRes.json();
        
        // 바인권 목록 가져오기
        const vouchersRes = await fetch('/api/vouchers/list');
        const vouchersData = await vouchersRes.json();
        
        // 최근 거래 내역 가져오기
        const transactionsRes = await fetch('/api/points/transactions?limit=5');
        const transactionsData = await transactionsRes.json();
        
        setDashboardData({
          balance: balanceData.balance || 0,
          vouchers: vouchersData.vouchers || [],
          recentTransactions: transactionsData.transactions || [],
          stats: {
            totalVouchers: vouchersData.vouchers?.length || 0,
            monthlyUsage: 0, // TODO: 서버에서 계산
            pendingTournaments: 0, // TODO: 토너먼트 API 연동
            winRate: 0 // TODO: 통계 API 연동
          }
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [session]);

  if (status === 'loading') {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </LayoutWrapper>
    );
  }

  if (!session) {
    redirect('/login');
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(Math.abs(amount));
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    return dateObj.toLocaleDateString('ko-KR');
  };

  // @ts-ignore - session.user.memberGrade 타입 에러 임시 무시
  const memberGrade = session.user?.memberGrade || 'GUEST';

  if (isLoading) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="text-gray-500 mt-1">환영합니다, {session.user.name}님!</p>
        </div>

        {/* 게스트 회원 알림 */}
        {memberGrade === 'GUEST' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  현재 게스트 등급입니다
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  정회원 승급 시 바인권 할인 혜택을 받으실 수 있습니다.
                </p>
              </div>
              <Link href="/profile">
                <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-600 hover:bg-yellow-100">
                  프로필 완성하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* 현황 카드들 - 바인권, 리바인권, 포인트 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 바인권 현황 */}
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-blue-100 text-sm font-medium">바인권 현황</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold">
                    {dashboardData.vouchers.filter(v => v.type === 'BUYIN' && v.status === 'ACTIVE').length}
                  </h2>
                  <span className="text-blue-100">개</span>
                </div>
                <p className="text-blue-200 text-xs">
                  {memberGrade === 'GUEST' ? '30,000원' : '25,000원'}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Ticket className="h-6 w-6" />
              </div>
            </div>
            <Link href="/vouchers/purchase" className="block mt-4">
              <Button 
                size="sm" 
                variant="secondary" 
                className="w-full bg-white text-blue-600 hover:bg-blue-50"
              >
                바인권 구매
              </Button>
            </Link>
          </Card>

          {/* 리바인권 현황 */}
          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-green-100 text-sm font-medium">리바인권 현황</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold">
                    {dashboardData.vouchers.filter(v => v.type === 'REBUY' && v.status === 'ACTIVE').length}
                  </h2>
                  <span className="text-green-100">개</span>
                </div>
                <p className="text-green-200 text-xs">
                  {memberGrade === 'GUEST' ? '20,000원' : '15,000원'}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <RefreshCw className="h-6 w-6" />
              </div>
            </div>
            <Link href="/vouchers/purchase" className="block mt-4">
              <Button 
                size="sm" 
                variant="secondary" 
                className="w-full bg-white text-green-600 hover:bg-green-50"
              >
                리바인권 구매
              </Button>
            </Link>
          </Card>

          {/* 포인트 현황 */}
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-purple-100 text-sm font-medium">포인트 현황</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold">
                    {formatCurrency(dashboardData.balance)}
                  </h2>
                  <span className="text-purple-100">P</span>
                </div>
                <p className="text-purple-200 text-xs">
                  충전 가능 잔액
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
            <Link href="/points" className="block mt-4">
              <Button 
                size="sm" 
                variant="secondary" 
                className="w-full bg-white text-purple-600 hover:bg-purple-50"
              >
                포인트 충전
              </Button>
            </Link>
          </Card>
        </div>

        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">보유 바인권</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.totalVouchers}개</div>
              <p className="text-xs text-muted-foreground">
                Buy-in {dashboardData.vouchers.filter(v => v.type === 'BUYIN').length}개, 
                Re-buy {dashboardData.vouchers.filter(v => v.type === 'REBUY').length}개
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이번 달 사용</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboardData.stats.monthlyUsage)} P</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> 지난달 대비
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">참가 대기</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.pendingTournaments}개</div>
              <p className="text-xs text-muted-foreground">
                다음 토너먼트까지 1일
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승률</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.winRate}%</div>
              <p className="text-xs text-muted-foreground">
                총 0게임 참가
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 최근 거래 내역 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>최근 거래</CardTitle>
                <Link href="/points">
                  <Button variant="ghost" size="sm">
                    전체보기
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentTransactions.length > 0 ? (
                  dashboardData.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'CHARGE' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'CHARGE' ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <CreditCard className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{transaction.description}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)} P
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-gray-500 py-4">
                    거래 내역이 없습니다
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 보유 바인권 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>보유 바인권</CardTitle>
                <Link href="/vouchers">
                  <Button variant="ghost" size="sm">
                    전체보기
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {dashboardData.vouchers.length > 0 ? (
                  dashboardData.vouchers.slice(0, 2).map((voucher) => (
                    <VoucherCard
                      key={voucher.id}
                      type={voucher.type}
                      status={voucher.status}
                      purchasePrice={voucher.type === 'BUYIN' ? 50000 : 30000}
                      expiresAt={new Date(voucher.expiresAt)}
                      onUse={() => console.log('Use voucher:', voucher.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 mb-3">보유한 바인권이 없습니다</p>
                    <Link href="/vouchers/purchase">
                      <Button variant="outline" size="sm">
                        바인권 구매하기
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 예정된 토너먼트 */}
        {tournaments.filter(t => t.status === 'UPCOMING').length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  예정된 토너먼트
                </CardTitle>
                <Link href="/tournaments">
                  <Button variant="ghost" size="sm">
                    전체보기
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tournaments
                  .filter(t => t.status === 'UPCOMING')
                  .slice(0, 2)
                  .map((tournament) => {
                    const tournamentDate = new Date(tournament.startDate)
                    return (
                      <div key={tournament.id} className="p-4 rounded-lg border hover:border-purple-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{tournament.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {tournamentDate.toLocaleDateString('ko-KR', {
                                  month: 'long',
                                  day: 'numeric',
                                  weekday: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {tournament.buyIn.toLocaleString()}원
                              </span>
                            </div>
                          </div>
                          <Link href={`/tournaments/${tournament.id}`}>
                            <Button size="sm" variant="outline">
                              참가하기
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </LayoutWrapper>
  );
}
