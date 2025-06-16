import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

<<<<<<< HEAD
// Prisma 모델 타입 재사용
export type UserRole = 'USER' | 'ADMIN';
export type UserTier = 'GUEST' | 'REGULAR';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type MemberGrade = 'REGULAR' | 'GOLD' | 'VIP';

=======
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
<<<<<<< HEAD
      role: UserRole;
      tier: UserTier;
      status: UserStatus;
      points: number;
      memberGrade?: MemberGrade;
      phone?: string;
=======
      role: 'USER' | 'ADMIN';
      memberGrade: 'GUEST' | 'REGULAR' | 'ADMIN';
      isActive: boolean;
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
<<<<<<< HEAD
    role: UserRole;
    tier: UserTier;
    status: UserStatus;
    points: number;
    memberGrade?: MemberGrade;
    phone?: string;
=======
    role: 'USER' | 'ADMIN';
    memberGrade: 'GUEST' | 'REGULAR' | 'ADMIN';
    isActive: boolean;
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
<<<<<<< HEAD
    role: UserRole;
    tier: UserTier;
    status: UserStatus;
    points: number;
    memberGrade?: MemberGrade;
    phone?: string;
=======
    role: 'USER' | 'ADMIN';
    memberGrade: 'GUEST' | 'REGULAR' | 'ADMIN';
    isActive: boolean;
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
  }
}
