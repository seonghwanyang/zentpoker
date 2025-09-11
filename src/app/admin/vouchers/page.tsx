'use client'

import { useState, useEffect } from 'react'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'
import { Save, RefreshCw, Ticket, DollarSign, Loader2, AlertCircle } from 'lucide-react'

// 바우처 데이터 타입 정의
interface VoucherStats {
  totalIssued: number;
  activeVouchers: number;
  expiredVouchers: number;
  buyinCount: number;
  rebuyCount: number;
  totalDeposit: number;
  newVouchersThisMonth: number;
}

interface VoucherPricing {
  BUYIN: {
    REGULAR: number;
    GUEST: number;
  };
  REBUY: {
    REGULAR: number;
    GUEST: number;
  };
}

interface RecentVoucher {
  id: string;
  createdAt: string;
  userName: string;
  userGrade: string;
  type: string;
  price: number;
  status: string;
  expiresAt: string | null;
  tournamentName: string | null;
}

interface VoucherData {
  stats: VoucherStats;
  pricing: VoucherPricing;
  recentVouchers: RecentVoucher[];
}

export default function AdminVouchersPage() {
  const [voucherData, setVoucherData] = useState<VoucherData | null>(null);
  const [prices, setPrices] = useState<VoucherPricing>({
    BUYIN: { REGULAR: 0, GUEST: 0 },
    REBUY: { REGULAR: 0, GUEST: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 바로 데이터 가져오기 (인증은 API에서 체크)
  useEffect(() => {
    console.log('컴포넌트 마운트, fetchVoucherData 직접 호출');
    fetchVoucherData();
  }, []);

  // 권한 체크 - 제거 (layout.tsx에서 이미 처리)
  // admin/layout.tsx에서 권한 체크를 하므로 여기서는 불필요

  // 바우처 데이터 가져오기
  const fetchVoucherData = async () => {
    console.log('fetchVoucherData 함수 호출됨');
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('API 호출 시작: /api/admin/vouchers/stats');
      const response = await fetch('/api/admin/vouchers/stats');
      console.log('API 응답 상태:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch voucher data');
      }
      
      const data: VoucherData = await response.json();
      console.log('받은 데이터:', data);
      setVoucherData(data);
      setPrices(data.pricing);
    } catch (error) {
      console.error('Error fetching voucher data:', error);
      setError('바우처 데이터를 불러오는데 실패했습니다.');
      toast({
        title: '오류 발생',
        description: '바우처 데이터를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handlePriceChange = (type: 'BUYIN' | 'REBUY', grade: 'GUEST' | 'REGULAR', value: string) => {
    const numValue = parseInt(value) || 0
    setPrices(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [grade]: numValue,
      },
    }))
  }

  const handleSavePrices = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/admin/vouchers/pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyInRegular: prices.BUYIN.REGULAR,
          buyInGuest: prices.BUYIN.GUEST,
          reBuyRegular: prices.REBUY.REGULAR,
          reBuyGuest: prices.REBUY.GUEST,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update pricing');
      }

      toast({
        title: '가격 설정 저장 완료',
        description: '바인권 가격이 성공적으로 업데이트되었습니다.',
      });
      
      // 데이터 새로고침
      await fetchVoucherData();
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast({
        title: '오류 발생',
        description: '가격 설정 저장에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const calculatePremium = (regularPrice: number, guestPrice: number) => {
    if (regularPrice === 0) return 0;
    const premium = ((guestPrice - regularPrice) / regularPrice * 100).toFixed(0);
    return parseInt(premium);
  };

  // 새로고침
  const handleRefresh = () => {
    fetchVoucherData();
  };

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  // 로딩 상태
  if (isLoading && !voucherData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">바우처 데이터를 불러오는 중...</span>
      </div>
    );
  }

  // 에러 상태
  if (error && !voucherData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">데이터 로딩 실패</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchVoucherData}>
          다시 시도
        </Button>
      </div>
    );
  }

  if (!voucherData) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">바인권 관리</h1>
          <p className="text-muted-foreground mt-2">
            바인권 가격 설정 및 발급 현황을 관리합니다.
          </p>
        </div>
        
        <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">새로고침</span>
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">총 발급 바인권</p>
              <p className="text-2xl font-bold">{voucherData.stats.totalIssued.toLocaleString()}개</p>
            </div>
            <Ticket className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">활성 바인권</p>
              <p className="text-2xl font-bold">{voucherData.stats.activeVouchers.toLocaleString()}개</p>
            </div>
            <RefreshCw className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">만료 바인권</p>
              <p className="text-2xl font-bold">{voucherData.stats.expiredVouchers.toLocaleString()}개</p>
            </div>
            <Ticket className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">총 입금액</p>
              <p className="text-2xl font-bold">{voucherData.stats.totalDeposit.toLocaleString()}원</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* 가격 설정 섹션 */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">바인권 가격 설정</h2>
        
        <div className="space-y-6">
          {/* Buy-in 가격 설정 */}
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Ticket className="h-5 w-5 text-blue-500" />
              Buy-in 가격
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="buyin-regular">정회원 가격</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="buyin-regular"
                    type="number"
                    value={prices.BUYIN.REGULAR}
                    onChange={(e) => handlePriceChange('BUYIN', 'REGULAR', e.target.value)}
                    step="1000"
                  />
                  <span className="flex items-center px-3 text-sm text-muted-foreground">원</span>
                </div>
              </div>
              <div>
                <Label htmlFor="buyin-guest">게스트 가격</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="buyin-guest"
                    type="number"
                    value={prices.BUYIN.GUEST}
                    onChange={(e) => handlePriceChange('BUYIN', 'GUEST', e.target.value)}
                    step="1000"
                  />
                  <span className="flex items-center px-3 text-sm text-muted-foreground">원</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  정회원 대비 {
                    prices.BUYIN.GUEST > prices.BUYIN.REGULAR
                      ? `+${calculatePremium(prices.BUYIN.REGULAR, prices.BUYIN.GUEST)}% 할증`
                      : prices.BUYIN.GUEST < prices.BUYIN.REGULAR
                      ? `-${Math.abs(calculatePremium(prices.BUYIN.REGULAR, prices.BUYIN.GUEST))}% 할인`
                      : '동일'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Re-buy 가격 설정 */}
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-green-500" />
              Re-buy 가격
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="rebuy-regular">정회원 가격</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="rebuy-regular"
                    type="number"
                    value={prices.REBUY.REGULAR}
                    onChange={(e) => handlePriceChange('REBUY', 'REGULAR', e.target.value)}
                    step="1000"
                  />
                  <span className="flex items-center px-3 text-sm text-muted-foreground">원</span>
                </div>
              </div>
              <div>
                <Label htmlFor="rebuy-guest">게스트 가격</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="rebuy-guest"
                    type="number"
                    value={prices.REBUY.GUEST}
                    onChange={(e) => handlePriceChange('REBUY', 'GUEST', e.target.value)}
                    step="1000"
                  />
                  <span className="flex items-center px-3 text-sm text-muted-foreground">원</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  정회원 대비 {
                    prices.REBUY.GUEST > prices.REBUY.REGULAR
                      ? `+${calculatePremium(prices.REBUY.REGULAR, prices.REBUY.GUEST)}% 할증`
                      : prices.REBUY.GUEST < prices.REBUY.REGULAR
                      ? `-${Math.abs(calculatePremium(prices.REBUY.REGULAR, prices.REBUY.GUEST))}% 할인`
                      : '동일'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSavePrices} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {isSaving ? '저장 중...' : '가격 저장'}
            </Button>
          </div>
        </div>
      </Card>

      {/* 발급 현황 테이블 */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">최근 발급 내역</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>발급일시</TableHead>
                <TableHead>회원명</TableHead>
                <TableHead>바인권 유형</TableHead>
                <TableHead>회원 등급</TableHead>
                <TableHead className="text-right">금액</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {voucherData.recentVouchers.length > 0 ? (
                voucherData.recentVouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell>{formatDate(voucher.createdAt)}</TableCell>
                    <TableCell>{voucher.userName}</TableCell>
                    <TableCell>
                      <Badge variant={voucher.type === 'BUYIN' ? 'default' : 'outline'}>
                        {voucher.type === 'BUYIN' ? 'Buy-in' : 'Re-buy'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={voucher.userGrade === 'GUEST' ? 'outline' : 'secondary'}>
                        {voucher.userGrade === 'GUEST' ? '게스트' : '정회원'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{voucher.price.toLocaleString()}원</TableCell>
                    <TableCell>
                      <Badge variant={voucher.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {voucher.status === 'ACTIVE' ? '활성' : voucher.status === 'USED' ? '사용됨' : '만료'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    최근 발급 내역이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
