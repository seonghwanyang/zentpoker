'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { LayoutWrapper } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { BalanceCard } from '@/components/points/balance-card';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Ticket,
  Wallet,
  Info,
  ShoppingCart,
  Plus,
  Minus,
  AlertCircle,
  CreditCard,
} from 'lucide-react';

// 가격 데이터 (실제로는 API에서 가져옴)
const voucherPrices = {
  BUY_IN: {
    REGULAR: 25000,
    GUEST: 30000,
    ADMIN: 25000,  // 관리자는 정회원과 동일한 가격
  },
  RE_BUY: {
    REGULAR: 15000,
    GUEST: 20000,
    ADMIN: 15000,   // 관리자는 정회원과 동일한 가격
  },
};

// 임시 잔액 데이터 (실제로는 API에서 가져옴)
const mockBalance = 500000;

export default function VoucherPurchasePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [buyInQuantity, setBuyInQuantity] = useState(0);
  const [reBuyQuantity, setReBuyQuantity] = useState(0);
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'points' | 'direct' | null>(null);

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
  const memberGrade = session.user?.memberGrade || 'GUEST';
  const buyInPrice = voucherPrices.BUY_IN?.[memberGrade as 'REGULAR' | 'GUEST' | 'ADMIN'] || 0;
  const reBuyPrice = voucherPrices.RE_BUY?.[memberGrade as 'REGULAR' | 'GUEST' | 'ADMIN'] || 0;
  
  const buyInTotal = buyInPrice * buyInQuantity;
  const reBuyTotal = reBuyPrice * reBuyQuantity;
  const totalPrice = buyInTotal + reBuyTotal;
  const totalQuantity = buyInQuantity + reBuyQuantity;
  
  const hasEnoughBalance = mockBalance >= totalPrice;

  // Buy-in 수량 변경
  const handleBuyInQuantityChange = (change: number) => {
    const newQuantity = buyInQuantity + change;
    if (newQuantity >= 0 && newQuantity <= 10) {
      setBuyInQuantity(newQuantity);
    }
  };

  // Re-buy 수량 변경
  const handleReBuyQuantityChange = (change: number) => {
    const newQuantity = reBuyQuantity + change;
    if (newQuantity >= 0 && newQuantity <= 10) {
      setReBuyQuantity(newQuantity);
    }
  };

  // 구매하기 버튼 클릭 시 결제 방법 선택 다이얼로그 표시
  const handlePurchaseClick = () => {
    if (totalQuantity === 0) {
      toast({
        title: '구매 수량 확인',
        description: '구매할 바인권을 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }
    setShowPaymentMethodDialog(true);
  };

  // 결제 방법 선택
  const handlePaymentMethodSelect = (method: 'points' | 'direct') => {
    setSelectedPaymentMethod(method);
    setShowPaymentMethodDialog(false);

    if (method === 'points') {
      // 포인트 결제인 경우 바로 확인 다이얼로그 표시
      if (!hasEnoughBalance) {
        toast({
          title: '잔액 부족',
          description: '포인트가 부족합니다. 다른 결제 방법을 선택해주세요.',
          variant: 'destructive',
        });
        return;
      }
      setShowConfirmDialog(true);
    } else {
      // 직접 결제인 경우 결제 페이지로 이동
      const paymentData = {
        buyInQuantity,
        reBuyQuantity,
        totalPrice,
        totalQuantity,
      };
      // 결제 페이지로 이동 (실제로는 결제 정보를 세션이나 쿼리 파라미터로 전달)
      router.push(`/vouchers/payment?data=${encodeURIComponent(JSON.stringify(paymentData))}`);
    }
  };

  // 포인트로 바인권 구매 처리
  const handlePointsPurchase = async () => {
    // 실제로는 API 호출
    const purchaseItems = [];
    if (buyInQuantity > 0) {
      purchaseItems.push(`Buy-in 바인권 ${buyInQuantity}개`);
    }
    if (reBuyQuantity > 0) {
      purchaseItems.push(`Re-buy 바인권 ${reBuyQuantity}개`);
    }
    
    toast({
      title: '구매 완료',
      description: `${purchaseItems.join(', ')}를 포인트로 구매했습니다.`,
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
            {/* 바인권 종류 및 수량 선택 */}
            <Card>
              <CardHeader>
                <CardTitle>바인권 구매</CardTitle>
                <CardDescription>
                  구매할 바인권의 수량을 선택하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Buy-in 바인권 */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">Buy-in 바인권</h4>
                      <p className="text-sm text-gray-600">토너먼트 첫 참가용</p>
                      <p className="text-lg font-semibold text-purple-600 mt-1">
                        {formatAmount(buyInPrice)}원
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleBuyInQuantityChange(-1)}
                        disabled={buyInQuantity <= 0}
                        className="h-8 w-8"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="w-12 text-center">
                        <p className="text-xl font-bold">{buyInQuantity}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleBuyInQuantityChange(1)}
                        disabled={buyInQuantity >= 10}
                        className="h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {buyInQuantity > 0 && (
                    <div className="mt-2 text-sm text-gray-500 text-right">
                      소계: {formatAmount(buyInTotal)}원
                    </div>
                  )}
                </div>

                {/* Re-buy 바인권 */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">Re-buy 바인권</h4>
                      <p className="text-sm text-gray-600">토너먼트 재참가용</p>
                      <p className="text-lg font-semibold text-purple-600 mt-1">
                        {formatAmount(reBuyPrice)}원
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleReBuyQuantityChange(-1)}
                        disabled={reBuyQuantity <= 0}
                        className="h-8 w-8"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="w-12 text-center">
                        <p className="text-xl font-bold">{reBuyQuantity}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleReBuyQuantityChange(1)}
                        disabled={reBuyQuantity >= 10}
                        className="h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {reBuyQuantity > 0 && (
                    <div className="mt-2 text-sm text-gray-500 text-right">
                      소계: {formatAmount(reBuyTotal)}원
                    </div>
                  )}
                </div>

                {memberGrade === 'GUEST' && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      <Info className="inline h-3 w-3 mr-1" />
                      게스트 회원은 할증된 가격이 적용됩니다
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 가격표 */}
            <Card>
              <CardHeader>
                <CardTitle>가격표</CardTitle>
                <CardDescription>
                  회원 등급별 바인권 가격 안내
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">회원 등급</th>
                        <th className="text-right py-2 px-4">Buy-in 바인권</th>
                        <th className="text-right py-2 px-4">Re-buy 바인권</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">
                          <Badge variant="default">정회원</Badge>
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {formatAmount(voucherPrices.BUY_IN.REGULAR)}원
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {formatAmount(voucherPrices.RE_BUY.REGULAR)}원
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">
                          <Badge variant="secondary">게스트</Badge>
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {formatAmount(voucherPrices.BUY_IN.GUEST)}원
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {formatAmount(voucherPrices.RE_BUY.GUEST)}원
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">
                          <Badge className="bg-purple-600 text-white">관리자</Badge>
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {formatAmount(voucherPrices.BUY_IN.ADMIN)}원
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {formatAmount(voucherPrices.RE_BUY.ADMIN)}원
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* 안내사항 */}
            {memberGrade === 'GUEST' && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1 text-sm text-yellow-800">
                      <p className="font-medium">게스트 회원 안내</p>
                      <p>• 게스트 회원은 별도 책정된 가격이 적용됩니다</p>
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
              memberGrade={(memberGrade as 'GUEST' | 'REGULAR' | 'ADMIN') || 'GUEST'}
              userName={session.user?.name || undefined}
              userImage={session.user?.image || undefined}
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
                <div className="space-y-3">
                  {/* Buy-in 바인권 요약 */}
                  {buyInQuantity > 0 && (
                    <div className="text-sm">
                      <span className="font-medium text-black">Buy-in 바인권</span>
                      <span className="text-gray-600 ml-2">
                        {formatAmount(buyInPrice)}원 × {buyInQuantity}개
                      </span>
                    </div>
                  )}
                  
                  {/* Re-buy 바인권 요약 */}
                  {reBuyQuantity > 0 && (
                    <div className="text-sm">
                      <span className="font-medium text-black">Re-buy 바인권</span>
                      <span className="text-gray-600 ml-2">
                        {formatAmount(reBuyPrice)}원 × {reBuyQuantity}개
                      </span>
                    </div>
                  )}
                  
                  {/* 구매할 바인권이 없는 경우 */}
                  {totalQuantity === 0 && (
                    <div className="text-center py-4 text-sm text-gray-500">
                      구매할 바인권을 선택해주세요
                    </div>
                  )}
                  
                  {/* 회원 등급 표시 */}
                  {memberGrade === 'GUEST' && totalQuantity > 0 && (
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="text-gray-600">회원 등급</span>
                      <span className="font-medium text-red-600">게스트</span>
                    </div>
                  )}
                  
                  {/* 총 결제금액 */}
                  {totalQuantity > 0 && (
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold">총 결제금액</span>
                          <span className="text-xs text-gray-500 ml-2">
                            (총 {totalQuantity}개)
                          </span>
                        </div>
                        <span className="font-bold text-lg text-purple-600">
                          {formatAmount(totalPrice)}원
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  onClick={handlePurchaseClick}
                  disabled={totalQuantity === 0}
                >
                  <Ticket className="mr-2 h-5 w-5" />
                  {totalQuantity === 0 ? '바인권을 선택해주세요' : '구매하기'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 결제 방법 선택 다이얼로그 */}
        <Dialog open={showPaymentMethodDialog} onOpenChange={setShowPaymentMethodDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>결제 방법 선택</DialogTitle>
              <DialogDescription>
                바인권을 구매할 결제 방법을 선택해주세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* 포인트 결제 옵션 */}
              <button
                onClick={() => handlePaymentMethodSelect('points')}
                disabled={!hasEnoughBalance}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  hasEnoughBalance 
                    ? 'border-gray-200 hover:border-purple-500 hover:bg-purple-50' 
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet className={`h-6 w-6 ${hasEnoughBalance ? 'text-purple-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <p className={`font-semibold ${hasEnoughBalance ? 'text-gray-900' : 'text-gray-500'}`}>
                        포인트로 결제
                      </p>
                      <p className="text-sm text-gray-500">
                        보유 포인트: {formatAmount(mockBalance)} P
                      </p>
                    </div>
                  </div>
                  {!hasEnoughBalance && (
                    <Badge variant="destructive">잔액 부족</Badge>
                  )}
                </div>
              </button>

              {/* 직접 결제 옵션 */}
              <button
                onClick={() => handlePaymentMethodSelect('direct')}
                className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">직접 결제</p>
                      <p className="text-sm text-gray-500">카카오페이로 결제</p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 포인트 구매 확인 다이얼로그 */}
        <ConfirmDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          title="포인트로 바인권 구매"
          description={
            <div className="space-y-2">
              {buyInQuantity > 0 && (
                <p>Buy-in 바인권 {buyInQuantity}개: {formatAmount(buyInTotal)} P</p>
              )}
              {reBuyQuantity > 0 && (
                <p>Re-buy 바인권 {reBuyQuantity}개: {formatAmount(reBuyTotal)} P</p>
              )}
              <p className="font-semibold pt-2 border-t">
                총 {totalQuantity}개를 {formatAmount(totalPrice)} 포인트로 구매하시겠습니까?
              </p>
              <p className="text-sm text-gray-500 pt-1">
                구매 후 남은 포인트: {formatAmount(mockBalance - totalPrice)} P
              </p>
            </div>
          }
          onConfirm={handlePointsPurchase}
          confirmText="포인트로 구매"
          confirmVariant="default"
        />
      </div>
    </LayoutWrapper>
  );
}
