import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'USER' | 'ADMIN';
      tier: 'GUEST' | 'REGULAR';
      status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
      points: number;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: 'USER' | 'ADMIN';
    tier: 'GUEST' | 'REGULAR';
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    points: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'USER' | 'ADMIN';
    tier: 'GUEST' | 'REGULAR';
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    points: number;
  }
}
