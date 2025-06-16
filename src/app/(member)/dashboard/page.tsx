'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

/**
 * 회원 대시보드 페이지
 * - 포인트 잔액과 최근 변동 표시
 * - 보유 바인권과 최근 거래 내역
 * - 통계 카드로 주요 정보 요약
 */
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
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

// 임시 데이터 (실제로는 API에서 가져옴)
// 실제 구현 시 React Query나 SWR로 데이터 페칭 처리
const mockData = {
  balance: 3756000,
  recentChange: 250000,
  vouchers: [
    { id: '1', type: 'BUY_IN' as const, createdAt: new Date(), isUsed: false },
    { id: '2', type: 'RE_BUY' as const, createdAt: new Date(), isUsed: false },
  ],
  recentTransactions: [
    { id: '1', type: 'CHARGE', amount: 500000, description: '포인트 충전', createdAt: new Date(Date.now() - 3600000) },
    { id: '2', type: 'PURCHASE', amount: -250000, description: 'Buy-in 구매', createdAt: new Date(Date.now() - 7200000) },
  ],
  upcomingTournaments: [
    { id: '1', name: '주간 토너먼트', date: new Date(Date.now() + 86400000), buyIn: 100000 },
  ],
};

export default function DashboardPage() {
  const { data: session, status } = useSession();

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

  // 상대적 시간 표시 - 방금 전, N시간 전, 날짜
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="text-gray-500 mt-1">환영합니다, {session.user.name}님!</p>
        </div>

        {/* 게스트 회원 알림 - 정회원 승급 안내 */}
        {session.user.memberGrade === 'GUEST' && (
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

        {/* 포인트 잔액 카드 */}
        <BalanceCard
          balance={mockData.balance}
          memberGrade={session.user.memberGrade}
          userName={session.user.name || undefined}
          userImage={session.user.image || undefined}
          recentChange={mockData.recentChange}
        />

        {/* 통계 카드들 - 보유 바인권, 이번 달 사용, 참가 대기, 승률 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">보유 바인권</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.vouchers.length}개</div>
              <p className="text-xs text-muted-foreground">
                Buy-in {mockData.vouchers.filter(v => v.type === 'BUY_IN').length}개, 
                Re-buy {mockData.vouchers.filter(v => v.type === 'RE_BUY').length}개
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">이번 달 사용</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">750,000 P</div>
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
              <div className="text-2xl font-bold">{mockData.upcomingTournaments.length}개</div>
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
              <div className="text-2xl font-bold">45.2%</div>
              <p className="text-xs text-muted-foreground">
                총 22게임 참가
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
                {mockData.recentTransactions.map((transaction) => (
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
                ))}
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
                {mockData.vouchers.slice(0, 2).map((voucher) => (
                  <VoucherCard
                    key={voucher.id}
                    type={voucher.type === 'BUY_IN' ? 'BUYIN' : 'REBUY'}
                    status="ACTIVE"
                    purchasePrice={100000}
                    expiresAt={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                    onUse={() => console.log('Use voucher:', voucher.id)}
                  />
                ))}
                {mockData.vouchers.length === 0 && (
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
      </div>
    </LayoutWrapper>
  );
}
