'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/supabase-auth'
import { LayoutWrapper } from '@/components/layout'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)
  const { user, loading, isAdmin, role } = useAuth()
  const router = useRouter()

  // 관리자 권한 확인
  useEffect(() => {
    console.log('Admin Layout - State:', {
      loading,
      user: user?.email,
      role,
      isAdmin,
      hasChecked
    })
    
    // 로딩 완료 후 한 번만 체크
    if (!loading && !hasChecked) {
      setHasChecked(true)
      
      if (!user) {
        console.log('No user - redirecting to login')
        router.push('/login')
        return
      }

      // 관리자 체크
      const adminEmails = ['yangseonghwan119@gmail.com', 'longlight93@gmail.com']
      const isAdminUser = role === 'ADMIN' || adminEmails.includes(user.email || '')
      
      if (isAdminUser) {
        console.log('Admin authorized:', user.email, 'role:', role)
        setIsAuthorized(true)
      } else {
        console.log('Not admin - email:', user.email, 'role:', role, '- redirecting to dashboard')
        router.push('/dashboard')
      }
    }
  }, [user, loading, role, router, isAdmin, hasChecked])

  // 로딩 중이거나 아직 체크하지 않은 경우
  if (loading || !hasChecked) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </LayoutWrapper>
    )
  }

  // 권한이 없는 경우
  if (!isAuthorized) {
    return null
  }

  // admin 페이지도 LayoutWrapper 사용
  return <LayoutWrapper>{children}</LayoutWrapper>
}
