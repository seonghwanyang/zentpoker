import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

// Google Fonts에서 Inter 폰트 불러오기
const inter = Inter({ subsets: ['latin'] })

// 메타데이터 설정 - SEO와 소셜 미디어 공유를 위한 정보
export const metadata: Metadata = {
  title: 'Zentpoker - 포인트 & 바인권 관리 시스템',
  description: '홀덤 동호회를 위한 스마트한 포인트 관리 플랫폼',
  keywords: '홀덤, 포커, 동호회, 포인트, 바인권, 토너먼트',
  authors: [{ name: 'Zentpoker' }],
  openGraph: {
    title: 'Zentpoker - 포인트 & 바인권 관리 시스템',
    description: '홀덤 동호회를 위한 스마트한 포인트 관리 플랫폼',
    type: 'website',
    locale: 'ko_KR',
  },
}

// 루트 레이아웃 컴포넌트
// 모든 페이지에 공통으로 적용되는 최상위 레이아웃
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
        {/* 토스트 메시지를 위한 컴포넌트 */}
        <Toaster />
      </body>
    </html>
  )
}
