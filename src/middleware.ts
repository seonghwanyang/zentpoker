import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// 보호된 라우트 정의
const protectedRoutes = {
  member: ['/dashboard', '/points', '/vouchers', '/profile'],
  admin: ['/admin'],
  auth: ['/login', '/register'],
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // 정적 파일이나 API 라우트는 미들웨어에서 제외
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api/auth') ||
    path.includes('.') // 파일 확장자가 있는 경우
  ) {
    return NextResponse.next()
  }

  // 토큰 가져오기 - secret 명시적으로 전달
  let token = null;
  try {
    token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET || 'development-secret'
    });
  } catch (error) {
    console.error('Token error:', error);
  }

  // 로그인 여부 확인
  const isAuthenticated = !!token
  
  // 디버깅을 위한 로그 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log('Path:', path)
    console.log('Token:', token)
    console.log('Is Authenticated:', isAuthenticated)
  }

  // 인증 페이지 접근 제어 (로그인한 사용자는 접근 불가)
  if (protectedRoutes.auth.some(route => path.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // 회원 페이지 접근 제어
  if (protectedRoutes.member.some(route => path.startsWith(route))) {
    if (!isAuthenticated) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(redirectUrl)
    }

    // 토큰에서 사용자 정보 가져오기
    const userStatus = token.status as string | undefined

    // 비활성 계정 차단
    if (userStatus === 'INACTIVE') {
      return NextResponse.redirect(new URL('/account-suspended', request.url))
    }

    return NextResponse.next()
  }

  // 관리자 페이지 접근 제어
  if (protectedRoutes.admin.some(route => path.startsWith(route))) {
    if (!isAuthenticated) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(redirectUrl)
    }

    // 관리자 권한 확인
    const userRole = token.role as string | undefined
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    return NextResponse.next()
  }

  // API 라우트 보호
  if (path.startsWith('/api')) {
    // 공개 API는 통과
    const publicAPIs = ['/api/health', '/api/status']
    if (publicAPIs.some(api => path.startsWith(api))) {
      return NextResponse.next()
    }

    // 인증 확인
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 관리자 API 권한 확인
    const userRole = token.role as string | undefined
    const userStatus = token.status as string | undefined
    
    if (path.startsWith('/api/admin') && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // 비활성 계정 API 차단
    if (userStatus === 'INACTIVE') {
      return NextResponse.json(
        { error: 'Account suspended' },
        { status: 403 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}