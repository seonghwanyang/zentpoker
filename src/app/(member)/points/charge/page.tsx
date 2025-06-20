'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { LayoutWrapper } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KakaoPayLink } from '@/components/payment/kakao-pay-link';
import { toast } from '@/lib/hooks/use-toast';
import {
  Wallet,
  CreditCard,
  Info,
  Copy,
  Check,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

// 충전 금액 프리셋 - 바인권 가격 기준
const CHARGE_PRESETS = {
  GUEST: {
    BUYIN: { amount: 60000, label: '게스트 Buy-in' },
    REBUY: { amount: 35000, label: '게스트 Re-buy' },
    BOTH: { amount: 95000, label: '게스트 Buy-in + Re-buy' },
  },
  REGULAR: {
    BUYIN: { amount: 50000, label: '정회원 Buy-in' },
    REBUY: { amount: 30000, label: '정회원 Re-buy' },
    BOTH: { amount: 80000, label: '정회원 Buy-in + Re-buy' },
  },
  CUSTOM: [
    { amount: 100000, label: '10만원' },
    { amount: 200000, label: '20만원' },
    { amount: 300000, label: '30만원' },
    { amount: 500000, label: '50만원' },
  ]
};

export default function ChargePage() {
  const { data: session, status } = useSession();
  const [amount, setAmount] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'BUYIN' | 'REBUY' | 'CUSTOM'>('CUSTOM');
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [referenceCode] = useState(`CHG-${Date.now().toString().slice(-8)}`);
  const [userGrade, setUserGrade] = useState<'GUEST' | 'REGULAR'>('GUEST');
  const [isCopied, setIsCopied] = useState(false);

  // 사용자 등급 가져오기
  useEffect(() => {
    if (session?.user) {
      // @ts-ignore
      const grade = session.user.memberGrade;
      if (grade === 'REGULAR' || grade === 'ADMIN') {
        setUserGrade('REGULAR');
      } else {
        setUserGrade('GUEST');
      }
    }
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

  // 프리셋 버튼 클릭 처리
  const handlePresetClick = (presetAmount: number, presetId: string, type: 'BUYIN' | 'REBUY' | 'CUSTOM') => {
    setAmount(presetAmount.toString());
    setSelectedPreset(presetId);
    setSelectedType(type);
  };

  // 금액 입력 처리
  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setAmount(numericValue);
    setSelectedPreset(null);
    setSelectedType('CUSTOM');
  };

  // 충전 신청 처리
  const handleSubmit = async () => {
    const chargeAmount = parseInt(amount);
    
    if (!chargeAmount || chargeAmount < 10000) {
      toast({
        title: '충전 금액 오류',
        description: '최소 충전 금액은 10,000원입니다.',
        variant: 'destructive',
      });
      return;
    }

    if (chargeAmount > 5000000) {
      toast({
        title: '충전 금액 오류',
        description: '1회 최대 충전 금액은 500만원입니다.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/points/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: chargeAmount,
          method: 'KAKAO_PAY',
          memberGrade: userGrade,
          voucherType: selectedType === 'CUSTOM' ? null : selectedType,
        }),
      });

      if (!response.ok) throw new Error('충전 신청 실패');

      const data = await response.json();
      setShowPaymentInfo(true);
    } catch (error) {
      toast({
        title: '충전 신청 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive',
      });
    }
  };

  const formatAmount = (value: string) => {
    if (!value) return '';
    return parseInt(value).toLocaleString('ko-KR');
  };

  return (
    <LayoutWrapper>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">포인트 충전</h1>
          <p className="text-gray-500 mt-1">
            {userGrade === 'GUEST' ? '게스트' : '정회원'} 등급 가격이 적용됩니다
          </p>
        </div>

        {!showPaymentInfo ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>충전 금액 선택</CardTitle>
                <CardDescription>
                  바인권 구매를 위한 금액이나 원하는 금액을 선택하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 바인권 기준 프리셋 */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    바인권 구매 금액 (추천)
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.entries(CHARGE_PRESETS[userGrade]).map(([key, preset]) => (
                      <Button
                        key={key}
                        variant={selectedPreset === key ? 'default' : 'outline'}
                        onClick={() => handlePresetClick(preset.amount, key, key as 'BUYIN' | 'REBUY')}
                        className="h-auto py-4"
                      >
                        <div className="text-center">
                          <p className="font-semibold">{preset.label}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {preset.amount.toLocaleString('ko-KR')}원
                          </p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 일반 프리셋 */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    일반 충전 금액
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CHARGE_PRESETS.CUSTOM.map((preset, idx) => (
                      <Button
                        key={`custom-${idx}`}
                        variant={selectedPreset === `custom-${idx}` ? 'default' : 'outline'}
                        onClick={() => handlePresetClick(preset.amount, `custom-${idx}`, 'CUSTOM')}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 직접 입력 */}
                <div className="space-y-2">
                  <Label htmlFor="amount">직접 입력</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="text"
                      placeholder="충전할 금액을 입력하세요"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      원
                    </span>
                  </div>
                  {amount && (
                    <p className="text-sm text-purple-600">
                      = {formatAmount(amount)} 포인트
                    </p>
                  )}
                </div>

                {/* 안내 사항 */}
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1 text-sm text-blue-800">
                      <p>• 최소 충전 금액: 10,000원</p>
                      <p>• 충전 포인트는 1원 = 1P로 전환됩니다</p>
                      <p>• 관리자가 입금 확인 후 포인트가 충전됩니다</p>
                      {userGrade === 'GUEST' && (
                        <p className="font-semibold text-orange-700">
                          • 게스트 회원은 바인권 구매 시 20% 할증이 적용됩니다
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={!amount || parseInt(amount) < 10000}
                >
                  다음 단계
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* 결제 정보 표시 */}
            <KakaoPayLink
              amount={parseInt(amount)}
              referenceCode={referenceCode}
              memberGrade={userGrade}
              voucherType={selectedType === 'CUSTOM' ? 'BUYIN' : selectedType}
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPaymentInfo(false)}
                className="flex-1"
              >
                이전으로
              </Button>
              <Button
                variant="gradient"
                onClick={() => {
                  toast({
                    title: '충전 신청 완료',
                    description: '관리자가 입금 확인 후 포인트가 충전됩니다.',
                  });
                  setTimeout(() => {
                    window.location.href = '/points';
                  }, 2000);
                }}
                className="flex-1"
              >
                완료
              </Button>
            </div>
          </>
        )}
      </div>
    </LayoutWrapper>
  );
}
