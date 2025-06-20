'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { LayoutWrapper } from '@/components/layout'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()

  // 로딩 중일 때
  if (status === 'loading') {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </LayoutWrapper>
    )
  }

  // 로그인하지 않았거나 관리자가 아닌 경우
  if (!session || (session.user.role !== 'ADMIN' && session.user.memberGrade !== 'ADMIN')) {
    redirect('/dashboard')
  }

  // LayoutWrapper로 감싸서 헤더, 사이드바, 푸터를 포함
  return (
    <LayoutWrapper>
      {children}
    </LayoutWrapper>
  )
}
