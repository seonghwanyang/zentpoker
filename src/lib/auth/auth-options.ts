import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { Role, MemberGrade, UserStatus } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
      if (account?.provider === 'google') {
        try {
          // 사용자가 이미 존재하는지 확인
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // 관리자 이메일 확인
            const isAdmin = user.email === process.env.ADMIN_EMAIL;
            
            // 새 사용자 생성
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                role: isAdmin ? Role.ADMIN : Role.USER,
                grade: isAdmin ? MemberGrade.ADMIN : MemberGrade.GUEST,
                status: UserStatus.ACTIVE,
                points: 0,
              },
            });
          } else if (existingUser.email === process.env.ADMIN_EMAIL && existingUser.role !== Role.ADMIN) {
            // 기존 사용자가 관리자 이메일이면 관리자로 업데이트
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                role: Role.ADMIN,
                grade: MemberGrade.ADMIN,
              },
            });
          }
          
          return true;
        } catch (error) {
          console.error('Error during sign in:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token, user }) {
      if (session?.user) {
        // DB에서 사용자 정보 가져오기
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! },
          select: {
            id: true,
            role: true,
            grade: true,
            status: true,
            points: true,
            phone: true,
          },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
          session.user.memberGrade = dbUser.grade;
          session.user.isActive = dbUser.status === UserStatus.ACTIVE;
          session.user.points = dbUser.points;
          session.user.phone = dbUser.phone;
        }
      }
      
      return session;
    },
    async redirect({ url, baseUrl }) {
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
  debug: process.env.NODE_ENV === 'development',
};
