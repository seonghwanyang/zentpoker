import { createRouteHandlerClient } from '@/lib/supabase/route-handler'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // OAuth 에러 처리
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    )
  }

  if (code) {
    try {
      const supabase = createRouteHandlerClient()
      const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (sessionError) {
        console.error('Session exchange error:', sessionError)
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent(sessionError.message)}`
        )
      }

      console.log('Session created successfully:', data.session?.user?.email)
      
      // 세션이 확실히 설정되었는지 확인
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('Session not found after exchange')
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent('Session creation failed')}`
        )
      }
      
      // 성공적으로 세션을 생성했으면 대시보드로 리다이렉트
      const response = NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      return response
    } catch (err) {
      console.error('Unexpected error during session exchange:', err)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent('Failed to create session')}`
      )
    }
  }

  // code가 없으면 홈으로
  return NextResponse.redirect(`${requestUrl.origin}/`)
}