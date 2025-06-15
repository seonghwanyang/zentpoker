import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* 404 숫자 */}
        <div className="relative">
          <h1 className="text-[150px] md:text-[200px] font-bold text-purple-600/20 leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glass p-8 rounded-xl">
              <p className="text-2xl md:text-3xl font-bold gradient-text">
                페이지를 찾을 수 없습니다
              </p>
            </div>
          </div>
        </div>

        {/* 설명 */}
        <p className="text-muted-foreground text-lg">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild variant="gradient" size="lg">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              홈으로 이동
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
            계속해서 문제가 발생한다면
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
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full opacity-20 blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000" />
      </div>
    </div>
  )
}
