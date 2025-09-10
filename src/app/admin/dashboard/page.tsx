'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Activity,
  CreditCard,
  Calendar,
  ChevronRight,
  Trophy,
  Clock,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';

// 대시보드 데이터 타입 정의
interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  pendingDeposits: number;
  pendingAmount: number;
  todayDeposit: number;
  yesterdayDeposit: number;
  changePercent: number;
  monthlyDeposit: number;
  monthlyTarget: number;
  targetPercent: number;
  totalVouchers: number;
  activeVouchers: number;
  newVouchersThisMonth: number;
}

interface RecentDeposit {
  id: string;
  userName: string;
  amount: number;
  method: string;
  createdAt: string;
  status: string;
  elapsedText: string;
}

interface RecentMember {
  id: string;
  name: string;
  email: string;
  grade: string;
  joinedAt: string;
  daysSinceJoin: number;
}

interface UpcomingTournament {
  id: string;
  title: string;
  startDate: string;
  location: string;
  participantCount: number;
  maxEntries: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentDeposits: RecentDeposit[];
  recentMembers: RecentMember[];
  upcomingTournaments: UpcomingTournament[];
}

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Supabase client 제거 - API 호출로 대체

  // 대시보드 데이터 가져오기
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('대시보드 데이터를 불러오는데 실패했습니다.');
      toast({
        title: '오류 발생',
        description: '대시보드 데이터를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    // layout.tsx에서 이미 인증 확인했으므로 바로 데이터 로드
    fetchDashboardData();
  }, []);

  // 권한 체크 - 제거 (layout.tsx에서 이미 처리)
  // admin/layout.tsx에서 권한 체크를 하므로 여기서는 불필요

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">대시보드 데이터를 불러오는 중...</span>
      </div>
    );
  }

  // 에러 상태
  if (error || !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">데이터 로딩 실패</h2>
        <p className="text-muted-foreground mb-4">{error || '대시보드 데이터를 불러올 수 없습니다.'}</p>
        <Button onClick={fetchDashboardData}>
          다시 시도
        </Button>
      </div>
    );
  }
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 상대적 시간 표시 (분/시간/일 전)
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <p className="text-gray-500 mt-1">동호회 운영 현황을 한눈에 확인하세요</p>
      </div>

      {/* 입금 대기 알림 - 확인 대기 중인 입금이 있을 때만 표시 */}
      {dashboardData.stats.pendingDeposits > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  확인 대기 중인 입금이 {dashboardData.stats.pendingDeposits}건 있습니다
                </p>
                <p className="text-sm text-yellow-600">
                  총 {formatAmount(dashboardData.stats.pendingAmount)}원 • 입금 확인 페이지에서 처리해주세요
                </p>
              </div>
            </div>
            <Link href="/admin/payments/confirm">
              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                확인하러 가기
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* 주요 통계 카드 - 회원 수, 오늘 수익, 이달 수익, 발급 바인권 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 회원</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalMembers}명</div>
            <p className="text-xs text-muted-foreground">
              활성: {dashboardData.stats.activeMembers}명
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 입금</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(dashboardData.stats.todayDeposit)}원
            </div>
            <p className="text-xs text-muted-foreground">
              <span className={dashboardData.stats.changePercent >= 0 ? "text-green-600" : "text-red-600"}>
                {dashboardData.stats.changePercent >= 0 ? '+' : ''}{dashboardData.stats.changePercent}%
              </span> 어제 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이달 입금</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(dashboardData.stats.monthlyDeposit)}원
            </div>
            <p className="text-xs text-muted-foreground">
              목표 달성률 {dashboardData.stats.targetPercent}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">발급 바인권</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalVouchers}개</div>
            <p className="text-xs text-muted-foreground">
              이번 달 신규 {dashboardData.stats.newVouchersThisMonth}개
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 입금 대기 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>입금 대기 목록</CardTitle>
              <Link href="/admin/payments/confirm">
                <Button variant="ghost" size="sm">
                  전체보기
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentDeposits.length > 0 ? (
                dashboardData.recentDeposits.map((deposit) => (
                  <div key={deposit.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-yellow-100">
                        <Clock className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">{deposit.userName}</p>
                        <p className="text-sm text-gray-500">
                          {deposit.method === 'KAKAO' ? '카카오페이' : '계좌이체'} • {deposit.elapsedText}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatAmount(deposit.amount)}원</p>
                      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                        대기중
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  대기 중인 입금이 없습니다.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 최근 가입 회원 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>최근 가입 회원</CardTitle>
              <Link href="/admin/members">
                <Button variant="ghost" size="sm">
                  전체보기
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentMembers.length > 0 ? (
                dashboardData.recentMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-purple-100">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={member.grade === 'GUEST' ? 'secondary' : 'default'}>
                        {member.grade === 'GUEST' ? '게스트' : '정회원'}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {member.daysSinceJoin === 0 ? '오늘' : `${member.daysSinceJoin}일 전`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  최근 가입 회원이 없습니다.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 예정된 토너먼트 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              예정된 토너먼트
            </CardTitle>
            <Link href="/admin/tournaments">
              <Button variant="ghost" size="sm">
                관리하기
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.upcomingTournaments.length > 0 ? (
              dashboardData.upcomingTournaments.map((tournament) => {
                const startDate = new Date(tournament.startDate);
                const participationRate = tournament.maxEntries > 0 
                  ? Math.round((tournament.participantCount / tournament.maxEntries) * 100) 
                  : 0;
                
                return (
                  <div key={tournament.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-purple-100">
                        <Trophy className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{tournament.title}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(startDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {tournament.participantCount}/{tournament.maxEntries}명
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <p className="text-sm font-medium">참가율</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {participationRate}%
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        관리
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                예정된 토너먼트가 없습니다.
                <Link href="/admin/tournaments/create">
                  <Button variant="link" className="mt-2">
                    토너먼트 생성하기
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 빠른 작업 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/members">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <p className="text-sm font-medium">회원 관리</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/payments/confirm">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <DollarSign className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-sm font-medium">입금 확인</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/vouchers/pricing">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <CreditCard className="h-8 w-8 text-blue-600 mb-2" />
              <p className="text-sm font-medium">가격 설정</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/reports">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Activity className="h-8 w-8 text-orange-600 mb-2" />
              <p className="text-sm font-medium">리포트</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
