import { faker } from '@faker-js/faker';
import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

/**
 * 테스트용 세션 데이터 생성
 */
export function createMockSession(overrides: Partial<Session> = {}): Session {
  return {
    user: {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: 'USER',
      tier: 'BRONZE',
      status: 'ACTIVE',
      points: faker.number.int({ min: 0, max: 100000 }),
      image: faker.image.avatar(),
      ...overrides.user,
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후
    ...overrides,
  };
}

/**
 * 테스트용 관리자 세션 데이터 생성
 */
export function createMockAdminSession(overrides: Partial<Session> = {}): Session {
  return createMockSession({
    user: {
      role: 'ADMIN',
      tier: 'PLATINUM',
      points: 1000000,
      ...overrides.user,
    },
    ...overrides,
  });
}

/**
 * 테스트용 JWT 토큰 생성
 */
export function createMockJWT(overrides: Partial<JWT> = {}): JWT {
  return {
    sub: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: 'USER',
    tier: 'BRONZE',
    status: 'ACTIVE',
    points: faker.number.int({ min: 0, max: 100000 }),
    picture: faker.image.avatar(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30일 후
    ...overrides,
  };
}

/**
 * 테스트용 Google OAuth 프로필 생성
 */
export function createMockGoogleProfile(overrides = {}) {
  return {
    id: faker.string.numeric(12),
    email: faker.internet.email(),
    verified_email: true,
    name: faker.person.fullName(),
    given_name: faker.person.firstName(),
    family_name: faker.person.lastName(),
    picture: faker.image.avatar(),
    locale: 'ko',
    ...overrides,
  };
}

/**
 * 테스트용 로그인 헬퍼 (E2E 테스트용)
 */
export class AuthTestHelper {
  constructor(private page: any) {}

  /**
   * 구글 OAuth 로그인 시뮬레이션
   */
  async loginWithGoogle(email = 'test@gmail.com', name = 'Test User') {
    // Google 로그인 버튼 클릭
    await this.page.getByRole('button', { name: /구글로 로그인/i }).click();

    // OAuth 플로우가 모의되므로 리다이렉트 대기
    await this.page.waitForURL(/\/dashboard/, { timeout: 10000 });
  }

  /**
   * 관리자 로그인
   */
  async loginAsAdmin() {
    await this.loginWithGoogle('admin@example.com', 'Admin User');
  }

  /**
   * 로그아웃
   */
  async logout() {
    await this.page.getByRole('button', { name: /로그아웃/i }).click();
    await this.page.waitForURL(/\/login/, { timeout: 5000 });
  }

  /**
   * 로그인 상태 확인
   */
  async expectToBeLoggedIn() {
    await expect(this.page.getByTestId('user-menu')).toBeVisible();
  }

  /**
   * 로그아웃 상태 확인
   */
  async expectToBeLoggedOut() {
    await expect(this.page.getByRole('button', { name: /로그인/i })).toBeVisible();
  }

  /**
   * 특정 권한 페이지 접근 확인
   */
  async expectToHaveAccess(url: string) {
    await this.page.goto(url);
    await expect(this.page).not.toHaveURL(/\/unauthorized/);
    await expect(this.page).not.toHaveURL(/\/login/);
  }

  /**
   * 권한 없음 페이지로 리다이렉트 확인
   */
  async expectToBeUnauthorized(url: string) {
    await this.page.goto(url);
    await expect(this.page).toHaveURL(/\/unauthorized|\/login/);
  }
}

/**
 * Next-Auth 세션 모킹
 */
export function mockNextAuthSession(session: Session | null) {
  const mockUseSession = jest.fn(() => ({
    data: session,
    status: session ? 'authenticated' : 'unauthenticated',
    update: jest.fn(),
  }));

  const mockSignIn = jest.fn();
  const mockSignOut = jest.fn();
  const mockGetSession = jest.fn(() => Promise.resolve(session));

  return {
    useSession: mockUseSession,
    signIn: mockSignIn,
    signOut: mockSignOut,
    getSession: mockGetSession,
  };
}

/**
 * 테스트용 인증 상태 설정
 */
export function setupAuthMocks() {
  // NextAuth 모킹
  jest.mock('next-auth/react', () => mockNextAuthSession(null));

  // 세션 설정 헬퍼
  const setSession = (session: Session | null) => {
    const mocks = mockNextAuthSession(session);
    jest.mocked(require('next-auth/react').useSession).mockReturnValue({
      data: session,
      status: session ? 'authenticated' : 'unauthenticated',
      update: jest.fn(),
    });
  };

  return {
    setSession,
    setLoggedInUser: (user: Session['user']) => setSession({ user, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }),
    setLoggedOut: () => setSession(null),
  };
}

/**
 * 테스트 환경에서 사용할 수 있는 사용자 역할별 헬퍼
 */
export const AUTH_USERS = {
  GUEST: createMockSession({
    user: {
      role: 'USER',
      tier: 'GUEST',
      points: 0,
    },
  }),
  USER: createMockSession({
    user: {
      role: 'USER',
      tier: 'BRONZE',
      points: 25000,
    },
  }),
  PREMIUM_USER: createMockSession({
    user: {
      role: 'USER',
      tier: 'GOLD',
      points: 100000,
    },
  }),
  ADMIN: createMockAdminSession(),
  SUSPENDED_USER: createMockSession({
    user: {
      status: 'SUSPENDED',
      tier: 'BRONZE',
      points: 0,
    },
  }),
} as const;