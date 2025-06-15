'use client';

import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // 이미 로그인된 경우 대시보드로 리다이렉트
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // URL 파라미터에서 에러 메시지 확인
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      switch (urlError) {
        case 'OAuthSignin':
          setError('OAuth 로그인 시작 중 오류가 발생했습니다.');
          break;
        case 'OAuthCallback':
          setError('OAuth 콜백 처리 중 오류가 발생했습니다.');
          break;
        case 'OAuthCreateAccount':
          setError('OAuth 계정 생성 중 오류가 발생했습니다.');
          break;
        case 'EmailCreateAccount':
          setError('이메일 계정 생성 중 오류가 발생했습니다.');
          break;
        case 'Callback':
          setError('콜백 처리 중 오류가 발생했습니다.');
          break;
        case 'AccessDenied':
          setError('접근이 거부되었습니다.');
          break;
        default:
          setError('로그인 중 오류가 발생했습니다.');
      }
    }
  }, [searchParams]);

  // Google 로그인 처리
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // callbackUrl 파라미터 확인
      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
      
      // NextAuth Google OAuth 로그인 호출
      const result = await signIn('google', { 
        callbackUrl,
        redirect: true // 리다이렉트 활성화
      });
      
      console.log('SignIn result:', result);
    } catch (error) {
      console.error('Login error:', error);
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중이거나 인증 확인 중일 때
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4">
      {/* 배경 장식 - 애니메이션 물방울 효과 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* 로그인 카드 - 글래스모피즘 효과 적용 */}
      <Card className="w-full max-w-md relative z-10 glass shadow-2xl">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto mb-4">
            <h1 className="text-4xl font-bold gradient-text">ZentPoker</h1>
          </div>
          <CardTitle className="text-2xl">다시 오신 것을 환영합니다</CardTitle>
          <CardDescription>
            계속하려면 Google 계정으로 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 에러 메시지 표시 */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            size="lg"
            variant="outline"
            className="w-full relative hover:bg-purple-50 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <FcGoogle className="mr-2 h-5 w-5" />
            )}
            Google로 로그인
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">또는</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              아직 계정이 없으신가요?{' '}
              <Link href="/register" className="font-medium text-purple-600 hover:text-purple-700">
                회원가입
              </Link>
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-center text-gray-500">
              로그인하면 ZentPoker의{' '}
              <Link href="/terms" className="underline hover:text-purple-600">
                이용약관
              </Link>
              과{' '}
              <Link href="/privacy" className="underline hover:text-purple-600">
                개인정보처리방침
              </Link>
              에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
