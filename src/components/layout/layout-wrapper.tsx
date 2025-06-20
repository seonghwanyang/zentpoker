'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';
import { MemberSidebar } from './member-sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
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
        
        <div className="flex-1 flex flex-col">
          <main className={cn(
            "flex-1 p-6 transition-all duration-300",
            shouldShowSidebar && "lg:ml-64"
          )}>
            <div className="container mx-auto max-w-7xl">
              {children}
            </div>
          </main>
          
          {showFooter && (
            <div className={cn(
              "transition-all duration-300",
              shouldShowSidebar && "lg:pl-0" // Footer는 자체적으로 ml-64를 갖고 있음
            )}>
              <Footer />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
