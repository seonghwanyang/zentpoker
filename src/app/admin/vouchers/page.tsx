'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'
import { Save, RefreshCw, Ticket, DollarSign } from 'lucide-react'

// Mock 데이터
const mockVoucherPrices = {
  BUYIN: {
    GUEST: 30000,
    REGULAR: 25000,
  },
  REBUY: {
    GUEST: 20000,
    REGULAR: 15000,
  },
}

const mockVoucherStats = {
  totalIssued: 1234,
  activeVouchers: 456,
  expiredVouchers: 778,
  totalDeposit: 45600000, // 총 입금액
  buyinCount: 789,
  rebuyCount: 445,
}

export default function AdminVouchersPage() {
  const [prices, setPrices] = useState(mockVoucherPrices)
  const [isLoading, setIsLoading] = useState(false)

  const handlePriceChange = (type: 'BUYIN' | 'REBUY', grade: 'GUEST' | 'REGULAR', value: string) => {
    const numValue = parseInt(value) || 0
    setPrices(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [grade]: numValue,
      },
    }))
  }

  const handleSavePrices = async () => {
    setIsLoading(true)
    
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast({
      title: '가격 설정 저장 완료',
      description: '바인권 가격이 성공적으로 업데이트되었습니다.',
    })
    
    setIsLoading(false)
  }

  const calculatePremium = (regularPrice: number, guestPrice: number) => {
    const premium = ((guestPrice - regularPrice) / regularPrice * 100).toFixed(0)
    return parseInt(premium)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">바인권 관리</h1>
        <p className="text-muted-foreground mt-2">
          바인권 가격 설정 및 발급 현황을 관리합니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">총 발급 바인권</p>
              <p className="text-2xl font-bold">{mockVoucherStats.totalIssued.toLocaleString()}개</p>
            </div>
            <Ticket className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">활성 바인권</p>
              <p className="text-2xl font-bold">{mockVoucherStats.activeVouchers.toLocaleString()}개</p>
            </div>
            <RefreshCw className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">만료 바인권</p>
              <p className="text-2xl font-bold">{mockVoucherStats.expiredVouchers.toLocaleString()}개</p>
            </div>
            <Ticket className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">총 입금액</p>
              <p className="text-2xl font-bold">{mockVoucherStats.totalDeposit.toLocaleString()}원</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* 가격 설정 섹션 */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">바인권 가격 설정</h2>
        
        <div className="space-y-6">
          {/* Buy-in 가격 설정 */}
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Ticket className="h-5 w-5 text-blue-500" />
              Buy-in 가격
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="buyin-regular">정회원 가격</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="buyin-regular"
                    type="number"
                    value={prices.BUYIN.REGULAR}
                    onChange={(e) => handlePriceChange('BUYIN', 'REGULAR', e.target.value)}
                    step="1000"
                  />
                  <span className="flex items-center px-3 text-sm text-muted-foreground">원</span>
                </div>
              </div>
              <div>
                <Label htmlFor="buyin-guest">게스트 가격</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="buyin-guest"
                    type="number"
                    value={prices.BUYIN.GUEST}
                    onChange={(e) => handlePriceChange('BUYIN', 'GUEST', e.target.value)}
                    step="1000"
                  />
                  <span className="flex items-center px-3 text-sm text-muted-foreground">원</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  정회원 대비 {
                    prices.BUYIN.GUEST > prices.BUYIN.REGULAR
                      ? `+${calculatePremium(prices.BUYIN.REGULAR, prices.BUYIN.GUEST)}% 할증`
                      : prices.BUYIN.GUEST < prices.BUYIN.REGULAR
                      ? `-${Math.abs(calculatePremium(prices.BUYIN.REGULAR, prices.BUYIN.GUEST))}% 할인`
                      : '동일'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Re-buy 가격 설정 */}
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-green-500" />
              Re-buy 가격
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="rebuy-regular">정회원 가격</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="rebuy-regular"
                    type="number"
                    value={prices.REBUY.REGULAR}
                    onChange={(e) => handlePriceChange('REBUY', 'REGULAR', e.target.value)}
                    step="1000"
                  />
                  <span className="flex items-center px-3 text-sm text-muted-foreground">원</span>
                </div>
              </div>
              <div>
                <Label htmlFor="rebuy-guest">게스트 가격</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="rebuy-guest"
                    type="number"
                    value={prices.REBUY.GUEST}
                    onChange={(e) => handlePriceChange('REBUY', 'GUEST', e.target.value)}
                    step="1000"
                  />
                  <span className="flex items-center px-3 text-sm text-muted-foreground">원</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  정회원 대비 {
                    prices.REBUY.GUEST > prices.REBUY.REGULAR
                      ? `+${calculatePremium(prices.REBUY.REGULAR, prices.REBUY.GUEST)}% 할증`
                      : prices.REBUY.GUEST < prices.REBUY.REGULAR
                      ? `-${Math.abs(calculatePremium(prices.REBUY.REGULAR, prices.REBUY.GUEST))}% 할인`
                      : '동일'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSavePrices} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? '저장 중...' : '가격 저장'}
            </Button>
          </div>
        </div>
      </Card>

      {/* 발급 현황 테이블 */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">최근 발급 내역</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>발급일시</TableHead>
                <TableHead>회원명</TableHead>
                <TableHead>바인권 유형</TableHead>
                <TableHead>회원 등급</TableHead>
                <TableHead className="text-right">금액</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>2024-12-20 15:30</TableCell>
                <TableCell>김철수</TableCell>
                <TableCell>
                  <Badge variant="default">Buy-in</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">정회원</Badge>
                </TableCell>
                <TableCell className="text-right">50,000원</TableCell>
                <TableCell>
                  <Badge variant="success">활성</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2024-12-20 14:20</TableCell>
                <TableCell>이영희</TableCell>
                <TableCell>
                  <Badge variant="outline">Re-buy</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">게스트</Badge>
                </TableCell>
                <TableCell className="text-right">36,000원</TableCell>
                <TableCell>
                  <Badge variant="success">활성</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
