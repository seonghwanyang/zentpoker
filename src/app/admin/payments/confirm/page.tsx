'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { toast } from '@/components/ui/use-toast'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Copy, 
  Eye,
  DollarSign,
  Calendar,
  User,
  MessageSquare,
  RefreshCw
} from 'lucide-react'

interface Payment {
  id: string
  userId: string
  userName: string
  userEmail: string
  amount: number
  referenceCode: string
  paymentMethod: 'KAKAO' | 'BANK'
  requestedAt: string
  status: 'PENDING' | 'COMPLETED' | 'REJECTED'
  memo: string
}

interface PaymentStats {
  totalCount: number
  totalAmount: number
  averageWaitTime: number
}

export default function AdminPaymentConfirmPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    totalCount: 0,
    totalAmount: 0,
    averageWaitTime: 0
  })
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [confirmMemo, setConfirmMemo] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [dialogType, setDialogType] = useState<'confirm' | 'reject' | null>(null)

  // 데이터 불러오기
  const fetchPendingPayments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/payment-requests')
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments')
      }
      
      const data = await response.json()
      
      // PaymentRequest 데이터를 Payment 인터페이스로 매핑
      const mappedPayments = data
        .filter((req: any) => req.status === 'PENDING')
        .map((req: any) => ({
          id: req.id,
          userId: req.userId,
          userName: req.depositorName || '알 수 없음', // depositorName 사용
          userEmail: req.User?.email || '',
          amount: req.amount,
          referenceCode: req.id.slice(0, 8).toUpperCase(),
          paymentMethod: 'BANK' as const,
          requestedAt: req.requestDate,
          status: req.status,
          memo: req.memo || ''
        }))
      
      setPayments(mappedPayments)
      
      // 통계 계산
      const totalAmount = mappedPayments.reduce((sum: number, p: any) => sum + p.amount, 0)
      const avgWaitTime = mappedPayments.length > 0 
        ? Math.floor(mappedPayments.reduce((sum: number, p: any) => {
            const now = new Date()
            const requested = new Date(p.requestedAt)
            return sum + (now.getTime() - requested.getTime()) / 60000
          }, 0) / mappedPayments.length)
        : 0
      
      setStats({
        totalCount: mappedPayments.length,
        totalAmount: totalAmount,
        averageWaitTime: avgWaitTime
      })
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast({
        title: '오류',
        description: '입금 대기 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    fetchPendingPayments()
  }, [])

  // 새로고침
  const handleRefresh = async () => {
    await fetchPendingPayments()
    toast({
      title: '새로고침 완료',
      description: '입금 대기 목록을 새로고침했습니다.',
    })
  }

  // 참조코드 복사
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: '복사 완료',
      description: '참조 코드가 클립보드에 복사되었습니다.',
    })
  }

  // 입금 확인 처리
  const handleConfirmPayment = async () => {
    if (!selectedPayment) return

    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/admin/payment-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: selectedPayment.id,
          action: 'CONFIRM',
          memo: confirmMemo,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to confirm payment')
      }

      // 상태 업데이트
      setPayments(prev => prev.filter(p => p.id !== selectedPayment.id))
      setStats(prev => ({
        ...prev,
        totalCount: prev.totalCount - 1,
        totalAmount: prev.totalAmount - selectedPayment.amount
      }))
      
      toast({
        title: '입금 확인 완료',
        description: `${selectedPayment.userName}님의 ${selectedPayment.amount.toLocaleString()}원 충전이 승인되었습니다.`,
      })
      
      setDialogType(null)
      setSelectedPayment(null)
      setConfirmMemo('')
    } catch (error) {
      console.error('Error confirming payment:', error)
      toast({
        title: '오류',
        description: '입금 확인 처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // 입금 거절 처리
  const handleRejectPayment = async () => {
    if (!selectedPayment || !rejectReason.trim()) return

    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/admin/payment-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: selectedPayment.id,
          action: 'REJECT',
          memo: rejectReason,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject payment')
      }

      // 상태 업데이트
      setPayments(prev => prev.filter(p => p.id !== selectedPayment.id))
      setStats(prev => ({
        ...prev,
        totalCount: prev.totalCount - 1,
        totalAmount: prev.totalAmount - selectedPayment.amount
      }))
      
      toast({
        title: '입금 거절 완료',
        description: `${selectedPayment.userName}님의 충전 요청이 거절되었습니다.`,
        variant: 'destructive',
      })
      
      setDialogType(null)
      setSelectedPayment(null)
      setRejectReason('')
    } catch (error) {
      console.error('Error rejecting payment:', error)
      toast({
        title: '오류',
        description: '입금 거절 처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // 날짜 포맷
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR')
  }

  // 경과 시간 계산
  const getElapsedTime = (dateString: string) => {
    const now = new Date()
    const requested = new Date(dateString)
    const diff = now.getTime() - requested.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 60) return `${minutes}분 전`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}시간 전`
    const days = Math.floor(hours / 24)
    return `${days}일 전`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">입금 확인</h1>
          <p className="text-muted-foreground mt-2">
            입금 대기 중인 충전 요청을 확인하고 처리할 수 있습니다.
          </p>
        </div>
        
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* 대기 중인 요청 통계 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">대기 중인 요청</p>
              <p className="text-2xl font-bold">{stats.totalCount}건</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">총 대기 금액</p>
              <p className="text-2xl font-bold">
                {stats.totalAmount.toLocaleString()}원
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">평균 대기 시간</p>
              <p className="text-2xl font-bold">{stats.averageWaitTime}분</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* 입금 대기 목록 */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>요청 시간</TableHead>
                <TableHead>회원 정보</TableHead>
                <TableHead>충전 금액</TableHead>
                <TableHead>결제 방법</TableHead>
                <TableHead>참조 코드</TableHead>
                <TableHead>경과 시간</TableHead>
                <TableHead className="text-center">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                      데이터를 불러오는 중...
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <p className="text-muted-foreground">대기 중인 입금 확인 요청이 없습니다.</p>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="text-sm">
                      {formatDateTime(payment.requestedAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{payment.userName}</p>
                      <p className="text-sm text-muted-foreground">{payment.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-lg">
                      {payment.amount.toLocaleString()}원
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={payment.paymentMethod === 'KAKAO' ? 'default' : 'outline'}>
                      {payment.paymentMethod === 'KAKAO' ? '카카오페이' : '계좌이체'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {payment.referenceCode}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopyCode(payment.referenceCode)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getElapsedTime(payment.requestedAt)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setSelectedPayment(payment)
                          setDialogType('confirm')
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        승인
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedPayment(payment)
                          setDialogType('reject')
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        거절
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* 입금 확인 다이얼로그 */}
      <Dialog open={dialogType === 'confirm'} onOpenChange={(open) => !open && setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>입금 확인</DialogTitle>
            <DialogDescription>
              입금을 확인하고 포인트를 지급합니다.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">회원명</Label>
                  <p className="font-medium">{selectedPayment.userName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">충전 금액</Label>
                  <p className="font-medium text-lg">
                    {selectedPayment.amount.toLocaleString()}원
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">참조 코드</Label>
                  <p className="font-mono text-sm">{selectedPayment.referenceCode}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">결제 방법</Label>
                  <p>{selectedPayment.paymentMethod === 'KAKAO' ? '카카오페이' : '계좌이체'}</p>
                </div>
              </div>
              
              <div>
                <Label>메모 (선택사항)</Label>
                <Textarea
                  value={confirmMemo}
                  onChange={(e) => setConfirmMemo(e.target.value)}
                  placeholder="입금 확인 관련 메모를 입력하세요..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              취소
            </Button>
            <Button onClick={handleConfirmPayment} disabled={isProcessing}>
              {isProcessing ? '처리 중...' : '입금 확인'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 입금 거절 다이얼로그 */}
      <Dialog open={dialogType === 'reject'} onOpenChange={(open) => !open && setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>입금 거절</DialogTitle>
            <DialogDescription>
              입금 확인을 거절하고 사유를 입력합니다.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">회원명</Label>
                  <p className="font-medium">{selectedPayment.userName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">충전 금액</Label>
                  <p className="font-medium text-lg">
                    {selectedPayment.amount.toLocaleString()}원
                  </p>
                </div>
              </div>
              
              <div>
                <Label>거절 사유 <span className="text-destructive">*</span></Label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="거절 사유를 입력하세요..."
                  className="mt-1"
                  required
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              취소
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectPayment} 
              disabled={isProcessing || !rejectReason.trim()}
            >
              {isProcessing ? '처리 중...' : '거절 확인'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}