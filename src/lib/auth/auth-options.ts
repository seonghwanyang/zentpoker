import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
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
    async signIn({ user, account, profile }) {
      console.log('SignIn Callback:', { user, account, profile });
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect Callback:', { url, baseUrl });
      // 로그인 후 대시보드로 리다이렉트
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      } else if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl + '/dashboard';
    },
    async session({ session, token, user }) {
      console.log('Session Callback:', { session, token, user });
      
      if (session?.user) {
        // PrismaAdapter 사용 시 user 객체가 전달됨
        if (user) {
          session.user.id = user.id;
          session.user.role = (user as any).role || 'USER';
          session.user.tier = (user as any).tier || 'GUEST';
          session.user.status = (user as any).status || 'ACTIVE';
          session.user.points = (user as any).points || 0;
        }
      }
      
      return session;
    },
    async jwt({ token, user, account }) {
      console.log('JWT Callback:', { token, user, account });
      
      if (account && user) {
        return {
          ...token,
          id: user.id,
          role: (user as any).role,
          tier: (user as any).tier,
          status: (user as any).status,
        };
      }
      
      return token;
    },
  },
  events: {
    async signIn(message) {
      console.log('SignIn Event:', message);
    },
    async createUser({ user }) {
      console.log('CreateUser Event:', user);
      // 신규 사용자 생성 시 기본값 설정
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: 'USER',
            tier: 'GUEST',
            status: 'ACTIVE',
            points: 0,
          },
        });
        console.log('User updated with defaults');
      } catch (error) {
        console.error('Error updating user:', error);
      }
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  session: {
    strategy: 'database', // PrismaAdapter 사용 시 database 전략 사용
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // 디버그 모드 활성화
};
