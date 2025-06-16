import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// Prisma 모델 타입 재사용
export type UserRole = 'USER' | 'ADMIN';
export type UserTier = 'GUEST' | 'REGULAR';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type MemberGrade = 'REGULAR' | 'GOLD' | 'VIP';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      tier: UserTier;
      status: UserStatus;
      points: number;
      memberGrade?: MemberGrade;
      phone?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: UserRole;
    tier: UserTier;
    status: UserStatus;
    points: number;
    memberGrade?: MemberGrade;
    phone?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    tier: UserTier;
    status: UserStatus;
    points: number;
    memberGrade?: MemberGrade;
    phone?: string;
  }
}
