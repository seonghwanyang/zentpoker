/**
 * Supabase 클라이언트 통합 모듈
 * 모든 Supabase 클라이언트 생성을 이곳에서 관리
 */

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * 브라우저 클라이언트 (Client Components용)
 * 싱글톤 패턴으로 하나의 인스턴스만 생성
 */
let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null;

export function createBrowserClient() {
  if (browserClient) return browserClient;
  
  if (typeof window === 'undefined') {
    throw new Error('createBrowserClient must be called on the client side');
  }

  browserClient = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        const allCookies = document.cookie.split('; ');
        const cookie = allCookies.find(c => c.startsWith(`${name}=`));
        if (!cookie) return undefined;
        
        const value = cookie.split('=')[1];
        
        try {
          return decodeURIComponent(value);
        } catch {
          return value;
        }
      },
      set(name: string, value: string, options?: any) {
        const cookieOptions = [`${name}=${encodeURIComponent(value)}`];
        
        if (options?.maxAge) cookieOptions.push(`max-age=${options.maxAge}`);
        if (options?.path) cookieOptions.push(`path=${options.path}`);
        cookieOptions.push('samesite=lax');
        
        document.cookie = cookieOptions.join('; ');
      },
      remove(name: string, options?: any) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${options?.path || '/'}`;
      },
    },
  });

  return browserClient;
}

/**
 * 서버 클라이언트 (Server Components, API Routes, Middleware용)
 */
export async function createServerComponentClient() {
  const cookieStore = await cookies();
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        const cookie = cookieStore.get(name);
        return cookie?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Server Components는 읽기 전용이므로 무시
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Server Components는 읽기 전용이므로 무시
        }
      },
    },
  });
}

/**
 * API Route용 서버 클라이언트
 */
export async function createApiClient() {
  return createServerComponentClient();
}

/**
 * Middleware용 서버 클라이언트
 */
export function createMiddlewareClient(request: Request) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.headers.get('cookie')?.match(new RegExp(`${name}=([^;]+)`))?.[1];
      },
      set() {
        // Middleware에서는 Response 객체를 통해 설정
      },
      remove() {
        // Middleware에서는 Response 객체를 통해 제거
      },
    },
  });
}