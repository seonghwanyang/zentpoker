'use client'

import { Badge } from '@/components/ui/badge'
import { Shield, User, Users } from 'lucide-react'

interface MemberBadgeProps {
  grade: 'GUEST' | 'REGULAR' | 'ADMIN'
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function MemberBadge({ grade, showIcon = true, size = 'md' }: MemberBadgeProps) {
  const getGradeInfo = () => {
    switch (grade) {
      case 'ADMIN':
        return {
          label: '관리자',
          variant: 'admin' as const,
          icon: <Shield className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />,
        }
      case 'REGULAR':
        return {
          label: '정회원',
          variant: 'regular' as const,
          icon: <Users className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />,
        }
      case 'GUEST':
        return {
          label: '게스트',
          variant: 'guest' as const,
          icon: <User className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />,
        }
    }
  }

  const gradeInfo = getGradeInfo()
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  }

  return (
    <Badge 
      variant={gradeInfo.variant} 
      className={`inline-flex items-center gap-1 ${sizeClasses[size]}`}
    >
      {showIcon && gradeInfo.icon}
      {gradeInfo.label}
    </Badge>
  )
}
