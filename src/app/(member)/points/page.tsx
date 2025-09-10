'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect as useSupabaseEffect, useState as useSupabaseState } from 'react';
import { redirect } from 'next/navigation';

/**
 * 포인트 현황 페이지
 * - 현재 보유 포인트 표시
 * - 포인트 지급 내역만 표시 (차감 내역 숨김)
 */
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
  Trophy,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

// 거래 타입 정의
type Transaction = {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: Date;
};

// 거래 타입과 상태 타입 정의
type TransactionType = 'ALL' | 'REWARD';
type TransactionStatus = 'ALL' | 'COMPLETED' | 'PENDING' | 'FAILED';

export default function PointsPage() {
  const [user, setUser] = useSupabaseState<any>(null);
  const [loading, setLoading] = useSupabaseState(true);
  const supabase = createClientComponentClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType>('ALL');
  const [filterStatus, setFilterStatus] = useState<TransactionStatus>('ALL');
  const [dateRange, setDateRange] = useState('30'); // days
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useSupabaseEffect(() => {
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
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch balance
        const balanceRes = await fetch('/api/points/balance');
        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          setCurrentBalance(balanceData.balance || 0);
        }

        // Fetch transactions
        const transRes = await fetch('/api/points/transactions');
        if (transRes.ok) {
          const transData = await transRes.json();
          // Convert date strings to Date objects
          const formattedTransactions = (transData.transactions || []).map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt)
          }));
          setTransactions(formattedTransactions);
        }
      } catch (error) {
        console.error('Failed to fetch points data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
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

  // 선택된 필터와 검색어에 따라 거래 목록 필터링
  const filteredTransactions = transactions.filter(transaction => {
    if (filterType !== 'ALL' && transaction.type !== filterType) return false;
    if (filterStatus !== 'ALL' && transaction.status !== filterStatus) return false;
    if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
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
      case 'REWARD':
        return <ArrowDownRight className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'REWARD':
        return 'text-green-600 bg-green-100';
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

  // 통계 계산 - 총 지급액
  const totalRewards = transactions
    .filter(t => t.type === 'REWARD' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">포인트 관리</h1>
            <p className="text-gray-500 mt-1">포인트 잔액과 거래 내역을 확인하세요</p>
          </div>
          <Link href="/points/charge">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
              <CreditCard className="mr-2 h-4 w-4" />
              포인트 충전
            </Button>
          </Link>
        </div>

        {/* 포인트 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                현재 보유 포인트
                <Wallet className="h-4 w-4 text-purple-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatAmount(currentBalance)} P
              </div>
              <p className="text-xs text-gray-500 mt-1">사용 가능</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                총 지급 포인트
                <Trophy className="h-4 w-4 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatAmount(totalRewards)} P
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {transactions.filter(t => t.type === 'REWARD').length}회
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                이번 달 활동
                <Activity className="h-4 w-4 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {transactions.filter(t => {
                  const now = new Date();
                  const transDate = new Date(t.createdAt);
                  return transDate.getMonth() === now.getMonth() && 
                         transDate.getFullYear() === now.getFullYear();
                }).length}건
              </div>
              <p className="text-xs text-gray-500 mt-1">거래 내역</p>
            </CardContent>
          </Card>
        </div>

        {/* 필터 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              거래 내역 필터
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                  <SelectItem value="REWARD">지급</SelectItem>
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

        {/* 지급 내역 */}
        <Card>
          <CardHeader>
            <CardTitle>포인트 지급 내역</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-500">로딩 중...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">지급 내역이 없습니다.</p>
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