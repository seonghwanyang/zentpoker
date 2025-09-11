import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export function createRouteHandlerClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Route Handler에서는 쿠키 설정 가능
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // 쿠키 제거
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}