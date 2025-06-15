'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, Ticket } from 'lucide-react'

/**
 * 바인권 카드 컴포넌트
 * - Buy-in/Re-buy 바인권 표시
 * - 사용 상태, 유효기간, 토너먼트 정보
 * - 만료 임박 바인권 경고 표시
 */

// 바인권 카드 컴포넌트의 Props 타입 정의
interface VoucherCardProps {
  type: 'BUYIN' | 'REBUY'                    // 바인권 타입 (바인/리바인)
  status: 'ACTIVE' | 'USED' | 'EXPIRED'     // 바인권 상태
  purchasePrice: number                      // 구매 가격
  expiresAt?: Date                          // 만료일 (선택적)
  usedAt?: Date                             // 사용일 (선택적)
  onUse?: () => void                        // 사용하기 버튼 클릭 핸들러
}

// 바인권 정보를 표시하는 카드 컴포넌트
// 바인권의 타입, 상태, 가격, 만료일 등을 시각적으로 표현
export function VoucherCard({
  type,
  status,
  purchasePrice,
  expiresAt,
  usedAt,
  onUse,
}: VoucherCardProps) {
  // 날짜를 한국어 형식으로 포맷팅 (2024년 12월 20일)
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  // 가격을 한국 형식으로 포맷팅 (1,000 단위 콤마)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  // 바인권 상태에 따른 배지 컴포넌트 반환
  const getStatusBadge = () => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default">사용가능</Badge>
      case 'USED':
        return <Badge variant="secondary">사용완료</Badge>
      case 'EXPIRED':
        return <Badge variant="destructive">만료</Badge>
    }
  }

  // 바인권 타입에 따른 정보 반환 (제목, 아이콘, 그라디언트 색상)
  const getTypeInfo = () => {
    switch (type) {
      case 'BUYIN':
        return {
          title: '바인권',
          icon: <Ticket className="h-5 w-5" />,
          gradient: 'from-purple-500 to-purple-700',  // 보라색 그라디언트
        }
      case 'REBUY':
        return {
          title: '리바인권',
          icon: <Ticket className="h-5 w-5" />,
          gradient: 'from-pink-500 to-pink-700',      // 분홍색 그라디언트
        }
      default:
        return {
          title: '바인권',
          icon: <Ticket className="h-5 w-5" />,
          gradient: 'from-purple-500 to-purple-700',  // 기본값
        }
    }
  }

  const typeInfo = getTypeInfo()
  // 만료 임박 여부 확인 (7일 이내)
  const isExpiringSoon = expiresAt && 
    new Date(expiresAt).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000

  return (
    <Card className={`relative overflow-hidden ${status !== 'ACTIVE' ? 'opacity-75' : ''}`}>
      {/* 배경 장식용 그라디언트 원 */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${typeInfo.gradient} opacity-10 rounded-full -mr-16 -mt-16`} />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 바인권 타입 아이콘 */}
            <div className={`p-2 rounded-lg bg-gradient-to-br ${typeInfo.gradient} text-white`}>
              {typeInfo.icon}
            </div>
            <div>
              <h3 className="font-semibold">{typeInfo.title}</h3>
              <p className="text-sm text-muted-foreground">{formatPrice(purchasePrice)}P</p>
            </div>
          </div>
          {/* 바인권 상태 배지 */}
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 만료일 표시 (활성 상태일 때만) */}
        {expiresAt && status === 'ACTIVE' && (
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className={isExpiringSoon ? 'text-orange-600 font-medium' : 'text-muted-foreground'}>
              {formatDate(expiresAt)}까지
              {isExpiringSoon && ' (곧 만료)'}
            </span>
          </div>
        )}

        {/* 사용일 표시 (사용 완료 상태일 때) */}
        {usedAt && status === 'USED' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{formatDate(usedAt)} 사용</span>
          </div>
        )}

        {/* 사용하기 버튼 (활성 상태이고 onUse 핸들러가 있을 때) */}
        {status === 'ACTIVE' && onUse && (
          <Button 
            onClick={onUse} 
            size="sm" 
            className="w-full"
            variant="gradient"
          >
            사용하기
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
