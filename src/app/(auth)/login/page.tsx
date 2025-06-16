'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';
import Link from 'next/link';
import { useState } from 'react';
import { Loader2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const router = useRouter();

  // 개발 환경 여부 확인
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Google 로그인 처리
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setLoadingType('google');
      console.log('Google 로그인 시도...');
      
      // NextAuth Google OAuth 로그인 호출
      const result = await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: true 
      });
      console.log('Google 로그인 결과:', result);
    } catch (error) {
      console.error('Login error:', error);
      alert('Google 로그인 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  // 테스트 로그인 처리 (개발 환경)
  const handleTestLogin = async (testEmail: string) => {
    try {
      setIsLoading(true);
      setLoadingType(testEmail);
      console.log('테스트 로그인 시도:', testEmail);
      
      const result = await signIn('credentials', {
        email: testEmail,
        password: 'test',
        redirect: false,
      });

      console.log('로그인 결과:', result);

      if (result?.error) {
        alert('로그인 실패: ' + result.error);
      } else if (result?.ok) {
        // 성공 시 대시보드로 이동
        console.log('로그인 성공, 대시보드로 이동');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* 로그인 카드 */}
      <Card className="w-full max-w-md relative z-10 glass shadow-2xl">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto mb-4">
            <h1 className="text-4xl font-bold gradient-text">ZentPoker</h1>
          </div>
          <CardTitle className="text-2xl">로그인</CardTitle>
          <CardDescription>
            포커 동호회 관리 시스템
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 개발 환경에서만 테스트 로그인 표시 */}
          {isDevelopment && (
            <>
              <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-medium text-yellow-800">🧪 개발 환경 테스트 로그인</p>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleTestLogin('admin@test.com')}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                  >
                    {loadingType === 'admin@test.com' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <User className="mr-2 h-4 w-4" />
                    )}
                    관리자로 로그인 (admin@test.com)
                  </Button>
                  <Button
                    onClick={() => handleTestLogin('user@test.com')}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                  >
                    {loadingType === 'user@test.com' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <User className="mr-2 h-4 w-4" />
                    )}
                    정회원으로 로그인 (user@test.com)
                  </Button>
                  <Button
                    onClick={() => handleTestLogin('guest@test.com')}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                  >
                    {loadingType === 'guest@test.com' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <User className="mr-2 h-4 w-4" />
                    )}
                    게스트로 로그인 (guest@test.com)
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">또는</span>
                </div>
              </div>
            </>
          )}

          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            size="lg"
            variant="outline"
            className="w-full relative hover:bg-purple-50 transition-colors"
          >
            {loadingType === 'google' ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <FcGoogle className="mr-2 h-5 w-5" />
            )}
            Google로 로그인
          </Button>

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