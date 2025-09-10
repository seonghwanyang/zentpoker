'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/supabase-auth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Ticket,
  Trophy,
  BarChart3,
  Settings,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const adminMenuItems: SidebarItem[] = [
  {
    title: '대시보드',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: '회원 관리',
    href: '/admin/members',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: '입금 확인',
    href: '/admin/payments/confirm',
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    title: '바인권 관리',
    href: '/admin/vouchers',
    icon: <Ticket className="h-5 w-5" />,
  },
  {
    title: '토너먼트',
    href: '/admin/tournaments',
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    title: '리포트',
    href: '/admin/reports',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: '설정',
    href: '/admin/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
  };

  // 대기 중인 입금 건수 (실제로는 API에서 가져와야 함)
  const pendingDeposits = 0;

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 glass border-r border-purple-200/20">
      <div className="flex h-full flex-col">
        {/* Admin Badge */}
        <div className="border-b border-purple-200/20 bg-purple-600/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">관리자 모드</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {adminMenuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all relative',
                  isActive
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-purple-100/50 hover:text-purple-600'
                )}
              >
                {item.icon}
                <span>{item.title}</span>
                {item.href === '/admin/payments/confirm' && pendingDeposits > 0 && (
                  <Badge className="ml-auto bg-red-500 text-white">
                    {pendingDeposits}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-purple-200/20 p-4 space-y-3">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              <Users className="h-4 w-4 mr-2" />
              일반 모드로 전환
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </div>
    </aside>
  );
}