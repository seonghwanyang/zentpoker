'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';
import { MemberSidebar } from './member-sidebar';
import { AdminSidebar } from './admin-sidebar';
import { cn } from '@/lib/utils';

interface LayoutWrapperProps {
  children: ReactNode;
  showSidebar?: boolean;
  showFooter?: boolean;
}

export function LayoutWrapper({
  children,
  showSidebar = true,
  showFooter = true,
}: LayoutWrapperProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  // 인증 페이지에서는 사이드바 숨김
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAdminPage = pathname.startsWith('/admin');
  const shouldShowSidebar = showSidebar && !isAuthPage && session;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <Header />
      
      <div className="flex flex-1 pt-16">
        {shouldShowSidebar && (
          isAdminPage ? <AdminSidebar /> : <MemberSidebar />
        )}
        
        <main
          className={cn(
            'flex-1 p-6',
            shouldShowSidebar ? 'md:ml-64' : '',
            'transition-all duration-300'
          )}
        >
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      
      {showFooter && <Footer />}
    </div>
  );
}
