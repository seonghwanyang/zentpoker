'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import { LayoutWrapper } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VoucherCard } from '@/components/vouchers/voucher-card';
import { PRICING } from '@/lib/config/pricing';
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

// 바우처 타입 정의
type Voucher = {
  id: string;
  type: 'BUY_IN' | 'RE_BUY';
  createdAt: Date;
  usedAt: Date | null;
  expiresAt: Date;
  isUsed: boolean;
  tournamentId: string | null;
  tournamentName?: string;
};

type VoucherFilter = 'ALL' | 'AVAILABLE' | 'USED' | 'EXPIRED';

export default function VouchersPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const [filter, setFilter] = useState<VoucherFilter>('ALL');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [supabase.auth]);

  useEffect(() => {
    const fetchVouchers = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/vouchers/list');
        if (response.ok) {
          const data = await response.json();
          // Convert date strings to Date objects
          const formattedVouchers = (data.vouchers || []).map((v: any) => ({
            ...v,
            createdAt: new Date(v.createdAt),
            usedAt: v.usedAt ? new Date(v.usedAt) : null,
            expiresAt: new Date(v.expiresAt),
          }));
          setVouchers(formattedVouchers);
        }
      } catch (error) {
        console.error('Failed to fetch vouchers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchVouchers();
    }
  }, [user]);

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </LayoutWrapper>
    );
  }

  if (!user) {
    redirect('/login');
  }

  // 바인권 필터링
  const now = new Date();
  const filteredVouchers = vouchers.filter(voucher => {
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
    total: vouchers.length,
    available: vouchers.filter(v => !v.isUsed && v.expiresAt > now).length,
    used: vouchers.filter(v => v.isUsed).length,
    expired: vouchers.filter(v => v.expiresAt < now && !v.isUsed).length,
    buyIn: vouchers.filter(v => v.type === 'BUY_IN' && !v.isUsed && v.expiresAt > now).length,
    reBuy: vouchers.filter(v => v.type === 'RE_BUY' && !v.isUsed && v.expiresAt > now).length,
  };

  // 곧 만료될 바인권 확인 (7일 이내)
  const soonExpiring = vouchers.filter(v => {
    const daysUntilExpiry = (v.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return !v.isUsed && daysUntilExpiry > 0 && daysUntilExpiry <= 7;
  });

  const memberGrade = user?.user_metadata?.memberGrade || 'GUEST';

  return (
    <LayoutWrapper>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 페이지 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">바인권 관리</h1>
            <p className="text-gray-500 mt-1">보유한 바인권을 확인하고 관리하세요</p>
          </div>
          <Link href="/vouchers/purchase">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
              <Plus className="mr-2 h-4 w-4" />
              바인권 구매
            </Button>
          </Link>
        </div>

        {/* 만료 예정 알림 */}
        {soonExpiring.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <p className="text-sm">
                  <span className="font-semibold text-orange-900">
                    {soonExpiring.length}개의 바인권
                  </span>
                  <span className="text-orange-700">이 7일 이내에 만료됩니다.</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">전체 바인권</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}개</div>
              <p className="text-xs text-gray-500">누적 보유량</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">사용 가능</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.available}개</div>
              <p className="text-xs text-gray-500">
                Buy-in {stats.buyIn}개, Re-buy {stats.reBuy}개
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">사용 완료</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.used}개</div>
              <p className="text-xs text-gray-500">토너먼트 참가</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">만료됨</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.expired}개</div>
              <p className="text-xs text-gray-500">기간 만료</p>
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
                  전체 ({vouchers.length})
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
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">로딩 중...</p>
                  </div>
                ) : filteredVouchers.length === 0 ? (
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
                    {filteredVouchers.map((voucher) => {
                      // 회원 등급에 따른 가격 설정
                      const price = voucher.type === 'BUY_IN' 
                        ? (memberGrade === 'GUEST' ? PRICING.VOUCHER.BUY_IN.GUEST : PRICING.VOUCHER.BUY_IN.REGULAR)
                        : (memberGrade === 'GUEST' ? PRICING.VOUCHER.RE_BUY.GUEST : PRICING.VOUCHER.RE_BUY.REGULAR);
                      
                      return (
                        <VoucherCard
                          key={voucher.id}
                          type={voucher.type === 'BUY_IN' ? 'BUYIN' : 'REBUY'}
                          status={voucher.isUsed ? 'USED' : (voucher.expiresAt < now ? 'EXPIRED' : 'ACTIVE')}
                          purchasePrice={price}
                          expiresAt={voucher.expiresAt}
                          usedAt={voucher.usedAt || undefined}
                          onUse={voucher.isUsed || voucher.expiresAt < now ? undefined : () => {
                            console.log('Use voucher:', voucher.id);
                          }}
                        />
                      );
                    })}
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