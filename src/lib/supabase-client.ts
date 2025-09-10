import { createBrowserClient } from '@supabase/ssr';

// Singleton pattern to ensure same client instance
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient;
  }

  // Only create client on browser
  if (typeof window === 'undefined') {
    // Return a mock during SSR
    return null as any;
  }

  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return undefined;
          const cookies = document.cookie.split('; ');
          const cookie = cookies.find(c => c.startsWith(`${name}=`));
          if (!cookie) return undefined;
          
          const value = cookie.split('=')[1];
          // Supabase 쿠키는 base64 디코딩 불필요
          return decodeURIComponent(value);
        },
        set(name: string, value: string, options?: any) {
          if (typeof document === 'undefined') return;
          let cookieStr = `${name}=${encodeURIComponent(value)}`;
          if (options?.maxAge) {
            cookieStr += `; max-age=${options.maxAge}`;
          }
          if (options?.path) {
            cookieStr += `; path=${options.path}`;
          }
          cookieStr += '; samesite=lax';
          document.cookie = cookieStr;
        },
        remove(name: string, options?: any) {
          if (typeof document === 'undefined') return;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${options?.path || '/'}`;
        },
      },
    }
  );

  return supabaseClient;
}