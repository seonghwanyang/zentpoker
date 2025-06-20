'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useSearchParams } from 'next/navigation';
import { LayoutWrapper } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  AlertCircle,
  ArrowRight,
  Copy,
  CheckCircle,
  ExternalLink,
  CreditCard,
  Smartphone,
  Wallet,
} from 'lucide-react';

// 카카오페이 송금 링크 (실제로는 환경변수나 API에서 가져옴)
const KAKAO_PAY_LINK = 'https://qr.kakaopay.com/example123';
const BANK_ACCOUNT = {
  bank: '카카오뱅크',
  accountNumber: '3333-01-1234567',
  accountHolder: 'ZentPoker',
};

export default function VoucherPaymentPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');
  const [paymentData, setPaymentData] = useState<{
    buyInQuantity: number;
    reBuyQuantity: number;
    totalPrice: number;
    totalQuantity: number;
  } | null>(null);

  useEffect(() => {
    // URL 파라미터에서 결제 정보 가져오기
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(dataParam));
        setPaymentData(data);
      } catch (error) {
        console.error('Invalid payment data');
        redirect('/vouchers/purchase');
      }
    } else {
      redirect('/vouchers/purchase');
    }

    // 참조 코드 생성 (실제로는 서버에서 생성)
    const code = `VP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setReferenceCode(code);
  }, [searchParams]);

  if (status === 'loading' || !paymentData) {
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: '복사 완료',
      description: '계좌번호가 클립보드에 복사되었습니다.',
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleKakaoPayClick = () => {
    window.open(KAKAO_PAY_LINK, '_blank');
  };

  return (
    <LayoutWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h1 className="text-3xl font-bold">바인권 결제</h1>
          <p className="text-gray-500 mt-1">아래 방법 중 하나를 선택하여 결제해주세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 결제 방법 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 결제 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>결제 정보</CardTitle>
                <CardDescription>
                  결제 시 아래 참조 코드를 꼭 입력해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-900">참조 코드</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(referenceCode)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      복사
                    </Button>
                  </div>
                  <p className="font-mono text-lg font-bold text-purple-900">{referenceCode}</p>
                  <p className="text-xs text-purple-700 mt-2">
                    * 이 코드는 결제 확인을 위해 반드시 필요합니다
                  </p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">결제 금액</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {formatAmount(paymentData.totalPrice)}원
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 카카오페이 송금 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Smartphone className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle>카카오페이 송금</CardTitle>
                    <CardDescription>
                      가장 빠르고 편리한 결제 방법
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">1</Badge>
                    <div className="flex-1">
                      <p className="font-medium">아래 버튼을 클릭하여 카카오페이로 이동</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">2</Badge>
                    <div className="flex-1">
                      <p className="font-medium">금액 입력: {formatAmount(paymentData.totalPrice)}원</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5">3</Badge>
                    <div className="flex-1">
                      <p className="font-medium">메시지에 참조 코드 입력</p>
                      <p className="text-sm text-gray-500 mt-1">참조 코드: {referenceCode}</p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  onClick={handleKakaoPayClick}
                >
                  카카오페이로 송금하기
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* 계좌이체 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wallet className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>계좌이체</CardTitle>
                    <CardDescription>
                      일반 은행 계좌로 이체
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">은행</span>
                    <span className="font-medium">{BANK_ACCOUNT.bank}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">계좌번호</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{BANK_ACCOUNT.accountNumber}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(BANK_ACCOUNT.accountNumber)}
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">예금주</span>
                    <span className="font-medium">{BANK_ACCOUNT.accountHolder}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">송금액</span>
                    <span className="font-medium text-purple-600">
                      {formatAmount(paymentData.totalPrice)}원
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <AlertCircle className="inline h-4 w-4 mr-1" />
                    입금자명에 참조 코드를 반드시 입력해주세요
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 주의사항 */}
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm text-red-800">
                    <p className="font-medium">결제 시 주의사항</p>
                    <p>• 참조 코드를 꼭 입력해주세요</p>
                    <p>• 결제 후 1-2분 내 자동 확인됩니다</p>
                    <p>• 문제 발생 시 관리자에게 문의해주세요</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽: 결제 요약 */}
          <div className="space-y-6">
            {/* 구매 내역 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  구매 내역
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {paymentData.buyInQuantity > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Buy-in 바인권</span>
                      <span className="font-medium">{paymentData.buyInQuantity}개</span>
                    </div>
                  )}
                  {paymentData.reBuyQuantity > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Re-buy 바인권</span>
                      <span className="font-medium">{paymentData.reBuyQuantity}개</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium">총 수량</span>
                      <span className="font-medium">{paymentData.totalQuantity}개</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="font-medium">결제 금액</span>
                      <span className="font-bold text-lg text-purple-600">
                        {formatAmount(paymentData.totalPrice)}원
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 다음 단계 안내 */}
            <Card>
              <CardHeader>
                <CardTitle>결제 후 안내</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-600 mt-0.5" />
                    <p>결제 완료 후 1-2분 내 자동으로 바인권이 지급됩니다</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-600 mt-0.5" />
                    <p>바인권 메뉴에서 구매한 바인권을 확인할 수 있습니다</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-600 mt-0.5" />
                    <p>10분 이상 지급되지 않을 경우 관리자에게 문의해주세요</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
