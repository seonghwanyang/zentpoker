'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { LayoutWrapper } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

// 충전 금액 프리셋
const CHARGE_PRESETS = [
  { amount: 50000, label: '5만원' },
  { amount: 100000, label: '10만원' },
  { amount: 200000, label: '20만원' },
  { amount: 300000, label: '30만원' },
  { amount: 500000, label: '50만원' },
  { amount: 1000000, label: '100만원' },
];

export default function ChargePage() {
  const { data: session, status } = useSession();
  const [amount, setAmount] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [referenceCode] = useState(`CHG-${new Date().getTime()}`);
  const [isCopied, setIsCopied] = useState(false);

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

  const handlePresetClick = (presetAmount: number) => {
    setAmount(presetAmount.toString());
    setSelectedPreset(presetAmount);
  };

  const handleAmountChange = (value: string) => {
    // 숫자만 입력 가능
    const numericValue = value.replace(/[^0-9]/g, '');
    setAmount(numericValue);
    setSelectedPreset(null);
  };

  const handleSubmit = () => {
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

    setShowPaymentInfo(true);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast({
        title: '복사 완료',
        description: `${type}이(가) 클립보드에 복사되었습니다.`,
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({
        title: '복사 실패',
        description: '클립보드 복사에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const formatAmount = (value: string) => {
    if (!value) return '';
    return parseInt(value).toLocaleString('ko-KR');
  };

  const bankAccount = process.env.NEXT_PUBLIC_BANK_ACCOUNT || '국민은행 123-456-789012';
  const accountHolder = process.env.NEXT_PUBLIC_ACCOUNT_HOLDER || '홍길동';

  return (
    <LayoutWrapper>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h1 className="text-3xl font-bold">포인트 충전</h1>
          <p className="text-gray-500 mt-1">카카오페이 또는 계좌이체로 포인트를 충전하세요</p>
        </div>

        {!showPaymentInfo ? (
          <>
            {/* 충전 금액 입력 */}
            <Card>
              <CardHeader>
                <CardTitle>충전 금액 선택</CardTitle>
                <CardDescription>
                  충전할 금액을 선택하거나 직접 입력하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 프리셋 버튼 */}
                <div className="grid grid-cols-3 gap-3">
                  {CHARGE_PRESETS.map((preset) => (
                    <Button
                      key={preset.amount}
                      variant={selectedPreset === preset.amount ? 'default' : 'outline'}
                      onClick={() => handlePresetClick(preset.amount)}
                      className="h-auto py-4"
                    >
                      <div>
                        <p className="font-semibold">{preset.label}</p>
                        <p className="text-xs opacity-70">
                          {preset.amount.toLocaleString('ko-KR')} P
                        </p>
                      </div>
                    </Button>
                  ))}
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
                      <p>• 최대 충전 금액: 5,000,000원</p>
                      <p>• 충전 포인트는 1원 = 1P로 전환됩니다</p>
                      <p>• 충전 취소는 관리자에게 문의하세요</p>
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
            {/* 결제 정보 */}
            <Card className="border-purple-200">
              <CardHeader className="bg-purple-50">
                <div className="flex items-center justify-between">
                  <CardTitle>충전 정보 확인</CardTitle>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {formatAmount(amount)}원
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">충전 금액</span>
                    <span className="font-medium">{formatAmount(amount)}원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">획득 포인트</span>
                    <span className="font-medium text-purple-600">{formatAmount(amount)} P</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">참조 코드</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{referenceCode}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(referenceCode, '참조 코드')}
                      >
                        {isCopied ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 결제 방법 선택 */}
            <Card>
              <CardHeader>
                <CardTitle>결제 방법 선택</CardTitle>
                <CardDescription>
                  아래 방법 중 하나를 선택하여 송금해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 카카오페이 */}
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">추천</Badge>
                    <h3 className="font-semibold">카카오페이 송금</h3>
                  </div>
                  <KakaoPayLink amount={parseInt(amount)} referenceCode={referenceCode} />
                </div>

                {/* 계좌이체 */}
                <div className="p-4 border rounded-lg space-y-3">
                  <h3 className="font-semibold">계좌이체</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm text-gray-600">입금 계좌</p>
                        <p className="font-medium">{bankAccount}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(bankAccount.replace(/[^0-9]/g, ''), '계좌번호')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        복사
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm text-gray-600">예금주</p>
                        <p className="font-medium">{accountHolder}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 주의사항 */}
                <div className="rounded-lg bg-yellow-50 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1 text-sm text-yellow-800">
                      <p className="font-medium">송금 시 주의사항</p>
                      <p>• 반드시 참조 코드를 입금자명에 포함해주세요</p>
                      <p>• 입금 후 관리자 확인까지 최대 10분 소요됩니다</p>
                      <p>• 문의사항은 관리자에게 연락주세요</p>
                    </div>
                  </div>
                </div>

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
                        description: '입금 확인 후 포인트가 자동으로 충전됩니다.',
                      });
                      // 실제로는 API 호출 후 리디렉션
                      setTimeout(() => {
                        window.location.href = '/points';
                      }, 2000);
                    }}
                    className="flex-1"
                  >
                    완료
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </LayoutWrapper>
  );
}
