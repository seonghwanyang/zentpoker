import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 보호된 라우트 정의
const protectedRoutes = {
  member: ['/dashboard', '/points', '/vouchers', '/profile', '/tournaments'],
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

  // 임시로 미들웨어 비활성화 (개발 중)
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
