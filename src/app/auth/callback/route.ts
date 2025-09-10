import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  console.log('Auth callback received:', { 
    code: code ? 'present' : 'missing', 
    error, 
    error_description,
    url: request.url 
  });

  // OAuth 에러가 있는 경우
  if (error) {
    console.error('OAuth error:', error, error_description);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${error}`);
  }

  if (code) {
    const cookieStore = await cookies();
    
    // response 객체 미리 생성
    const response = NextResponse.redirect(
      new URL('/dashboard', request.url)
    );
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // 쿠키를 request와 response 모두에 설정
            cookieStore.set({ name, value, ...options });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    try {
      console.log('Attempting to exchange code for session...');
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Exchange code error:', exchangeError);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=exchange_failed`);
      }

      console.log('Exchange result:', { 
        hasSession: !!data?.session,
        hasUser: !!data?.user,
        email: data?.session?.user?.email 
      });

      if (data?.session) {
        console.log('Session created successfully for:', data.session.user.email);
        
        // 세션 확인
        const { data: { session: verifySession } } = await supabase.auth.getSession();
        console.log('Verified session:', !!verifySession, verifySession?.user?.email);
        
        // 사용자 데이터 확인 및 생성
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('*')
          .eq('email', data.session.user.email)
          .single();
        
        if (!userData && !userError) {
          // 새 사용자 생성
          const isAdmin = data.session.user.email === 'yangseonghwan119@gmail.com';
          const { error: insertError } = await supabase.from('User').insert({
            id: data.session.user.id,
            email: data.session.user.email,
            name: data.session.user.user_metadata?.full_name || data.session.user.email,
            role: isAdmin ? 'ADMIN' : 'USER',
            grade: isAdmin ? 'ADMIN' : 'GUEST',
            status: 'ACTIVE',
            points: 0,
            image: data.session.user.user_metadata?.avatar_url
          });
          
          if (insertError) {
            console.error('Failed to create user:', insertError);
          } else {
            console.log('User created successfully');
          }
        }
        
        // response에 이미 쿠키가 설정되어 있음
        console.log('Redirecting to dashboard with session');
        return response;
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=unexpected`);
    }
  }

  // code가 없으면 로그인 페이지로
  console.log('No code provided, redirecting to login');
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}