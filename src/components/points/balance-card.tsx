'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, Wallet } from 'lucide-react'
import Link from 'next/link'

// 포인트 잔액 카드 컴포넌트의 Props 타입 정의
interface BalanceCardProps {
  balance: number  // 현재 포인트 잔액
  memberGrade: 'GUEST' | 'REGULAR' | 'ADMIN'  // 회원 등급
  userName?: string  // 사용자 이름 (선택적)
}

// 포인트 잔액을 보여주는 카드 컴포넌트
// 현재 보유 포인트와 회원 등급을 표시하고, 충전/거래내역 버튼 포함
export function BalanceCard({ balance, memberGrade, userName }: BalanceCardProps) {
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
    <Card className="relative overflow-hidden">
      {/* 배경 장식용 그라디언트 원 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -mr-32 -mt-32" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            보유 포인트
          </div>
        </CardTitle>
        {/* 회원 등급 배지 표시 */}
        {getGradeBadge()}
      </CardHeader>
      <CardContent>
        {/* 포인트 잔액 표시 - 그라디언트 텍스트 스타일 */}
        <div className="text-3xl font-bold gradient-text">
          {formatBalance(balance)} P
        </div>
        {/* 사용자 이름 표시 (선택적) */}
        <p className="text-xs text-muted-foreground mt-1">
          {userName && `${userName}님의 포인트`}
        </p>
        {/* 행동 버튼들 - 충전하기, 거래내역 */}
        <div className="flex gap-2 mt-4">
          <Button asChild size="sm" variant="gradient" className="flex-1">
            <Link href="/points/charge">
              충전하기
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link href="/points">거래내역</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
