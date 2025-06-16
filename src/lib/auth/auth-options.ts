import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
<<<<<<< HEAD
// import { PrismaAdapter } from '@next-auth/prisma-adapter';
// import { prisma } from '@/lib/prisma';
import { UserRole, UserTier, UserStatus, MemberGrade } from '@/types/next-auth';
// import { logAuth, logError } from '@/lib/utils/logger';

// Prisma 어댑터를 위한 타입 확장
interface ExtendedUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: UserRole;
  tier?: UserTier;
  status?: UserStatus;
  points?: number;
  memberGrade?: MemberGrade;
  phone?: string | null;
}

// 개발 환경용 임시 설정
const isDevelopment = process.env.NODE_ENV === 'development';

export const authOptions: NextAuthOptions = {
  // DB 없이 JWT 세션만 사용 (개발 테스트용)
  // adapter: PrismaAdapter(prisma),
  providers: [
    // 개발 환경에서는 Credentials Provider로 테스트
    ...(isDevelopment ? [
      {
        id: 'credentials',
        name: 'Test Login',
        type: 'credentials' as const,
        credentials: {
          email: { label: "Email", type: "email", placeholder: "test@example.com" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          // 테스트용 사용자
          if (credentials?.email === 'admin@test.com') {
            return {
              id: '1',
              email: 'admin@test.com',
              name: '관리자',
              role: 'ADMIN' as UserRole,
              tier: 'REGULAR' as UserTier,
              status: 'ACTIVE' as UserStatus,
              points: 1000000,
            };
          }
          if (credentials?.email === 'user@test.com') {
            return {
              id: '2',
              email: 'user@test.com',
              name: '일반회원',
              role: 'USER' as UserRole,
              tier: 'REGULAR' as UserTier,
              status: 'ACTIVE' as UserStatus,
              points: 50000,
            };
          }
          if (credentials?.email === 'guest@test.com') {
            return {
              id: '3',
              email: 'guest@test.com',
              name: '게스트',
              role: 'USER' as UserRole,
              tier: 'GUEST' as UserTier,
              status: 'ACTIVE' as UserStatus,
              points: 10000,
            };
          }
          return null;
        }
      }
    ] : []),
    // Google Provider는 실제 클라이언트 ID가 있을 때만 활성화
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && 
        process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id.apps.googleusercontent.com' ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
      })
    ] : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('signIn attempt', { 
        userId: user.id, 
        provider: account?.provider,
        email: user.email
      });
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('redirect', { url: url.startsWith(baseUrl) ? 'internal' : 'external' });
      // 로그인 후 대시보드로 리다이렉트
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      } else if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl + '/dashboard';
    },
    async session({ session, token, user }) {
      if (session?.user) {
        // JWT 모드에서는 token 사용
        if (token) {
          session.user.id = token.id as string;
          session.user.role = token.role as UserRole || 'USER';
          session.user.tier = token.tier as UserTier || 'GUEST';
          session.user.status = token.status as UserStatus || 'ACTIVE';
          session.user.points = token.points as number || 0;
          session.user.memberGrade = token.tier === 'GUEST' ? 'GUEST' : 'REGULAR';
          session.user.phone = token.phone as string | undefined;
        }
      }
      
      return session;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        const extendedUser = user as any;
        return {
          ...token,
          id: extendedUser.id,
          role: extendedUser.role || 'USER',
          tier: extendedUser.tier || 'GUEST',
          status: extendedUser.status || 'ACTIVE',
          points: extendedUser.points || 0,
          memberGrade: extendedUser.tier === 'GUEST' ? 'GUEST' : 'REGULAR',
          phone: extendedUser.phone,
        };
      }
      
      return token;
    },
=======

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
        // @ts-ignore
        session.user.role = token.role || 'USER';
        // @ts-ignore
        session.user.memberGrade = token.memberGrade || 'GUEST';
        // @ts-ignore
        session.user.isActive = token.isActive !== false;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = 'USER';
        token.memberGrade = 'GUEST';
        token.isActive = true;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      console.log('SignIn callback:', { user, account, profile });
      // 여기서 필요하면 데이터베이스에 사용자 정보 저장
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', { url, baseUrl });
      
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl + '/dashboard';
    }
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  session: {
<<<<<<< HEAD
    strategy: 'jwt', // DB 없이 JWT 사용
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-key',
  debug: isDevelopment, // 개발 환경에서만 디버그
};
=======
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // 디버그 모드 활성화
};
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
