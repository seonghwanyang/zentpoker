import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'USER' | 'ADMIN';
      memberGrade: 'GUEST' | 'REGULAR' | 'ADMIN';
      isActive: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: 'USER' | 'ADMIN';
    memberGrade: 'GUEST' | 'REGULAR' | 'ADMIN';
    isActive: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'USER' | 'ADMIN';
    memberGrade: 'GUEST' | 'REGULAR' | 'ADMIN';
    isActive: boolean;
  }
}
