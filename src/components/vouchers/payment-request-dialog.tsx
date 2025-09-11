'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { AlertCircle, Loader2, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PaymentRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voucherType: 'BUYIN' | 'REBUY'
  amount: number
  quantity: number
}

export function PaymentRequestDialog({
  open,
  onOpenChange,
  voucherType,
  amount,
  quantity,
}: PaymentRequestDialogProps) {
  const router = useRouter()
  const [depositorName, setDepositorName] = useState('')
  const [bankName, setBankName] = useState('')
  const [memo, setMemo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!depositorName.trim()) {
      toast({
        title: '입금자명을 입력해주세요',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/payment-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voucherType,
          amount,
          depositorName,
          bankName,
          memo: `${voucherType === 'BUYIN' ? '바인' : '리바이'}권 ${quantity}개 구매\n${memo}`.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment request')
      }

      toast({
        title: '입금 확인 요청 완료',
        description: '관리자가 입금을 확인하면 바인권이 발급됩니다.',
      })

      onOpenChange(false)
      
      // 입력 필드 초기화
      setDepositorName('')
      setBankName('')
      setMemo('')
      
      // 대시보드로 리다이렉트
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      console.error('Payment request error:', error)
      toast({
        title: '요청 실패',
        description: '입금 확인 요청 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>입금 확인 요청</DialogTitle>
          <DialogDescription>
            계좌이체 후 입금 정보를 입력해주세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 입금 계좌 정보 */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p className="font-semibold">입금 계좌 정보</p>
              <div className="text-sm space-y-1">
                <p>은행: 신한은행</p>
                <p>계좌번호: 110-123-456789</p>
                <p>예금주: 젠트포커</p>
                <p className="font-semibold text-purple-600">
                  입금액: {amount.toLocaleString()}원
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* 입금자명 */}
          <div className="space-y-2">
            <Label htmlFor="depositorName">
              입금자명 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="depositorName"
              placeholder="실제 입금하신 분의 성함을 입력해주세요"
              value={depositorName}
              onChange={(e) => setDepositorName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* 입금 은행 */}
          <div className="space-y-2">
            <Label htmlFor="bankName">입금 은행 (선택)</Label>
            <Input
              id="bankName"
              placeholder="입금하신 은행명 (예: 국민은행)"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="memo">메모 (선택)</Label>
            <Textarea
              id="memo"
              placeholder="추가로 전달하실 내용이 있으면 입력해주세요"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {/* 안내 메시지 */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="text-sm space-y-1">
                <li>• 입금 확인은 보통 10분 이내에 처리됩니다</li>
                <li>• 영업시간 외에는 처리가 지연될 수 있습니다</li>
                <li>• 입금자명이 다른 경우 확인이 어려울 수 있습니다</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !depositorName.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                요청 중...
              </>
            ) : (
              '입금 확인 요청'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}