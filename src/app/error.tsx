'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 에러 로깅 서비스에 에러 전송
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* 에러 아이콘 */}
        <div className="relative">
          <div className="glass p-8 rounded-xl inline-flex">
            <AlertTriangle className="h-24 w-24 text-red-500" />
          </div>
        </div>

        {/* 에러 메시지 */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">문제가 발생했습니다</h1>
          <p className="text-muted-foreground text-lg">
            예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
        </div>

        {/* 에러 상세 (개발 환경에서만 표시) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-muted/50 rounded-lg p-4 text-left">
            <p className="text-sm font-mono text-muted-foreground">
              {error.message || 'Unknown error'}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button onClick={reset} variant="gradient" size="lg">
            <RefreshCw className="mr-2 h-5 w-5" />
            다시 시도
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              홈으로 이동
            </Link>
          </Button>
        </div>

        {/* 도움말 */}
        <div className="pt-8 space-y-2">
          <p className="text-sm text-muted-foreground">
            문제가 계속된다면
          </p>
          <p className="text-sm">
            <Link href="/support" className="text-purple-600 hover:underline">
              고객센터
            </Link>
            로 문의해주세요.
          </p>
        </div>
      </div>

      {/* 배경 장식 */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-300 rounded-full opacity-20 blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300 rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000" />
      </div>
    </div>
  )
}
