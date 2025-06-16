'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { LayoutWrapper } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VoucherCard } from '@/components/vouchers/voucher-card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Ticket,
  Plus,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

// 임시 바인권 데이터
const mockVouchers = [
  {
    id: '1',
    type: 'BUY_IN' as const,
    createdAt: new Date('2024-12-20T10:00:00'),
    usedAt: null,
    expiresAt: new Date('2025-01-20T10:00:00'),
    isUsed: false,
    tournamentId: null,
  },
  {
    id: '2',
    type: 'RE_BUY' as const,
    createdAt: new Date('2024-12-19T15:00:00'),
    usedAt: null,
    expiresAt: new Date('2025-01-19T15:00:00'),
    isUsed: false,
    tournamentId: null,
  },
  {
    id: '3',
    type: 'BUY_IN' as const,
    createdAt: new Date('2024-12-18T20:00:00'),
    usedAt: new Date('2024-12-19T20:00:00'),
    expiresAt: new Date('2025-01-18T20:00:00'),
    isUsed: true,
    tournamentId: 'T001',
    tournamentName: '주간 토너먼트 #45',
  },
  {
    id: '4',
    type: 'RE_BUY' as const,
    createdAt: new Date('2024-12-15T10:00:00'),
    usedAt: null,
    expiresAt: new Date('2024-12-25T10:00:00'), // 곧 만료
    isUsed: false,
    tournamentId: null,
  },
];

type VoucherFilter = 'ALL' | 'AVAILABLE' | 'USED' | 'EXPIRED';

export default function VouchersPage() {
  const { data: session, status } = useSession();
  const [filter, setFilter] = useState<VoucherFilter>('ALL');

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

  // 바인권 필터링
  const now = new Date();
  const filteredVouchers = mockVouchers.filter(voucher => {
    const isExpired = voucher.expiresAt < now;
    
    switch (filter) {
      case 'AVAILABLE':
        return !voucher.isUsed && !isExpired;
      case 'USED':
        return voucher.isUsed;
      case 'EXPIRED':
        return isExpired && !voucher.isUsed;
      default:
        return true;
    }
  });

  // 통계 계산
  const stats = {
    total: mockVouchers.length,
    available: mockVouchers.filter(v => !v.isUsed && v.expiresAt > now).length,
    used: mockVouchers.filter(v => v.isUsed).length,
    expired: mockVouchers.filter(v => v.expiresAt < now && !v.isUsed).length,
    buyIn: mockVouchers.filter(v => v.type === 'BUY_IN' && !v.isUsed && v.expiresAt > now).length,
    reBuy: mockVouchers.filter(v => v.type === 'RE_BUY' && !v.isUsed && v.expiresAt > now).length,
  };

  // 곧 만료될 바인권 확인 (7일 이내)
  const soonExpiring = mockVouchers.filter(v => {
    const daysUntilExpiry = (v.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return !v.isUsed && daysUntilExpiry > 0 && daysUntilExpiry <= 7;
  });

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">바인권 관리</h1>
            <p className="text-gray-500 mt-1">보유한 바인권을 확인하고 관리하세요</p>
          </div>
          <Link href="/vouchers/purchase">
            <Button variant="gradient">
              <Plus className="mr-2 h-4 w-4" />
              바인권 구매
            </Button>
          </Link>
        </div>

        {/* 만료 임박 알림 */}
        {soonExpiring.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  만료 임박 바인권이 {soonExpiring.length}개 있습니다
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  7일 이내에 만료되는 바인권은 서둘러 사용하세요
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 바인권</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}개</div>
              <p className="text-xs text-muted-foreground">누적 보유량</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">사용 가능</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.available}개</div>
              <p className="text-xs text-muted-foreground">
                Buy-in {stats.buyIn}개, Re-buy {stats.reBuy}개
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">사용 완료</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.used}개</div>
              <p className="text-xs text-muted-foreground">토너먼트 참가</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">만료됨</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.expired}개</div>
              <p className="text-xs text-muted-foreground">기간 만료</p>
            </CardContent>
          </Card>
        </div>

        {/* 바인권 목록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>바인권 목록</CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">필터:</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={(value) => setFilter(value as VoucherFilter)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="ALL">
                  전체 ({mockVouchers.length})
                </TabsTrigger>
                <TabsTrigger value="AVAILABLE">
                  사용가능 ({stats.available})
                </TabsTrigger>
                <TabsTrigger value="USED">
                  사용완료 ({stats.used})
                </TabsTrigger>
                <TabsTrigger value="EXPIRED">
                  만료 ({stats.expired})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={filter} className="mt-6">
                {filteredVouchers.length === 0 ? (
                  <div className="text-center py-12">
                    <Ticket className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4">해당하는 바인권이 없습니다</p>
                    {filter === 'AVAILABLE' && (
                      <Link href="/vouchers/purchase">
                        <Button variant="outline">바인권 구매하기</Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredVouchers.map((voucher) => (
                      <VoucherCard
                        key={voucher.id}
<<<<<<< HEAD
                        type={voucher.type === 'BUY_IN' ? 'BUYIN' : 'REBUY'}
                        status={voucher.isUsed ? 'USED' : (voucher.expiresAt < now ? 'EXPIRED' : 'ACTIVE')}
                        purchasePrice={100000}
                        expiresAt={voucher.expiresAt}
                        usedAt={voucher.usedAt || undefined}
                        onUse={voucher.isUsed || voucher.expiresAt < now ? undefined : () => {
=======
                        voucher={voucher}
                        onUse={() => {
                          // 실제로는 토너먼트 참가 페이지로 이동
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
                          console.log('Use voucher:', voucher.id);
                        }}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}
