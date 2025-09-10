import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Supabase 클라이언트 생성
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Supabase 연결 테스트
    const { data: healthCheck } = await supabase.from('User').select('count').limit(1);
    
    // Google OAuth URL 생성 테스트
    const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3001/auth/callback',
        skipBrowserRedirect: true,
      },
    });

    return NextResponse.json({
      status: 'success',
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        connected: healthCheck ? true : false,
      },
      oauth: {
        provider: 'google',
        url: oauthData?.url,
        error: oauthError?.message,
      },
      message: 'If oauth.url exists, Google OAuth is properly configured in Supabase',
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
    }, { status: 500 });
  }
}