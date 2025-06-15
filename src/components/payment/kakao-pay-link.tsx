'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/lib/hooks/use-toast'
import { Copy, ExternalLink, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

// 카카오페이 송금 링크 컴포넌트의 Props 타입 정의
interface KakaoPayLinkProps {
  amount: number          // 충전 금액
  referenceCode: string   // 참조 코드 (입금 확인용)
  kakaoPayLink?: string   // 카카오페이 송금 링크
  bankAccount?: string    // 계좌번호
  accountHolder?: string  // 예금주명
}

// 포인트 충전을 위한 결제 안내 컴포넌트
// 카카오페이 송금 링크와 계좌이체 정보를 표시하고, 복사 기능 제공
export function KakaoPayLink({
  amount,
  referenceCode,
  kakaoPayLink = process.env.NEXT_PUBLIC_KAKAO_PAY_LINK,
  bankAccount = process.env.NEXT_PUBLIC_BANK_ACCOUNT,
  accountHolder = process.env.NEXT_PUBLIC_ACCOUNT_HOLDER,
}: KakaoPayLinkProps) {
  // 현재 복사된 필드를 추적하는 상태 (체크 아이콘 표시용)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // 금액을 한국 형식으로 포맷팅
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value)
  }

  // 클립보드에 텍스트 복사 기능
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      // 복사 성공 토스트 메시지
      toast({
        title: '복사 완료',
        description: `${field}이(가) 클립보드에 복사되었습니다.`,
      })
      // 2초 후 체크 아이콘 제거
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      // 복사 실패 토스트 메시지
      toast({
        title: '복사 실패',
        description: '클립보드 복사에 실패했습니다.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* 충전 금액 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>충전 금액</CardTitle>
          <CardDescription>아래 금액을 송금해주세요</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 충전 금액 표시 */}
          <div className="text-3xl font-bold">{formatAmount(amount)}원</div>
          {/* 참조 코드 - 입금 확인에 필수 */}
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline">참조코드</Badge>
            <code className="text-sm">{referenceCode}</code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(referenceCode, '참조코드')}
            >
              {copiedField === '참조코드' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 카카오페이 송금 */}
      {kakaoPayLink && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="relative w-6 h-6">
                <div className="absolute inset-0 bg-yellow-400 rounded" />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">K</span>
              </div>
              카카오페이 송금
            </CardTitle>
            <CardDescription>카카오페이로 간편하게 송금하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
              size="lg"
            >
              <a href={kakaoPayLink} target="_blank" rel="noopener noreferrer">
                카카오페이로 송금하기
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              송금 메시지에 참조코드를 입력해주세요
            </p>
          </CardContent>
        </Card>
      )}

      {/* 계좌이체 */}
      {bankAccount && (
        <Card>
          <CardHeader>
            <CardTitle>계좌이체</CardTitle>
            <CardDescription>아래 계좌로 직접 이체하실 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div>
                <p className="text-sm text-muted-foreground">예금주</p>
                <p className="font-medium">{accountHolder}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(accountHolder || '', '예금주')}
              >
                {copiedField === '예금주' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div>
                <p className="text-sm text-muted-foreground">계좌번호</p>
                <p className="font-medium">{bankAccount}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(bankAccount, '계좌번호')}
              >
                {copiedField === '계좌번호' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              * 입금자명에 참조코드를 포함해주세요
            </p>
          </CardContent>
        </Card>
      )}

      {/* 안내사항 */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader>
          <CardTitle className="text-base">송금 안내사항</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• 송금 후 5-10분 내에 자동으로 포인트가 충전됩니다</p>
          <p>• 참조코드를 반드시 입력해주세요</p>
          <p>• 문제가 있으시면 관리자에게 문의해주세요</p>
        </CardContent>
      </Card>
    </div>
  )
}
