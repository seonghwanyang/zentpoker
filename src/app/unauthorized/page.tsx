import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, Home, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* 권한 없음 아이콘 */}
        <div className="relative">
          <div className="glass p-8 rounded-xl inline-flex">
            <Shield className="h-24 w-24 text-orange-500" />
          </div>
        </div>

        {/* 메시지 */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">접근 권한이 없습니다</h1>
          <p className="text-muted-foreground text-lg">
            이 페이지에 접근할 수 있는 권한이 없습니다.
          </p>
          <p className="text-muted-foreground">
            관리자 권한이 필요한 페이지입니다.
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild variant="gradient" size="lg">
            <Link href="/dashboard">
              <Home className="mr-2 h-5 w-5" />
              대시보드로 이동
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="javascript:history.back()">
              <ArrowLeft className="mr-2 h-5 w-5" />
              이전 페이지
            </Link>
          </Button>
        </div>

        {/* 도움말 */}
        <div className="pt-8 space-y-2">
          <p className="text-sm text-muted-foreground">
            권한이 필요하다고 생각되시면
          </p>
          <p className="text-sm">
            <Link href="/support" className="text-purple-600 hover:underline">
              관리자에게 문의
            </Link>
            해주세요.
          </p>
        </div>
      </div>

      {/* 배경 장식 */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-300 rounded-full opacity-20 blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000" />
      </div>
    </div>
  )
}
