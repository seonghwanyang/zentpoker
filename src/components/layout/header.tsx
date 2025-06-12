'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MemberBadge } from '@/components/members/member-badge';

export function Header() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="fixed top-0 z-50 w-full glass border-b border-purple-200/20">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold gradient-text">ZentPoker</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {session && (
              <>
                <Link href="/dashboard" className="text-sm font-medium hover:text-purple-600 transition-colors">
                  대시보드
                </Link>
                <Link href="/points" className="text-sm font-medium hover:text-purple-600 transition-colors">
                  포인트
                </Link>
                <Link href="/vouchers" className="text-sm font-medium hover:text-purple-600 transition-colors">
                  바인권
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin/dashboard" className="text-sm font-medium hover:text-purple-600 transition-colors">
                    관리자
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="animate-pulse">
                <div className="h-8 w-20 bg-purple-200 rounded"></div>
              </div>
            ) : session ? (
              <div className="flex items-center space-x-3">
                <MemberBadge grade={session.user.memberGrade} />
                <div className="hidden md:flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || undefined} alt={session.user.name || ''} />
                    <AvatarFallback>{session.user.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{session.user.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-purple-600 hover:text-purple-700"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link href="/register" className="hidden md:block">
                  <Button variant="gradient" size="sm">
                    회원가입
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={toggleMenu}
              aria-label="메뉴 토글"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-200/20">
            <nav className="flex flex-col space-y-4">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium hover:text-purple-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    대시보드
                  </Link>
                  <Link
                    href="/points"
                    className="text-sm font-medium hover:text-purple-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    포인트
                  </Link>
                  <Link
                    href="/vouchers"
                    className="text-sm font-medium hover:text-purple-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    바인권
                  </Link>
                  {session.user.role === 'ADMIN' && (
                    <Link
                      href="/admin/dashboard"
                      className="text-sm font-medium hover:text-purple-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      관리자
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="text-sm font-medium hover:text-purple-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    프로필
                  </Link>
                  <button
                    className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors text-left"
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut();
                    }}
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium hover:text-purple-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium hover:text-purple-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    회원가입
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

// signOut 함수 임시 구현 (NextAuth 설정 전)
function signOut() {
  // NextAuth 설정 후 실제 구현으로 변경 필요
  console.log('로그아웃');
}
