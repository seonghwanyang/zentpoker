'use client';

import { useAuth } from '@/lib/auth/supabase-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function AuthWrapper({ 
  children, 
  requireAuth = false,
  requireAdmin = false,
  redirectTo = '/login'
}: AuthWrapperProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 로딩 중이면 아무것도 하지 않음
    if (loading) return;

    // 인증이 필요한데 로그인하지 않은 경우
    if (requireAuth && !user) {
      console.log('AuthWrapper: No user, redirecting to', redirectTo);
      router.push(redirectTo);
      return;
    }

    // 관리자 권한이 필요한데 관리자가 아닌 경우
    if (requireAdmin && !isAdmin) {
      console.log('AuthWrapper: Not admin, redirecting to /dashboard');
      router.push('/dashboard');
      return;
    }
  }, [user, loading, isAdmin, requireAuth, requireAdmin, redirectTo, router]);

  // 로딩 중
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // 인증 체크 통과
  return <>{children}</>;
}