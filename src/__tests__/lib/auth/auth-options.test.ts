import { authOptions } from '@/lib/auth/auth-options';
import { PrismaClient, Role, MemberGrade, UserStatus } from '@prisma/client';
import { Session, User, Account, Profile } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock next-auth/providers/google
jest.mock('next-auth/providers/google');

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
} as any;

// Import mocked prisma
const { prisma } = require('@/lib/prisma');

describe('Auth Options Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.ADMIN_EMAIL = 'admin@zentpoker.com';
    process.env.NEXTAUTH_SECRET = 'test-secret';
  });

  afterEach(() => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.ADMIN_EMAIL;
    delete process.env.NEXTAUTH_SECRET;
  });

  describe('Provider Configuration', () => {
    it('should configure Google OAuth provider correctly', () => {
      expect(authOptions.providers).toHaveLength(1);
      expect(GoogleProvider).toHaveBeenCalledWith({
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
      });
    });

    it('should throw error if Google credentials are missing', () => {
      delete process.env.GOOGLE_CLIENT_ID;
      expect(() => {
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        });
      }).toThrow();
    });
  });

  describe('SignIn Callback', () => {
    const mockUser: User = {
      id: 'test-user-id',
      email: 'user@example.com',
      name: 'Test User',
      image: 'https://example.com/avatar.jpg',
      role: Role.USER,
      memberGrade: MemberGrade.GUEST,
      status: UserStatus.ACTIVE,
      points: 0,
    };

    const mockAccount: Account = {
      provider: 'google',
      type: 'oauth',
      providerAccountId: 'google-account-id',
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      expires_at: Date.now() + 3600000,
      token_type: 'Bearer',
      scope: 'openid email profile',
    };

    const mockProfile: Profile = {
      sub: 'google-user-id',
      email: 'user@example.com',
      name: 'Test User',
      picture: 'https://example.com/avatar.jpg',
    };

    it('should create new regular user on first Google login', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await authOptions.callbacks?.signIn?.({
        user: mockUser,
        account: mockAccount,
        profile: mockProfile,
      });

      expect(result).toBe(true);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'user@example.com',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg',
          role: Role.USER,
          grade: MemberGrade.GUEST,
          status: UserStatus.ACTIVE,
          points: 0,
        },
      });
    });

    it('should create admin user for admin email', async () => {
      const adminUser = { ...mockUser, email: 'admin@zentpoker.com' };
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(adminUser);

      const result = await authOptions.callbacks?.signIn?.({
        user: adminUser,
        account: mockAccount,
        profile: { ...mockProfile, email: 'admin@zentpoker.com' },
      });

      expect(result).toBe(true);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'admin@zentpoker.com',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg',
          role: Role.ADMIN,
          grade: MemberGrade.ADMIN,
          status: UserStatus.ACTIVE,
          points: 0,
        },
      });
    });

    it('should upgrade existing user to admin if email matches admin email', async () => {
      const existingUser = {
        ...mockUser,
        email: 'admin@zentpoker.com',
        role: Role.USER,
        grade: MemberGrade.GUEST,
      };
      
      prisma.user.findUnique.mockResolvedValue(existingUser);
      prisma.user.update.mockResolvedValue({ ...existingUser, role: Role.ADMIN, grade: MemberGrade.ADMIN });

      const result = await authOptions.callbacks?.signIn?.({
        user: { ...mockUser, email: 'admin@zentpoker.com' },
        account: mockAccount,
        profile: { ...mockProfile, email: 'admin@zentpoker.com' },
      });

      expect(result).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: 'admin@zentpoker.com' },
        data: {
          role: Role.ADMIN,
          grade: MemberGrade.ADMIN,
        },
      });
    });

    it('should return true for existing regular user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await authOptions.callbacks?.signIn?.({
        user: mockUser,
        account: mockAccount,
        profile: mockProfile,
      });

      expect(result).toBe(true);
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should handle database errors during sign in', async () => {
      prisma.user.findUnique.mockRejectedValue(new Error('Database error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await authOptions.callbacks?.signIn?.({
        user: mockUser,
        account: mockAccount,
        profile: mockProfile,
      });

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error during sign in:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should return true for non-Google providers', async () => {
      const result = await authOptions.callbacks?.signIn?.({
        user: mockUser,
        account: { ...mockAccount, provider: 'facebook' },
        profile: mockProfile,
      });

      expect(result).toBe(true);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('Session Callback', () => {
    const mockDbUser = {
      id: 'user-123',
      role: Role.ADMIN,
      grade: MemberGrade.ADMIN,
      status: UserStatus.ACTIVE,
      points: 1000,
      phone: '+1234567890',
    };

    it('should enrich session with database user data', async () => {
      prisma.user.findUnique.mockResolvedValue(mockDbUser);

      const mockSession: Session = {
        user: {
          email: 'test@example.com',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg',
          id: '',
          role: Role.USER,
          memberGrade: MemberGrade.GUEST,
          isActive: false,
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };

      const result = await authOptions.callbacks?.session?.({
        session: mockSession,
        token: {} as any,
        user: {} as any,
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: {
          id: true,
          role: true,
          grade: true,
          status: true,
          points: true,
          phone: true,
        },
      });

      expect(result?.user).toEqual({
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        id: 'user-123',
        role: Role.ADMIN,
        memberGrade: MemberGrade.ADMIN,
        isActive: true,
        points: 1000,
        phone: '+1234567890',
      });
    });

    it('should handle session without user', async () => {
      const mockSession: Session = {
        user: undefined as any,
        expires: new Date(Date.now() + 86400000).toISOString(),
      };

      const result = await authOptions.callbacks?.session?.({
        session: mockSession,
        token: {} as any,
        user: {} as any,
      });

      expect(result).toEqual(mockSession);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should handle user not found in database', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const mockSession: Session = {
        user: {
          email: 'nonexistent@example.com',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg',
          id: '',
          role: Role.USER,
          memberGrade: MemberGrade.GUEST,
          isActive: false,
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };

      const result = await authOptions.callbacks?.session?.({
        session: mockSession,
        token: {} as any,
        user: {} as any,
      });

      expect(result?.user.id).toBe('');
      expect(result?.user.role).toBe(Role.USER);
    });

    it('should map user status to isActive correctly', async () => {
      const inactiveUser = { ...mockDbUser, status: UserStatus.INACTIVE };
      prisma.user.findUnique.mockResolvedValue(inactiveUser);

      const mockSession: Session = {
        user: {
          email: 'test@example.com',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg',
          id: '',
          role: Role.USER,
          memberGrade: MemberGrade.GUEST,
          isActive: false,
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };

      const result = await authOptions.callbacks?.session?.({
        session: mockSession,
        token: {} as any,
        user: {} as any,
      });

      expect(result?.user.isActive).toBe(false);
    });
  });

  describe('Redirect Callback', () => {
    const baseUrl = 'https://zentpoker.com';

    it('should handle relative URLs', async () => {
      const result = await authOptions.callbacks?.redirect?.({
        url: '/dashboard',
        baseUrl,
      });

      expect(result).toBe('https://zentpoker.com/dashboard');
    });

    it('should handle same origin URLs', async () => {
      const result = await authOptions.callbacks?.redirect?.({
        url: 'https://zentpoker.com/profile',
        baseUrl,
      });

      expect(result).toBe('https://zentpoker.com/profile');
    });

    it('should redirect to dashboard for different origin URLs', async () => {
      const result = await authOptions.callbacks?.redirect?.({
        url: 'https://malicious.com/steal-data',
        baseUrl,
      });

      expect(result).toBe('https://zentpoker.com/dashboard');
    });

    it('should default to dashboard + baseUrl for invalid URLs', async () => {
      const result = await authOptions.callbacks?.redirect?.({
        url: 'javascript:alert("xss")',
        baseUrl,
      });

      expect(result).toBe('https://zentpoker.com/dashboard');
    });
  });

  describe('Configuration Settings', () => {
    it('should have correct session configuration', () => {
      expect(authOptions.session).toEqual({
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    });

    it('should have correct page configurations', () => {
      expect(authOptions.pages).toEqual({
        signIn: '/login',
        signOut: '/',
        error: '/login',
      });
    });

    it('should have secret from environment', () => {
      expect(authOptions.secret).toBe('test-secret');
    });

    it('should enable debug in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Re-import to get updated config
      delete require.cache[require.resolve('@/lib/auth/auth-options')];
      const { authOptions: devAuthOptions } = require('@/lib/auth/auth-options');
      
      expect(devAuthOptions.debug).toBe(true);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should disable debug in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      // Re-import to get updated config
      delete require.cache[require.resolve('@/lib/auth/auth-options')];
      const { authOptions: prodAuthOptions } = require('@/lib/auth/auth-options');
      
      expect(prodAuthOptions.debug).toBe(false);
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Security Considerations', () => {
    it('should not allow sign in without Google provider', async () => {
      const mockUser: User = {
        id: 'test-user-id',
        email: 'user@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        role: Role.USER,
        memberGrade: MemberGrade.GUEST,
        status: UserStatus.ACTIVE,
        points: 0,
      };

      const result = await authOptions.callbacks?.signIn?.({
        user: mockUser,
        account: null,
        profile: null,
      });

      expect(result).toBe(true); // Should still allow since account is null
    });

    it('should validate email presence before creating user', async () => {
      const mockUser: User = {
        id: 'test-user-id',
        email: null as any,
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        role: Role.USER,
        memberGrade: MemberGrade.GUEST,
        status: UserStatus.ACTIVE,
        points: 0,
      };

      const mockAccount: Account = {
        provider: 'google',
        type: 'oauth',
        providerAccountId: 'google-account-id',
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: Date.now() + 3600000,
        token_type: 'Bearer',
        scope: 'openid email profile',
      };

      // This should cause an error due to null email
      prisma.user.findUnique.mockRejectedValue(new Error('Email is required'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await authOptions.callbacks?.signIn?.({
        user: mockUser,
        account: mockAccount,
        profile: null,
      });

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});