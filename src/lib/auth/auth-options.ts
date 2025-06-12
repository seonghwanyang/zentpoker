import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.memberGrade = user.memberGrade;
        session.user.isActive = user.isActive;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // 첫 가입 시 기본값 설정
      if (!user.role) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: 'USER',
            memberGrade: 'GUEST',
            isActive: true,
          },
        });
      }
      return true;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
