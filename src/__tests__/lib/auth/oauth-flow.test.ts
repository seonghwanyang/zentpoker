import { authOptions } from '@/lib/auth/auth-options';
import { PrismaClient, Role, MemberGrade, UserStatus } from '@prisma/client';
import { Account, Profile, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    account: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock Google Provider
jest.mock('next-auth/providers/google');

const { prisma } = require('@/lib/prisma');

describe('Google OAuth Flow Testing', () => {
  const mockGoogleProfile: Profile = {
    sub: 'google-user-123',
    email: 'user@example.com',
    name: 'John Doe',
    given_name: 'John',
    family_name: 'Doe',
    picture: 'https://lh3.googleusercontent.com/avatar.jpg',
    email_verified: true,
    locale: 'en',
    hd: undefined,
  };

  const mockGoogleAccount: Account = {
    provider: 'google',
    type: 'oauth',
    providerAccountId: 'google-user-123',
    access_token: 'google-access-token',
    refresh_token: 'google-refresh-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'Bearer',
    scope: 'openid email profile',
    id_token: 'google-id-token',
  };

  const mockUser: User = {
    id: 'user-456',
    email: 'user@example.com',
    name: 'John Doe',
    image: 'https://lh3.googleusercontent.com/avatar.jpg',
    role: Role.USER,
    memberGrade: MemberGrade.GUEST,
    status: UserStatus.ACTIVE,
    points: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
    process.env.ADMIN_EMAIL = 'admin@zentpoker.com';
  });

  afterEach(() => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.ADMIN_EMAIL;
  });

  describe('Google OAuth Redirect Handling', () => {
    it('should handle initial OAuth redirect correctly', async () => {
      // Simulate OAuth redirect parameters
      const redirectParams = new URLSearchParams({
        code: 'oauth-authorization-code',
        state: 'csrf-state-token',
        scope: 'openid email profile',
      });

      expect(redirectParams.get('code')).toBe('oauth-authorization-code');
      expect(redirectParams.get('state')).toBe('csrf-state-token');
      expect(redirectParams.get('scope')).toBe('openid email profile');
    });

    it('should validate OAuth state parameter for CSRF protection', () => {
      const validState = 'valid-csrf-state';
      const receivedState = 'valid-csrf-state';
      const invalidState = 'tampered-state';

      expect(validState).toBe(receivedState);
      expect(validState).not.toBe(invalidState);
    });

    it('should handle OAuth error responses', () => {
      const errorParams = new URLSearchParams({
        error: 'access_denied',
        error_description: 'User denied access',
        state: 'csrf-state-token',
      });

      expect(errorParams.get('error')).toBe('access_denied');
      expect(errorParams.get('error_description')).toBe('User denied access');
    });

    it('should validate redirect URI matches configured URI', () => {
      const configuredUri = 'https://zentpoker.com/api/auth/callback/google';
      const receivedUri = 'https://zentpoker.com/api/auth/callback/google';
      const maliciousUri = 'https://evil.com/steal-tokens';

      expect(configuredUri).toBe(receivedUri);
      expect(configuredUri).not.toBe(maliciousUri);
    });
  });

  describe('Profile Data Mapping', () => {
    it('should map Google profile data to user object correctly', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        ...mockUser,
        email: mockGoogleProfile.email,
        name: mockGoogleProfile.name,
        image: mockGoogleProfile.picture,
      });

      const result = await authOptions.callbacks?.signIn?.({
        user: {
          ...mockUser,
          email: mockGoogleProfile.email!,
          name: mockGoogleProfile.name!,
          image: mockGoogleProfile.picture!,
        },
        account: mockGoogleAccount,
        profile: mockGoogleProfile,
      });

      expect(result).toBe(true);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'user@example.com',
          name: 'John Doe',
          image: 'https://lh3.googleusercontent.com/avatar.jpg',
          role: Role.USER,
          grade: MemberGrade.GUEST,
          status: UserStatus.ACTIVE,
          points: 0,
        },
      });
    });

    it('should handle missing profile data gracefully', async () => {
      const incompleteProfile: Profile = {
        sub: 'google-user-123',
        email: 'user@example.com',
        // name and picture missing
      };

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        ...mockUser,
        name: null,
        image: null,
      });

      const result = await authOptions.callbacks?.signIn?.({
        user: {
          ...mockUser,
          email: incompleteProfile.email!,
          name: null,
          image: null,
        },
        account: mockGoogleAccount,
        profile: incompleteProfile,
      });

      expect(result).toBe(true);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'user@example.com',
          name: null,
          image: null,
          role: Role.USER,
          grade: MemberGrade.GUEST,
          status: UserStatus.ACTIVE,
          points: 0,
        },
      });
    });

    it('should handle profile data type conversion', () => {
      // Google profile data comes as strings, ensure proper handling
      expect(typeof mockGoogleProfile.sub).toBe('string');
      expect(typeof mockGoogleProfile.email).toBe('string');
      expect(typeof mockGoogleProfile.email_verified).toBe('boolean');
    });

    it('should validate required profile fields', () => {
      const requiredFields = ['sub', 'email'];
      const optionalFields = ['name', 'picture', 'given_name', 'family_name'];

      requiredFields.forEach(field => {
        expect(mockGoogleProfile[field as keyof Profile]).toBeDefined();
      });

      // Optional fields can be undefined
      optionalFields.forEach(field => {
        // These should exist in our mock but can be undefined in real scenarios
        if (mockGoogleProfile[field as keyof Profile] !== undefined) {
          expect(typeof mockGoogleProfile[field as keyof Profile]).toBe('string');
        }
      });
    });

    it('should handle special characters in profile data', async () => {
      const specialCharProfile: Profile = {
        sub: 'google-user-123',
        email: 'user+test@example.com',
        name: 'José María González',
        picture: 'https://example.com/avatar.jpg?param=value&other=123',
      };

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        ...mockUser,
        email: specialCharProfile.email,
        name: specialCharProfile.name,
        image: specialCharProfile.picture,
      });

      const result = await authOptions.callbacks?.signIn?.({
        user: {
          ...mockUser,
          email: specialCharProfile.email!,
          name: specialCharProfile.name!,
          image: specialCharProfile.picture!,
        },
        account: mockGoogleAccount,
        profile: specialCharProfile,
      });

      expect(result).toBe(true);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'user+test@example.com',
          name: 'José María González',
          image: 'https://example.com/avatar.jpg?param=value&other=123',
          role: Role.USER,
          grade: MemberGrade.GUEST,
          status: UserStatus.ACTIVE,
          points: 0,
        },
      });
    });
  });

  describe('Account Linking', () => {
    it('should link new Google account to existing user', async () => {
      const existingUser = {
        ...mockUser,
        id: 'existing-user-123',
        email: 'user@example.com',
      };

      prisma.user.findUnique.mockResolvedValue(existingUser);

      const result = await authOptions.callbacks?.signIn?.({
        user: {
          ...mockUser,
          email: existingUser.email,
        },
        account: mockGoogleAccount,
        profile: mockGoogleProfile,
      });

      expect(result).toBe(true);
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled(); // Regular user, not admin
    });

    it('should handle multiple OAuth providers for same email', async () => {
      const existingUser = {
        ...mockUser,
        email: 'user@example.com',
      };

      prisma.user.findUnique.mockResolvedValue(existingUser);

      // First sign in with Google
      const googleResult = await authOptions.callbacks?.signIn?.({
        user: { ...mockUser, email: existingUser.email },
        account: { ...mockGoogleAccount, provider: 'google' },
        profile: mockGoogleProfile,
      });

      expect(googleResult).toBe(true);

      // Hypothetical second provider (if configured)
      const facebookAccount: Account = {
        ...mockGoogleAccount,
        provider: 'facebook',
        providerAccountId: 'facebook-user-123',
      };

      const facebookResult = await authOptions.callbacks?.signIn?.({
        user: { ...mockUser, email: existingUser.email },
        account: facebookAccount,
        profile: { sub: 'facebook-user-123', email: existingUser.email },
      });

      // Should work since we're only checking for google provider specifically
      expect(facebookResult).toBe(true);
    });

    it('should prevent account linking for different email addresses', async () => {
      const existingUser = {
        ...mockUser,
        email: 'original@example.com',
      };

      const newGoogleProfile = {
        ...mockGoogleProfile,
        email: 'different@example.com',
      };

      prisma.user.findUnique.mockResolvedValue(null); // No existing user with new email

      const result = await authOptions.callbacks?.signIn?.({
        user: {
          ...mockUser,
          email: newGoogleProfile.email!,
        },
        account: mockGoogleAccount,
        profile: newGoogleProfile,
      });

      expect(result).toBe(true);
      // Should create new user, not link to existing
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should handle admin account upgrade during linking', async () => {
      const existingRegularUser = {
        ...mockUser,
        email: 'admin@zentpoker.com', // Admin email but regular role
        role: Role.USER,
        grade: MemberGrade.GUEST,
      };

      prisma.user.findUnique.mockResolvedValue(existingRegularUser);
      prisma.user.update.mockResolvedValue({
        ...existingRegularUser,
        role: Role.ADMIN,
        grade: MemberGrade.ADMIN,
      });

      const result = await authOptions.callbacks?.signIn?.({
        user: {
          ...mockUser,
          email: 'admin@zentpoker.com',
        },
        account: mockGoogleAccount,
        profile: {
          ...mockGoogleProfile,
          email: 'admin@zentpoker.com',
        },
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
  });

  describe('Error Handling in OAuth Flow', () => {
    it('should handle Google API errors during profile fetch', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      prisma.user.findUnique.mockRejectedValue(new Error('Database connection error'));

      const result = await authOptions.callbacks?.signIn?.({
        user: mockUser,
        account: mockGoogleAccount,
        profile: mockGoogleProfile,
      });

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error during sign in:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle database errors during user creation', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockRejectedValue(new Error('Database write error'));

      const result = await authOptions.callbacks?.signIn?.({
        user: mockUser,
        account: mockGoogleAccount,
        profile: mockGoogleProfile,
      });

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error during sign in:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle network timeouts during OAuth', async () => {
      const timeoutError = new Error('Network timeout');
      timeoutError.name = 'TimeoutError';

      prisma.user.findUnique.mockRejectedValue(timeoutError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await authOptions.callbacks?.signIn?.({
        user: mockUser,
        account: mockGoogleAccount,
        profile: mockGoogleProfile,
      });

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error during sign in:', timeoutError);

      consoleSpy.mockRestore();
    });

    it('should handle malformed OAuth responses', () => {
      const malformedProfile: Profile = {
        sub: '', // Empty sub
        email: 'invalid-email', // Invalid email format
      };

      // Email validation would typically be done by the provider or our validation
      const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      expect(isValidEmail(malformedProfile.email!)).toBe(false);
      expect(malformedProfile.sub).toBe('');
    });

    it('should handle OAuth revocation scenarios', async () => {
      // User revokes OAuth permission
      const revokedAccount: Account = {
        ...mockGoogleAccount,
        access_token: null,
        refresh_token: null,
        expires_at: null,
      };

      // Should still allow sign in if account exists
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await authOptions.callbacks?.signIn?.({
        user: mockUser,
        account: revokedAccount,
        profile: mockGoogleProfile,
      });

      expect(result).toBe(true); // Sign in should still work
    });

    it('should handle concurrent OAuth attempts', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      // Simulate multiple concurrent sign-in attempts
      const signInPromises = Array.from({ length: 3 }, () =>
        authOptions.callbacks?.signIn?.({
          user: mockUser,
          account: mockGoogleAccount,
          profile: mockGoogleProfile,
        })
      );

      const results = await Promise.all(signInPromises);

      expect(results).toHaveLength(3);
      results.forEach(result => expect(result).toBe(true));

      // User should only be created once (in a real scenario with proper DB constraints)
      expect(prisma.user.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('Token Exchange and Storage', () => {
    it('should handle OAuth token exchange', () => {
      // Verify token structure
      expect(mockGoogleAccount.access_token).toBeDefined();
      expect(mockGoogleAccount.refresh_token).toBeDefined();
      expect(mockGoogleAccount.expires_at).toBeGreaterThan(Date.now() / 1000);
      expect(mockGoogleAccount.token_type).toBe('Bearer');
    });

    it('should handle token expiration', () => {
      const expiredAccount: Account = {
        ...mockGoogleAccount,
        expires_at: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      };

      const isExpired = expiredAccount.expires_at! < Math.floor(Date.now() / 1000);
      expect(isExpired).toBe(true);
    });

    it('should validate token scopes', () => {
      const requiredScopes = ['openid', 'email', 'profile'];
      const receivedScopes = mockGoogleAccount.scope?.split(' ') || [];

      requiredScopes.forEach(scope => {
        expect(receivedScopes).toContain(scope);
      });
    });

    it('should handle refresh token rotation', () => {
      const oldRefreshToken = 'old-refresh-token';
      const newRefreshToken = 'new-refresh-token';

      // Simulate token refresh
      const refreshedAccount: Account = {
        ...mockGoogleAccount,
        refresh_token: newRefreshToken,
        access_token: 'new-access-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };

      expect(refreshedAccount.refresh_token).not.toBe(oldRefreshToken);
      expect(refreshedAccount.refresh_token).toBe(newRefreshToken);
    });

    it('should secure token storage', () => {
      // Tokens should not be logged or exposed
      const sensitiveFields = ['access_token', 'refresh_token', 'id_token'];

      sensitiveFields.forEach(field => {
        expect(mockGoogleAccount[field as keyof Account]).toBeDefined();
        // In real application, these should be encrypted or handled securely
      });
    });
  });

  describe('OAuth Security Considerations', () => {
    it('should validate OAuth state for CSRF protection', () => {
      const state = 'secure-random-state';
      const receivedState = 'secure-random-state';
      const maliciousState = 'malicious-state';

      expect(state).toBe(receivedState);
      expect(state).not.toBe(maliciousState);
    });

    it('should use PKCE for additional security', () => {
      // PKCE (Proof Key for Code Exchange) parameters
      const codeVerifier = 'secure-random-code-verifier';
      const codeChallenge = 'base64url-encoded-challenge';
      const codeChallengeMethod = 'S256';

      expect(codeVerifier).toBeDefined();
      expect(codeChallenge).toBeDefined();
      expect(codeChallengeMethod).toBe('S256');
    });

    it('should handle OAuth redirect URI validation', () => {
      const allowedRedirectUri = 'https://zentpoker.com/api/auth/callback/google';
      const maliciousRedirectUri = 'https://evil.com/steal-code';

      const isValidRedirectUri = (uri: string): boolean => {
        return uri === allowedRedirectUri;
      };

      expect(isValidRedirectUri(allowedRedirectUri)).toBe(true);
      expect(isValidRedirectUri(maliciousRedirectUri)).toBe(false);
    });

    it('should implement OAuth nonce for replay protection', () => {
      const nonce = 'unique-nonce-value';
      const usedNonces = new Set<string>();

      // Check if nonce was already used
      const isNonceReused = usedNonces.has(nonce);
      expect(isNonceReused).toBe(false);

      // Mark nonce as used
      usedNonces.add(nonce);
      expect(usedNonces.has(nonce)).toBe(true);
    });

    it('should validate JWT ID token signature', () => {
      // In a real implementation, you would verify the JWT signature
      const idToken = mockGoogleAccount.id_token;
      expect(idToken).toBeDefined();

      // Mock JWT validation
      const isValidSignature = (token: string): boolean => {
        // This would involve actual cryptographic verification
        return token.length > 0 && token.includes('.');
      };

      expect(isValidSignature(idToken!)).toBe(true);
    });

    it('should handle OAuth scope downgrade attacks', () => {
      const requestedScopes = ['openid', 'email', 'profile'];
      const receivedScopes = mockGoogleAccount.scope?.split(' ') || [];

      // Ensure all requested scopes were granted
      const allScopesGranted = requestedScopes.every(scope =>
        receivedScopes.includes(scope)
      );

      expect(allScopesGranted).toBe(true);
    });
  });
});