import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Server-side Supabase client for App Router
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

// Get authenticated user from server-side
export async function getServerUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

// Get session from server-side
export async function getServerSession() {
  const supabase = await createServerSupabaseClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return null;
  }
  
  return session;
}

// Middleware helper for API routes
export async function withAuth(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const user = await getServerUser();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Add user to request
    (request as any).user = user;
    
    return handler(request, ...args);
  };
}

// Admin check helper
export async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { error: 'Unauthorized', status: 401 };
  }
  
  // DB에서 role 확인
  const { data: userData, error: dbError } = await supabase
    .from('User')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (dbError || !userData) {
    // DB에 유저가 없으면 이메일로 확인
    const adminEmails = ['yangseonghwan119@gmail.com', 'longlight93@gmail.com'];
    if (adminEmails.includes(user.email || '')) {
      // 관리자 데이터 생성
      await supabase.from('User').insert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        role: 'ADMIN',
        grade: 'ADMIN',
        status: 'ACTIVE',
        points: 0,
        image: user.user_metadata?.avatar_url
      });
      return { user, status: 200 };
    }
    return { error: 'Forbidden', status: 403 };
  }
  
  // role이 ADMIN이 아니면 접근 거부
  if (userData.role !== 'ADMIN') {
    return { error: 'Forbidden', status: 403 };
  }
  
  return { user, status: 200 };
}