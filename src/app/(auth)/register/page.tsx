'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';
import Link from 'next/link';
import { useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    '안전한 포인트 관리 시스템',
    '실시간 거래 내역 확인',
    '편리한 바인권 구매',
    '토너먼트 참가 기능',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* 회원가입 카드 */}
      <Card className="w-full max-w-md relative z-10 glass shadow-2xl">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto mb-4">
            <h1 className="text-4xl font-bold gradient-text">ZentPoker</h1>
          </div>
          <CardTitle className="text-2xl">회원가입</CardTitle>
          <CardDescription>
            포커 동호회 관리의 새로운 시작
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 혜택 목록 */}
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            size="lg"
            variant="gradient"
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <FcGoogle className="mr-2 h-5 w-5" />
            )}
            Google로 시작하기
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="font-medium text-purple-600 hover:text-purple-700">
                로그인
              </Link>
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-700 font-medium mb-1">
                🎯 게스트로 시작
              </p>
              <p className="text-xs text-purple-600">
                가입 후 바로 서비스를 이용할 수 있습니다. 정회원 승급은 관리자 승인이 필요합니다.
              </p>
            </div>
          </div>

          <p className="text-xs text-center text-gray-500">
            회원가입하면 ZentPoker의{' '}
            <Link href="/terms" className="underline hover:text-purple-600">
              이용약관
            </Link>
            과{' '}
            <Link href="/privacy" className="underline hover:text-purple-600">
              개인정보처리방침
            </Link>
            에 동의하는 것으로 간주됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
