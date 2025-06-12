'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'

interface PriceTableProps {
  regularBuyinPrice: number
  regularRebuyPrice: number
  guestBuyinPrice: number
  guestRebuyPrice: number
  currentGrade: 'GUEST' | 'REGULAR' | 'ADMIN'
  onPurchase: (type: 'BUYIN' | 'REBUY') => void
}

export function PriceTable({
  regularBuyinPrice,
  regularRebuyPrice,
  guestBuyinPrice,
  guestRebuyPrice,
  currentGrade,
  onPurchase,
}: PriceTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const calculateDiscount = (guestPrice: number, regularPrice: number) => {
    return Math.round(((guestPrice - regularPrice) / guestPrice) * 100)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 정회원 가격 */}
      <Card className={currentGrade === 'REGULAR' || currentGrade === 'ADMIN' ? 'border-purple-500 shadow-lg' : 'opacity-75'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">정회원 가격</CardTitle>
            <Badge variant="regular">REGULAR</Badge>
          </div>
          <CardDescription>
            동호회 정회원을 위한 특별 가격
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <div>
                <p className="font-medium">바인권</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatPrice(regularBuyinPrice)}P
                </p>
              </div>
              {(currentGrade === 'REGULAR' || currentGrade === 'ADMIN') && (
                <Button 
                  size="sm" 
                  variant="gradient"
                  onClick={() => onPurchase('BUYIN')}
                >
                  구매
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-pink-50 dark:bg-pink-950/20">
              <div>
                <p className="font-medium">리바인권</p>
                <p className="text-2xl font-bold text-pink-600">
                  {formatPrice(regularRebuyPrice)}P
                </p>
              </div>
              {(currentGrade === 'REGULAR' || currentGrade === 'ADMIN') && (
                <Button 
                  size="sm" 
                  variant="gradient"
                  onClick={() => onPurchase('REBUY')}
                >
                  구매
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>최대 {calculateDiscount(guestBuyinPrice, regularBuyinPrice)}% 할인</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>우선 참가 혜택</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 게스트 가격 */}
      <Card className={currentGrade === 'GUEST' ? 'border-gray-500 shadow-lg' : 'opacity-75'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">게스트 가격</CardTitle>
            <Badge variant="guest">GUEST</Badge>
          </div>
          <CardDescription>
            비회원 및 게스트 참가자
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-950/20">
              <div>
                <p className="font-medium">바인권</p>
                <p className="text-2xl font-bold text-gray-600">
                  {formatPrice(guestBuyinPrice)}P
                </p>
              </div>
              {currentGrade === 'GUEST' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onPurchase('BUYIN')}
                >
                  구매
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-950/20">
              <div>
                <p className="font-medium">리바인권</p>
                <p className="text-2xl font-bold text-gray-600">
                  {formatPrice(guestRebuyPrice)}P
                </p>
              </div>
              {currentGrade === 'GUEST' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onPurchase('REBUY')}
                >
                  구매
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <XCircle className="h-4 w-4 text-gray-400" />
              <span>할증 가격 적용</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <XCircle className="h-4 w-4 text-gray-400" />
              <span>대기 순위 적용</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 정회원 전환 안내 */}
      {currentGrade === 'GUEST' && (
        <Card className="md:col-span-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg">💡 정회원이 되면 더 많은 혜택을!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              정회원 전환 시 최대 {calculateDiscount(guestBuyinPrice, regularBuyinPrice)}% 할인된 가격으로 바인권을 구매할 수 있습니다.
            </p>
            <Button variant="outline" size="sm">
              정회원 신청하기
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
