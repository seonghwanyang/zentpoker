'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import { LayoutWrapper } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PRICING } from '@/lib/config/pricing';
import {
  Wallet,
  Info,
  Phone,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function ChargePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

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
  const [copiedPhone, setCopiedPhone] = useState(false);

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

  const memberGrade = user?.user_metadata?.memberGrade || 'GUEST';

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <LayoutWrapper>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">포인트 충전</h1>
          <p className="text-gray-600">
            관리자에게 직접 충전을 요청하세요
          </p>
        </div>

        {/* 충전 안내 카드 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              충전 안내
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">충전 절차</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>아래 연락처로 관리자에게 충전을 요청하세요</li>
                <li>관리자와 충전 금액 및 입금 방법을 협의하세요</li>
                <li>입금 확인 후 관리자가 포인트를 지급해드립니다</li>
                <li>포인트 지급 완료 시 알림을 받게 됩니다</li>
              </ol>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-900 mb-1">주의사항</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-800">
                    <li>충전은 관리자 확인 후 처리됩니다</li>
                    <li>처리 시간은 상황에 따라 달라질 수 있습니다</li>
                    <li>충전 관련 문의는 관리자에게 직접 연락주세요</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 가격 정보 카드 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>바우처 가격 안내</CardTitle>
            <CardDescription>
              회원 등급: <Badge variant="outline">{memberGrade === 'GUEST' ? '게스트' : '정회원'}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Buy-in 바우처</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {new Intl.NumberFormat('ko-KR').format(
                    memberGrade === 'GUEST' 
                      ? PRICING.VOUCHER.BUY_IN.GUEST 
                      : PRICING.VOUCHER.BUY_IN.REGULAR
                  )}원
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Re-buy 바우처</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {new Intl.NumberFormat('ko-KR').format(
                    memberGrade === 'GUEST' 
                      ? PRICING.VOUCHER.RE_BUY.GUEST 
                      : PRICING.VOUCHER.RE_BUY.REGULAR
                  )}원
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 관리자 연락처 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              관리자 연락처
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">전화번호</p>
                  <p className="font-semibold">010-1234-5678</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyPhone('010-1234-5678')}
              >
                {copiedPhone ? '복사됨!' : '복사'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">카카오톡 ID</p>
                  <p className="font-semibold">zentpoker_admin</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyPhone('zentpoker_admin')}
              >
                복사
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">
                운영 시간: 오전 10시 ~ 오후 10시
              </p>
              <Link href="/points">
                <Button variant="outline" className="w-full">
                  <Wallet className="h-4 w-4 mr-2" />
                  포인트 내역 확인하기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}