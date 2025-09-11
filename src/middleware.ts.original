import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 기본 response 생성
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // 쿠키 설정 시 response에 반영
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          // 쿠키 제거 시 response에 반영
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // 세션 새로고침 및 확인
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  // 세션이 있으면 새로고침 시도
  if (session) {
    await supabase.auth.refreshSession();
  }
  
  // 더 안전한 user 확인 (프로덕션에서 권장)
  let authenticatedUser = null;
  if (session && !sessionError) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!userError && user) {
      authenticatedUser = user;
    }
  }
  
  // 디버깅을 위한 로그 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware - Path:', request.nextUrl.pathname);
    console.log('Middleware - User:', !!authenticatedUser, authenticatedUser?.email);
  }

  // 보호된 경로 목록
  const protectedPaths = ['/dashboard', '/profile', '/tournaments', '/points', '/vouchers'];
  const adminPaths = ['/admin'];
  const authPaths = ['/login', '/register'];

  const path = request.nextUrl.pathname;

  // 인증이 필요한 경로 체크
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p));
  const isAdminPath = adminPaths.some(p => path.startsWith(p));
  const isAuthPath = authPaths.some(p => path.startsWith(p));

  // 로그인하지 않은 상태에서 보호된 경로 접근 시
  if (!authenticatedUser && (isProtectedPath || isAdminPath)) {
    console.log('Middleware - No user, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 로그인한 상태에서 인증 페이지 접근 시
  if (authenticatedUser && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 관리자 경로 접근 시 권한 체크
  if (isAdminPath && authenticatedUser) {
    // 간단하게 이메일로만 체크 (임시)
    const adminEmail = 'yangseonghwan119@gmail.com';
    
    if (authenticatedUser.email !== adminEmail) {
      console.log('Middleware - Not admin email:', authenticatedUser.email);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    console.log('Middleware - Admin access granted for:', authenticatedUser.email);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (auth callback route)
     * - api/* (API routes - they handle auth separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|api).*)',
  ],
};