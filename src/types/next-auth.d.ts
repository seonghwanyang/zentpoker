import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { Role, MemberGrade, UserStatus } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      memberGrade: MemberGrade;
      isActive: boolean;
      points?: number;
      phone?: string | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: Role;
    memberGrade: MemberGrade;
    status: UserStatus;
    points: number;
    phone?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    memberGrade: MemberGrade;
    status: UserStatus;
    points: number;
    phone?: string | null;
  }
}
