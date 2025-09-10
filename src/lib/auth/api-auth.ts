import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// API 라우트용 인증 헬퍼
export async function getApiUser() {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // API routes에서도 쿠키 설정 필요
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Read-only context에서는 무시
            }
          },
          remove(name: string, options: any) {
            // API routes에서도 쿠키 삭제 필요
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // Read-only context에서는 무시
            }
          },
        },
      }
    );

    // getSession 먼저 시도 (더 빠름)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return null;
    }
    
    if (!session) {
      console.log('No session found');
      return null;
    }
    
    // getUser로 검증 (더 안전함)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('User validation failed:', userError);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting API user:', error);
    return null;
  }
}

// API 응답 헬퍼
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

export function forbiddenResponse() {
  return NextResponse.json(
    { error: 'Forbidden' },
    { status: 403 }
  );
}