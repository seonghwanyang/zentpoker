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
import { ConfirmDialog } from '@/components/confirm-dialog'
import { 
  DollarSign, 
  Percent, 
  Save, 
  History,
  TrendingUp,
  AlertCircle,
  Edit
} from 'lucide-react'

// Mock 현재 가격 설정
const mockCurrentPricing = {
  buyIn: {
    regular: 50000,
    guest: 60000,
  },
  reBuy: {
    regular: 30000,
    guest: 36000,
  },
  guestPremium: 20, // 게스트 할증률 (%)
  lastUpdated: '2024-12-15T14:30:00',
  updatedBy: '관리자',
}

// Mock 가격 변경 이력
const mockPriceHistory = [
  {
    id: '1',
    date: '2024-12-15T14:30:00',
    updatedBy: '관리자',
    changes: {
      buyInRegular: { from: 45000, to: 50000 },
      buyInGuest: { from: 54000, to: 60000 },
    },
    note: '연말 특별 요금 적용',
  },
  {
    id: '2',
    date: '2024-11-01T10:00:00',
    updatedBy: '관리자',
    changes: {
      guestPremium: { from: 15, to: 20 },
    },
    note: '게스트 할증률 조정',
  },
  {
    id: '3',
    date: '2024-10-15T09:00:00',
    updatedBy: '관리자',
    changes: {
      reBuyRegular: { from: 25000, to: 30000 },
      reBuyGuest: { from: 30000, to: 36000 },
    },
    note: '리바이 가격 인상',
  },
]

export default function AdminVoucherPricingPage() {
  const [pricing, setPricing] = useState(mockCurrentPricing)
  const [editMode, setEditMode] = useState(false)
  const [tempPricing, setTempPricing] = useState(pricing)
  const [isSaving, setIsSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // 가격 변경 시작
  const handleEditStart = () => {
    setEditMode(true)
    setTempPricing(pricing)
  }

  // 가격 변경 취소
  const handleEditCancel = () => {
    setEditMode(false)
    setTempPricing(pricing)
  }

  // 가격 저장
  const handleSave = async () => {
    setIsSaving(true)
    
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setPricing(tempPricing)
    setEditMode(false)
    setShowConfirm(false)
    
    toast({
      title: '가격 설정 저장 완료',
      description: '바인권 가격이 성공적으로 업데이트되었습니다.',
    })
    
    setIsSaving(false)
  }

  // 게스트 가격 자동 계산
  const calculateGuestPrice = (regularPrice: number, premiumRate: number) => {
    return Math.round(regularPrice * (1 + premiumRate / 100))
  }

  // 할증률 변경 시 게스트 가격 재계산
  const handlePremiumChange = (value: string) => {
    const premium = parseInt(value) || 0
    setTempPricing(prev => ({
      ...prev,
      guestPremium: premium,
      buyIn: {
        ...prev.buyIn,
        guest: calculateGuestPrice(prev.buyIn.regular, premium),
      },
      reBuy: {
        ...prev.reBuy,
        guest: calculateGuestPrice(prev.reBuy.regular, premium),
      },
    }))
  }

  // 정회원 가격 변경 시 게스트 가격 재계산
  const handleRegularPriceChange = (type: 'buyIn' | 'reBuy', value: string) => {
    const price = parseInt(value) || 0
    setTempPricing(prev => ({
      ...prev,
      [type]: {
        regular: price,
        guest: calculateGuestPrice(price, prev.guestPremium),
      },
    }))
  }

  // 날짜 포맷
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">바인권 가격 설정</h1>
          <p className="text-muted-foreground mt-2">
            바인권과 리바인권의 가격을 설정하고 관리할 수 있습니다.
          </p>
        </div>
        
        {!editMode && (
          <Button onClick={handleEditStart}>
            <Edit className="h-4 w-4 mr-2" />
            가격 수정
          </Button>
        )}
      </div>

      {/* 현재 가격 설정 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Buy-in 가격 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Buy-in 가격</h3>
            <Badge variant="default">바인권</Badge>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>정회원 가격</Label>
              {editMode ? (
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={tempPricing.buyIn.regular}
                    onChange={(e) => handleRegularPriceChange('buyIn', e.target.value)}
                    className="pl-10"
                    step="1000"
                  />
                </div>
              ) : (
                <p className="text-2xl font-bold mt-1">
                  {pricing.buyIn.regular.toLocaleString()}원
                </p>
              )}
            </div>
            
            <div>
              <Label className="flex items-center gap-2">
                게스트 가격
                <Badge variant="secondary" className="text-xs">
                  +{pricing.guestPremium}%
                </Badge>
              </Label>
              <p className="text-2xl font-bold mt-1 text-muted-foreground">
                {(editMode ? tempPricing : pricing).buyIn.guest.toLocaleString()}원
              </p>
            </div>
          </div>
        </Card>

        {/* Re-buy 가격 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Re-buy 가격</h3>
            <Badge variant="outline">리바인권</Badge>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>정회원 가격</Label>
              {editMode ? (
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={tempPricing.reBuy.regular}
                    onChange={(e) => handleRegularPriceChange('reBuy', e.target.value)}
                    className="pl-10"
                    step="1000"
                  />
                </div>
              ) : (
                <p className="text-2xl font-bold mt-1">
                  {pricing.reBuy.regular.toLocaleString()}원
                </p>
              )}
            </div>
            
            <div>
              <Label className="flex items-center gap-2">
                게스트 가격
                <Badge variant="secondary" className="text-xs">
                  +{pricing.guestPremium}%
                </Badge>
              </Label>
              <p className="text-2xl font-bold mt-1 text-muted-foreground">
                {(editMode ? tempPricing : pricing).reBuy.guest.toLocaleString()}원
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 게스트 할증률 설정 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">게스트 할증률</h3>
            <p className="text-sm text-muted-foreground mt-1">
              정회원 대비 게스트 회원의 가격 할증 비율을 설정합니다.
            </p>
          </div>
          <Percent className="h-5 w-5 text-muted-foreground" />
        </div>
        
        {editMode ? (
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-xs">
              <Input
                type="number"
                value={tempPricing.guestPremium}
                onChange={(e) => handlePremiumChange(e.target.value)}
                className="pr-10"
                min="0"
                max="100"
                step="5"
              />
              <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>할증률 변경 시 게스트 가격이 자동으로 재계산됩니다.</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <p className="text-2xl font-bold">{pricing.guestPremium}%</p>
            <Badge variant="outline">
              정회원 가격의 {100 + pricing.guestPremium}%
            </Badge>
          </div>
        )}
      </Card>

      {/* 수정 모드 액션 버튼 */}
      {editMode && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={handleEditCancel}>
            취소
          </Button>
          <Button onClick={() => setShowConfirm(true)}>
            <Save className="h-4 w-4 mr-2" />
            변경사항 저장
          </Button>
        </div>
      )}

      {/* 마지막 업데이트 정보 */}
      {!editMode && (
        <Card className="p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">마지막 업데이트</p>
                <p className="text-sm font-medium">
                  {formatDateTime(pricing.lastUpdated)} · {pricing.updatedBy}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 가격 변경 이력 */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">가격 변경 이력</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>변경 일시</TableHead>
                  <TableHead>변경자</TableHead>
                  <TableHead>변경 내용</TableHead>
                  <TableHead>비고</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPriceHistory.map((history) => (
                  <TableRow key={history.id}>
                    <TableCell>{formatDateTime(history.date)}</TableCell>
                    <TableCell>{history.updatedBy}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {Object.entries(history.changes).map(([key, change]) => (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">
                              {key === 'buyInRegular' && 'Buy-in 정회원'}
                              {key === 'buyInGuest' && 'Buy-in 게스트'}
                              {key === 'reBuyRegular' && 'Re-buy 정회원'}
                              {key === 'reBuyGuest' && 'Re-buy 게스트'}
                              {key === 'guestPremium' && '게스트 할증률'}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-red-500">
                                {key === 'guestPremium' 
                                  ? `${change.from}%` 
                                  : `${change.from.toLocaleString()}원`}
                              </span>
                              <TrendingUp className="h-3 w-3" />
                              <span className="text-green-500 font-medium">
                                {key === 'guestPremium' 
                                  ? `${change.to}%` 
                                  : `${change.to.toLocaleString()}원`}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {history.note}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      {/* 저장 확인 다이얼로그 */}
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="가격 변경 확인"
        description="정말로 바인권 가격을 변경하시겠습니까? 변경된 가격은 즉시 적용됩니다."
        confirmText="변경"
        onConfirm={handleSave}
        isLoading={isSaving}
      />
    </div>
  )
}
