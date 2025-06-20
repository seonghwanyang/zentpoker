'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
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
} from 'lucide-react';
import { useTournamentStore } from '@/stores/tournament-store'
import Link from 'next/link';

// 임시 대시보드 데이터 (실제로는 API에서 가져옴)
const mockDashboardData = {
  stats: {
    totalMembers: 87,
    activeMembers: 45,
    pendingDeposits: 3,
    todayDeposit: 1250000,
    monthlyDeposit: 15800000,
    totalVouchers: 234,
  },
  recentDeposits: [
    {
      id: '1',
      userName: '김철수',
      amount: 500000,
      method: '카카오페이',
      createdAt: new Date(Date.now() - 1800000), // 30분 전
      status: 'PENDING',
    },
    {
      id: '2',
      userName: '이영희',
      amount: 300000,
      method: '계좌이체',
      createdAt: new Date(Date.now() - 3600000), // 1시간 전
      status: 'PENDING',
    },
    {
      id: '3',
      userName: '박민수',
      amount: 200000,
      method: '카카오페이',
      createdAt: new Date(Date.now() - 7200000), // 2시간 전
      status: 'PENDING',
    },
  ],
  recentMembers: [
    {
      id: '1',
      name: '최지우',
      email: 'jiwoo@example.com',
      grade: 'GUEST',
      joinedAt: new Date(Date.now() - 86400000), // 1일 전
    },
    {
      id: '2',
      name: '정하늘',
      email: 'haneul@example.com',
      grade: 'GUEST',
      joinedAt: new Date(Date.now() - 172800000), // 2일 전
    },
  ],
  upcomingTournaments: [
    {
      id: '1',
      name: '주간 토너먼트 #46',
      date: new Date(Date.now() + 86400000), // 1일 후
      participants: 24,
      maxParticipants: 50,
    },
    {
      id: '2',
      name: '월간 챔피언십',
      date: new Date(Date.now() + 604800000), // 7일 후
      participants: 15,
      maxParticipants: 100,
    },
  ],
};

export default function AdminDashboardPage() {
  const tournaments = useTournamentStore((state) => state.tournaments)
  const upcomingTournaments = tournaments
    .filter(t => t.status === 'UPCOMING')
    .slice(0, 2)
    .map(t => ({
      ...t,
      date: new Date(t.startDate),
      participants: t.currentPlayers,
      maxParticipants: t.maxPlayers,
    }))
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
      {mockDashboardData.stats.pendingDeposits > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  확인 대기 중인 입금이 {mockDashboardData.stats.pendingDeposits}건 있습니다
                </p>
                <p className="text-sm text-yellow-600">
                  입금 확인 페이지에서 처리해주세요
                </p>
              </div>
            </div>
            <Link href="/admin/payments/confirm">
              <Button size="sm" variant="warning">
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
            <div className="text-2xl font-bold">{mockDashboardData.stats.totalMembers}명</div>
            <p className="text-xs text-muted-foreground">
              활성: {mockDashboardData.stats.activeMembers}명
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
              {formatAmount(mockDashboardData.stats.todayDeposit)}원
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> 어제 대비
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
              {formatAmount(mockDashboardData.stats.monthlyDeposit)}원
            </div>
            <p className="text-xs text-muted-foreground">
              목표 달성률 78%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">발급 바인권</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDashboardData.stats.totalVouchers}개</div>
            <p className="text-xs text-muted-foreground">
              이번 달 신규 45개
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
              {mockDashboardData.recentDeposits.map((deposit) => (
                <div key={deposit.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-yellow-100">
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">{deposit.userName}</p>
                      <p className="text-sm text-gray-500">
                        {deposit.method} • {formatTimeAgo(deposit.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatAmount(deposit.amount)}원</p>
                    <Badge variant="warning" className="text-xs">
                      대기중
                    </Badge>
                  </div>
                </div>
              ))}
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
              {mockDashboardData.recentMembers.map((member) => (
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
                      {formatTimeAgo(member.joinedAt)}
                    </p>
                  </div>
                </div>
              ))}
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
        {upcomingTournaments.length > 0 ? (
        upcomingTournaments.map((tournament) => (
        <div key={tournament.id} className="flex items-center justify-between p-4 rounded-lg border">
        <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-purple-100">
            <Trophy className="h-5 w-5 text-purple-600" />
          </div>
        <div>
          <p className="font-medium">{tournament.name}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
            {formatDate(tournament.date)}
          </span>
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
            {tournament.participants}/{tournament.maxParticipants}명
            </span>
            </div>
            </div>
          </div>
        <div className="flex items-center gap-2">
        <div className="text-right mr-4">
          <p className="text-sm font-medium">참가율</p>
        <p className="text-2xl font-bold text-purple-600">
            {Math.round((tournament.participants / tournament.maxParticipants) * 100)}%
            </p>
          </div>
        <Button size="sm" variant="outline">
            관리
            </Button>
            </div>
            </div>
            ))
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
