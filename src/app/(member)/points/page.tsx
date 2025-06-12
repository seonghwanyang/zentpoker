'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { LayoutWrapper } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  Search,
  Wallet,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';

// 임시 거래 데이터
const mockTransactions = [
  {
    id: '1',
    type: 'CHARGE',
    amount: 500000,
    description: '카카오페이 충전',
    status: 'COMPLETED',
    createdAt: new Date('2024-12-20T10:30:00'),
    referenceCode: 'CHG-20241220-001',
  },
  {
    id: '2',
    type: 'PURCHASE',
    amount: -100000,
    description: 'Buy-in 바인권 구매',
    status: 'COMPLETED',
    createdAt: new Date('2024-12-20T09:15:00'),
    voucherType: 'BUY_IN',
  },
  {
    id: '3',
    type: 'PURCHASE',
    amount: -50000,
    description: 'Re-buy 바인권 구매',
    status: 'COMPLETED',
    createdAt: new Date('2024-12-19T15:20:00'),
    voucherType: 'RE_BUY',
  },
  {
    id: '4',
    type: 'CHARGE',
    amount: 300000,
    description: '계좌이체 충전',
    status: 'PENDING',
    createdAt: new Date('2024-12-19T14:00:00'),
    referenceCode: 'CHG-20241219-002',
  },
  {
    id: '5',
    type: 'REFUND',
    amount: 100000,
    description: '토너먼트 취소 환불',
    status: 'COMPLETED',
    createdAt: new Date('2024-12-18T11:30:00'),
  },
];

type TransactionType = 'ALL' | 'CHARGE' | 'PURCHASE' | 'REFUND';
type TransactionStatus = 'ALL' | 'COMPLETED' | 'PENDING' | 'FAILED';

export default function PointsPage() {
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType>('ALL');
  const [filterStatus, setFilterStatus] = useState<TransactionStatus>('ALL');
  const [dateRange, setDateRange] = useState('30'); // days

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

  // 필터링된 거래 목록
  const filteredTransactions = mockTransactions.filter(transaction => {
    if (filterType !== 'ALL' && transaction.type !== filterType) return false;
    if (filterStatus !== 'ALL' && transaction.status !== filterStatus) return false;
    if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !transaction.referenceCode?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    const daysDiff = (new Date().getTime() - transaction.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > parseInt(dateRange)) return false;
    
    return true;
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(Math.abs(amount));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'CHARGE':
        return <ArrowDownRight className="h-5 w-5" />;
      case 'PURCHASE':
        return <CreditCard className="h-5 w-5" />;
      case 'REFUND':
        return <ArrowUpRight className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'CHARGE':
      case 'REFUND':
        return 'text-green-600 bg-green-100';
      case 'PURCHASE':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">완료</Badge>;
      case 'PENDING':
        return <Badge variant="warning">대기중</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">실패</Badge>;
      default:
        return null;
    }
  };

  // 통계 계산
  const totalCharged = mockTransactions
    .filter(t => t.type === 'CHARGE' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalSpent = mockTransactions
    .filter(t => t.type === 'PURCHASE' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">포인트 내역</h1>
            <p className="text-gray-500 mt-1">포인트 충전 및 사용 내역을 확인하세요</p>
          </div>
          <Link href="/points/charge">
            <Button variant="gradient">
              <Wallet className="mr-2 h-4 w-4" />
              포인트 충전
            </Button>
          </Link>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 충전액</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{formatAmount(totalCharged)} P
              </div>
              <p className="text-xs text-muted-foreground">이번 달 기준</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 사용액</CardTitle>
              <CreditCard className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                -{formatAmount(totalSpent)} P
              </div>
              <p className="text-xs text-muted-foreground">이번 달 기준</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">순 변동액</CardTitle>
              <Wallet className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {totalCharged - totalSpent > 0 ? '+' : ''}{formatAmount(totalCharged - totalSpent)} P
              </div>
              <p className="text-xs text-muted-foreground">충전 - 사용</p>
            </CardContent>
          </Card>
        </div>

        {/* 필터 섹션 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>거래 내역 필터</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                내보내기
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={(value) => setFilterType(value as TransactionType)}>
                <SelectTrigger>
                  <SelectValue placeholder="거래 유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="CHARGE">충전</SelectItem>
                  <SelectItem value="PURCHASE">구매</SelectItem>
                  <SelectItem value="REFUND">환불</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as TransactionStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="COMPLETED">완료</SelectItem>
                  <SelectItem value="PENDING">대기중</SelectItem>
                  <SelectItem value="FAILED">실패</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="기간" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">최근 7일</SelectItem>
                  <SelectItem value="30">최근 30일</SelectItem>
                  <SelectItem value="90">최근 90일</SelectItem>
                  <SelectItem value="365">전체</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 거래 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>거래 내역</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">거래 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${getTransactionColor(transaction.type)}`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{transaction.description}</p>
                          {getStatusBadge(transaction.status)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(transaction.createdAt)}</span>
                          {transaction.referenceCode && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-xs">{transaction.referenceCode}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`text-lg font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatAmount(transaction.amount)} P
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}
