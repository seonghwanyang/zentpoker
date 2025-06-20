'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  DollarSign,
  CreditCard,
  Trophy,
  FileText,
  Settings,
} from 'lucide-react'

const sidebarItems = [
  {
    title: '대시보드',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '회원 관리',
    href: '/admin/members',
    icon: Users,
  },
  {
    title: '입금 확인',
    href: '/admin/payments/confirm',
    icon: DollarSign,
  },
  {
    title: '바인권 관리',
    href: '/admin/vouchers',
    icon: CreditCard,
  },
  {
    title: '토너먼트',
    href: '/admin/tournaments',
    icon: Trophy,
  },
  {
    title: '리포트',
    href: '/admin/reports',
    icon: FileText,
  },
  {
    title: '설정',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-900 border-r shadow-sm">
      <div className="flex h-full flex-col">
        {/* Admin Notice */}
        <div className="border-b bg-purple-50 dark:bg-purple-950/20 p-4">
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
            관리자 모드
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
