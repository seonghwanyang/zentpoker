import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client for browser with custom cookie handling
 * that prevents the base64 parsing error
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return undefined;
        
        const allCookies = document.cookie.split('; ');
        for (const cookie of allCookies) {
          const [cookieName, cookieValue] = cookie.split('=');
          if (cookieName === name) {
            // Return the decoded value
            try {
              return decodeURIComponent(cookieValue);
            } catch {
              return cookieValue;
            }
          }
        }
        return undefined;
      },
      set(name: string, value: string, options?: any) {
        if (typeof document === 'undefined') return;
        
        const cookieOptions = [];
        cookieOptions.push(`${name}=${encodeURIComponent(value)}`);
        
        if (options?.maxAge) {
          cookieOptions.push(`max-age=${options.maxAge}`);
        }
        if (options?.expires) {
          cookieOptions.push(`expires=${options.expires.toUTCString()}`);
        }
        if (options?.path) {
          cookieOptions.push(`path=${options.path}`);
        }
        if (options?.domain) {
          cookieOptions.push(`domain=${options.domain}`);
        }
        if (options?.secure) {
          cookieOptions.push('secure');
        }
        if (options?.sameSite) {
          cookieOptions.push(`samesite=${options.sameSite}`);
        } else {
          cookieOptions.push('samesite=lax');
        }
        
        document.cookie = cookieOptions.join('; ');
      },
      remove(name: string, options?: any) {
        if (typeof document === 'undefined') return;
        
        const cookieOptions = [];
        cookieOptions.push(`${name}=`);
        cookieOptions.push('expires=Thu, 01 Jan 1970 00:00:00 UTC');
        
        if (options?.path) {
          cookieOptions.push(`path=${options.path}`);
        } else {
          cookieOptions.push('path=/');
        }
        
        if (options?.domain) {
          cookieOptions.push(`domain=${options.domain}`);
        }
        
        document.cookie = cookieOptions.join('; ');
      },
    },
  });
}