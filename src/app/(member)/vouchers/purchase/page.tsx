'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

/**
 * 바인권 구매 페이지
 * - Buy-in/Re-buy 바인권 선택
 * - 회원 등급별 차등 가격 적용
 * - 포인트 잔액 확인 및 구매 처리
 */
import { LayoutWrapper } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PriceTable } from '@/components/vouchers/price-table';
import { BalanceCard } from '@/components/points/balance-card';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { toast } from '@/lib/hooks/use-toast';
import {
  Ticket,
  Wallet,
  Info,
  ShoppingCart,
  Plus,
  Minus,
  AlertCircle,
} from 'lucide-react';

// 임시 가격 데이터 (실제로는 API에서 가져옴)
const voucherPrices = {
  BUY_IN: {
    REGULAR: 100000,
    GUEST: 120000, // 20% 할증
  },
  RE_BUY: {
    REGULAR: 50000,
    GUEST: 60000, // 20% 할증
  },
};

// 임시 잔액 데이터 (실제로는 API에서 가져옴)
const mockBalance = 500000;

export default function VoucherPurchasePage() {
  const { data: session, status } = useSession();
  const [voucherType, setVoucherType] = useState<'BUY_IN' | 'RE_BUY'>('BUY_IN');
  const [quantity, setQuantity] = useState(1);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  // 회원 등급에 따른 가격 계산
  const memberGrade = session.user.memberGrade || 'GUEST';
  const unitPrice = voucherPrices[voucherType][memberGrade as 'REGULAR' | 'GUEST'];
  const totalPrice = unitPrice * quantity;
  const hasEnoughBalance = mockBalance >= totalPrice;

  // 수량 변경 처리 (1~10개 제한)
  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  // 바인권 구매 처리
  const handlePurchase = async () => {
    // 잔액 부족 확인
    if (!hasEnoughBalance) {
      toast({
        title: '잔액 부족',
        description: '포인트가 부족합니다. 충전 후 다시 시도해주세요.',
        variant: 'destructive',
      });
      return;
    }

    // 실제로는 API 호출
    toast({
      title: '구매 완료',
      description: `${voucherType === 'BUY_IN' ? 'Buy-in' : 'Re-buy'} 바인권 ${quantity}개를 구매했습니다.`,
    });

    setShowConfirmDialog(false);
    setTimeout(() => {
      window.location.href = '/vouchers';
    }, 1500);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <LayoutWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h1 className="text-3xl font-bold">바인권 구매</h1>
          <p className="text-gray-500 mt-1">토너먼트 참가를 위한 바인권을 구매하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 구매 옵션 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 바인권 종류 선택 */}
            <Card>
              <CardHeader>
                <CardTitle>바인권 종류 선택</CardTitle>
                <CardDescription>
                  구매할 바인권 종류를 선택하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={voucherType}
                  onValueChange={(value) => setVoucherType(value as 'BUY_IN' | 'RE_BUY')}
                >
                  <div className="space-y-4">
                    <label
                      htmlFor="buy-in"
                      className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        voucherType === 'BUY_IN'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="BUY_IN" id="buy-in" />
                        <div>
                          <p className="font-semibold">Buy-in 바인권</p>
                          <p className="text-sm text-gray-600">토너먼트 첫 참가용</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-purple-600">
                          {formatAmount(voucherPrices.BUY_IN[memberGrade as 'REGULAR' | 'GUEST'])} P
                        </p>
                        {memberGrade === 'GUEST' && (
                          <p className="text-xs text-red-600">게스트 할증 적용</p>
                        )}
                      </div>
                    </label>

                    <label
                      htmlFor="re-buy"
                      className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        voucherType === 'RE_BUY'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="RE_BUY" id="re-buy" />
                        <div>
                          <p className="font-semibold">Re-buy 바인권</p>
                          <p className="text-sm text-gray-600">토너먼트 재참가용</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-purple-600">
                          {formatAmount(voucherPrices.RE_BUY[memberGrade as 'REGULAR' | 'GUEST'])} P
                        </p>
                        {memberGrade === 'GUEST' && (
                          <p className="text-xs text-red-600">게스트 할증 적용</p>
                        )}
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* 수량 선택 */}
            <Card>
              <CardHeader>
                <CardTitle>구매 수량</CardTitle>
                <CardDescription>
                  최대 10개까지 구매 가능합니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="w-24 text-center">
                    <p className="text-3xl font-bold">{quantity}</p>
                    <p className="text-sm text-gray-500">개</p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 가격표 */}
            <PriceTable />

            {/* 안내사항 */}
            {memberGrade === 'GUEST' && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1 text-sm text-yellow-800">
                      <p className="font-medium">게스트 회원 안내</p>
                      <p>• 게스트 회원은 20% 할증된 가격이 적용됩니다</p>
                      <p>• 정회원 승급 시 정규 가격으로 구매 가능합니다</p>
                      <p>• 관리자에게 정회원 승급을 요청하세요</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 오른쪽: 결제 정보 */}
          <div className="space-y-6">
            {/* 포인트 잔액 */}
            <BalanceCard
              balance={mockBalance}
              memberGrade={memberGrade}
              userName={session.user.name || undefined}
              userImage={session.user.image || undefined}
            />

            {/* 구매 요약 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  구매 요약
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">바인권 종류</span>
                    <span className="font-medium">
                      {voucherType === 'BUY_IN' ? 'Buy-in' : 'Re-buy'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">단가</span>
                    <span className="font-medium">{formatAmount(unitPrice)} P</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">수량</span>
                    <span className="font-medium">{quantity}개</span>
                  </div>
                  {memberGrade === 'GUEST' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">게스트 할증</span>
                      <span className="font-medium text-red-600">20%</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">총 결제금액</span>
                      <span className="font-bold text-lg text-purple-600">
                        {formatAmount(totalPrice)} P
                      </span>
                    </div>
                  </div>
                </div>

                {!hasEnoughBalance && (
                  <div className="rounded-lg bg-red-50 p-3">
                    <div className="flex items-center gap-2 text-sm text-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <span>포인트가 부족합니다</span>
                    </div>
                  </div>
                )}

                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={!hasEnoughBalance}
                >
                  <Ticket className="mr-2 h-5 w-5" />
                  구매하기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 구매 확인 다이얼로그 */}
        <ConfirmDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          title="바인권 구매 확인"
          description={`${voucherType === 'BUY_IN' ? 'Buy-in' : 'Re-buy'} 바인권 ${quantity}개를 ${formatAmount(totalPrice)} 포인트에 구매하시겠습니까?`}
          onConfirm={handlePurchase}
          confirmText="구매하기"
          confirmVariant="default"
        />
      </div>
    </LayoutWrapper>
  );
}
