'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Wallet,
  Ticket,
  Trophy,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const memberMenuItems: SidebarItem[] = [
  {
    title: '대시보드',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: '포인트',
    href: '/points',
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    title: '바인권',
    href: '/vouchers',
    icon: <Ticket className="h-5 w-5" />,
  },
  {
    title: '토너먼트',
    href: '/tournaments',
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    title: '프로필',
    href: '/profile',
    icon: <User className="h-5 w-5" />,
  },
];

export function MemberSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] glass border-r border-purple-200/20 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Collapse Toggle */}
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hover:bg-purple-100/50"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 pb-4">
          {memberMenuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-purple-100/50 hover:text-purple-600',
                  isCollapsed && 'justify-center'
                )}
                title={isCollapsed ? item.title : undefined}
              >
                {item.icon}
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        {!isCollapsed && (
          <div className="border-t border-purple-200/20 p-4">
            <div className="rounded-lg bg-purple-100/50 p-3">
              <p className="text-xs text-purple-700">
                <strong>도움이 필요하신가요?</strong>
              </p>
              <p className="text-xs text-purple-600 mt-1">
                관리자에게 문의하세요
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
