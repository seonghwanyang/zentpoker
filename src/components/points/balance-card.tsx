'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

/**
 * 포인트 잔액 카드 컴포넌트
 * - 레퍼런스 디자인 적용 (보라색 그라데이션)
 * - 사용자 정보와 잔액 표시
 * - 빠른 액션 버튼 (충전, 바인권 구매)
 * - 하단 빠른 메뉴 링크
 */
import { 
  ArrowUpRight, 
  Wallet, 
  Send, 
  CreditCard,
  TrendingUp,
  Bell
} from 'lucide-react'
import Link from 'next/link'

// Props 타입 정의
interface BalanceCardProps {
  balance: number               // 현재 포인트 잔액
  memberGrade: 'GUEST' | 'REGULAR' | 'ADMIN'  // 회원 등급
  userName?: string             // 사용자 이름
  userImage?: string            // 프로필 이미지 URL
  recentChange?: number         // 최근 변동액 (오늘 기준)
}

export function BalanceCard({ 
  balance, 
  memberGrade, 
  userName,
  userImage,
  recentChange 
}: BalanceCardProps) {
  // 숫자를 한국 형식으로 포맷팅 (1,000 단위 콤마)
  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  // 회원 등급에 따른 배지 컴포넌트 반환
  const getGradeBadge = () => {
    switch (memberGrade) {
      case 'ADMIN':
        return <Badge variant="admin">관리자</Badge>
      case 'REGULAR':
        return <Badge variant="regular">정회원</Badge>
      case 'GUEST':
        return <Badge variant="guest">게스트</Badge>
    }
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 text-white border-0 shadow-xl w-full max-w-sm">
      {/* 배경 패턴 - 부드러운 그라데이션 효과 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-300 rounded-full -ml-32 -mb-32 blur-2xl" />
      </div>

      <CardHeader className="relative z-10 pb-3 px-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white/20">
              <AvatarImage src={userImage} alt={userName || ''} />
              <AvatarFallback className="bg-purple-500 text-white">
                {userName?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs text-purple-100">안녕하세요,</p>
              <p className="font-semibold text-base truncate">{userName || '회원'}님!</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {getGradeBadge()}
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 h-8 w-8">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-5 px-6">
        {/* 잔액 표시 영역 */}
        <div>
          <p className="text-sm text-purple-200 mb-1">Total Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{formatBalance(balance)}</span>
            <span className="text-lg text-purple-200">P</span>
          </div>
          {/* 최근 변동액 표시 (옵셔널) */}
          {recentChange && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className={`h-4 w-4 ${recentChange > 0 ? 'text-green-400' : 'text-red-400'}`} />
              <span className={`text-sm ${recentChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {recentChange > 0 ? '+' : ''}{formatBalance(recentChange)}
              </span>
              <span className="text-xs text-purple-300">오늘</span>
            </div>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/points/charge" className="w-full">
            <Button 
              size="default" 
              className="w-full bg-white text-purple-700 hover:bg-purple-50 shadow-lg flex items-center justify-center h-10"
            >
              <Send className="mr-2 h-4 w-4" />
              포인트 충전
            </Button>
          </Link>
          <Link href="/vouchers/purchase" className="w-full">
            <Button 
              size="default" 
              variant="outline" 
              className="w-full border-white text-white bg-white/10 hover:bg-white/20 flex items-center justify-center h-10"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              바인권 구매
            </Button>
          </Link>
        </div>

        {/* 빠른 메뉴 */}
        <div className="grid grid-cols-4 gap-3 pt-3 border-t border-white/10">
          <Link href="/points" className="text-center group">
            <div className="mx-auto w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <Wallet className="h-4 w-4" />
            </div>
            <p className="text-xs mt-1 text-purple-200">거래내역</p>
          </Link>
          <Link href="/vouchers" className="text-center group">
            <div className="mx-auto w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <CreditCard className="h-4 w-4" />
            </div>
            <p className="text-xs mt-1 text-purple-200">바인권</p>
          </Link>
          <Link href="/tournaments" className="text-center group">
            <div className="mx-auto w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <TrendingUp className="h-4 w-4" />
            </div>
            <p className="text-xs mt-1 text-purple-200">토너먼트</p>
          </Link>
          <Link href="/profile" className="text-center group">
            <div className="mx-auto w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <p className="text-xs mt-1 text-purple-200">더보기</p>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
