'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Ticket, Users, UserCheck } from 'lucide-react';

interface PricingPolicy {
  pointCharge: {
    member: { amount: number; description: string };
    guest: { amount: number; description: string };
  };
  vouchers: {
    rebuy: { amount: number; description: string };
  };
}

export function PricingInfo() {
  const [pricing, setPricing] = useState<PricingPolicy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPricing() {
      try {
        const response = await fetch('/api/pricing');
        const data = await response.json();
        if (data.success) {
          setPricing(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch pricing:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPricing();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            가격 정책
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pricing) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* 포인트 충전 정책 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-blue-600" />
            포인트 충전
          </CardTitle>
          <CardDescription>
            회원 등급별 포인트 충전 금액
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <span className="font-medium">정회원</span>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {pricing.pointCharge.member.amount.toLocaleString()}원
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="font-medium">게스트</span>
            </div>
            <Badge variant="outline" className="bg-gray-100">
              {pricing.pointCharge.guest.amount.toLocaleString()}원
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 바우처 정책 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-green-600" />
            바우처 가격
          </CardTitle>
          <CardDescription>
            게임 관련 바우처 가격 정책
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-green-600" />
              <span className="font-medium">리바인권</span>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {pricing.vouchers.rebuy.amount.toLocaleString()}원
            </Badge>
          </div>
          
          <div className="text-sm text-gray-600 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <strong className="text-yellow-800">📌 안내:</strong>
            <br />
            리바인권은 토너먼트에서 재입장 시 사용됩니다.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PricingInfo;