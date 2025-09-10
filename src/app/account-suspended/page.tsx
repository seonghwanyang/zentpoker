import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserX, Mail } from 'lucide-react'

export default function AccountSuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* 계정 정지 아이콘 */}
        <div className="relative">
          <div className="glass p-8 rounded-xl inline-flex">
            <UserX className="h-24 w-24 text-red-500" />
          </div>
        </div>

        {/* 메시지 */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">계정이 정지되었습니다</h1>
          <p className="text-muted-foreground text-lg">
            귀하의 계정이 일시적으로 정지되었습니다.
          </p>
          <p className="text-muted-foreground">
            자세한 사항은 관리자에게 문의해주세요.
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild variant="gradient" size="lg">
            <a href="mailto:admin@zentpoker.com">
              <Mail className="mr-2 h-5 w-5" />
              관리자에게 문의
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/logout">
              로그아웃
            </Link>
          </Button>
        </div>

        {/* 정지 사유 안내 */}
        <div className="pt-8 p-6 bg-muted/50 rounded-lg text-left space-y-3">
          <h3 className="font-semibold">계정 정지 사유</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• 이용약관 위반</li>
            <li>• 부정행위 감지</li>
            <li>• 관리자의 판단에 의한 정지</li>
          </ul>
          <p className="text-sm text-muted-foreground pt-2">
            정지 해제를 원하시면 위 문의하기 버튼을 통해 관리자에게 연락해주세요.
          </p>
        </div>
      </div>

      {/* 배경 장식 */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-300 rounded-full opacity-20 blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300 rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000" />
      </div>
    </div>
  )
}
