import { Page, expect } from '@playwright/test';
import { testData } from '../fixtures';

export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Login as admin user
   */
  async loginAsAdmin() {
    await this.loginWithCredentials(testData.users.admin);
  }

  /**
   * Login as member user
   */
  async loginAsMember() {
    await this.loginWithCredentials(testData.users.member);
  }

  /**
   * Login with specific credentials
   */
  async loginWithCredentials(credentials: { email: string; password: string; name: string }) {
    await this.page.goto('/login');
    
    // For E2E tests, we'll bypass OAuth and use a test login
    // This assumes we have a test login form or we mock the OAuth flow
    
    // Check if we're already logged in
    const userMenu = await this.page.locator('[data-testid="user-menu"]');
    if (await userMenu.isVisible()) {
      console.log('User already logged in, skipping authentication');
      return;
    }

    // Set up test session via API or cookies
    await this.setTestUserSession(credentials);
    
    // Navigate to dashboard to complete login
    await this.page.goto('/dashboard');
    
    // Wait for authentication to complete
    await this.waitForAuthentication();
  }

  /**
   * Setup test user session (bypassing OAuth for testing)
   */
  private async setTestUserSession(credentials: { email: string; name: string }) {
    // In a real E2E setup, this would set up the session via:
    // 1. Direct cookie manipulation
    // 2. API call to create test session
    // 3. Mock OAuth response
    
    // For now, we'll simulate this by setting NextAuth session cookies
    const sessionToken = await this.createTestSession(credentials);
    
    await this.page.context().addCookies([
      {
        name: 'next-auth.session-token',
        value: sessionToken,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      },
    ]);
  }

  /**
   * Create a test session token (simplified for E2E)
   */
  private async createTestSession(credentials: { email: string; name: string }): Promise<string> {
    // This would typically call your API to create a test session
    // For now, return a mock session token
    const mockSession = {
      user: {
        email: credentials.email,
        name: credentials.name,
        id: credentials.email === testData.users.admin.email ? 'admin-test-id' : 'member-test-id',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };
    
    // In practice, you'd call your auth API:
    // const response = await this.page.request.post('/api/test/session', {
    //   data: mockSession
    // });
    // return await response.text();
    
    return Buffer.from(JSON.stringify(mockSession)).toString('base64');
  }

  /**
   * Wait for authentication to complete
   */
  async waitForAuthentication() {
    await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible({ timeout: 10000 });
  }

  /**
   * Logout current user
   */
  async logout() {
    // Check if user menu exists
    const userMenu = this.page.locator('[data-testid="user-menu"]');
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await this.page.locator('[data-testid="logout-button"]').click();
      
      // Wait for logout to complete
      await expect(this.page.locator('[data-testid="user-menu"]')).not.toBeVisible();
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const userMenu = this.page.locator('[data-testid="user-menu"]');
      return await userMenu.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Get current user role
   */
  async getCurrentUserRole(): Promise<'ADMIN' | 'MEMBER' | 'GUEST' | null> {
    try {
      if (!await this.isAuthenticated()) {
        return 'GUEST';
      }

      // Check for admin indicators
      const adminSidebar = this.page.locator('[data-testid="admin-sidebar"]');
      if (await adminSidebar.isVisible()) {
        return 'ADMIN';
      }

      // Check for member indicators  
      const memberSidebar = this.page.locator('[data-testid="member-sidebar"]');
      if (await memberSidebar.isVisible()) {
        return 'MEMBER';
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Ensure user has specific role (login if needed)
   */
  async ensureUserRole(role: 'ADMIN' | 'MEMBER') {
    const currentRole = await this.getCurrentUserRole();
    
    if (currentRole !== role) {
      await this.logout();
      
      if (role === 'ADMIN') {
        await this.loginAsAdmin();
      } else if (role === 'MEMBER') {
        await this.loginAsMember();
      }
    }
  }

  /**
   * Mock OAuth callback for testing
   */
  async mockOAuthCallback(provider: 'google' | 'kakao', userData: any) {
    // This would set up OAuth callback mocking for external providers
    await this.page.route(`**/api/auth/callback/${provider}`, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          url: '/dashboard',
          user: userData,
        }),
      });
    });
  }

  /**
   * Clear all authentication state
   */
  async clearAuthState() {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Set up authentication interceptors for API calls
   */
  async setupAuthInterceptors() {
    // Intercept auth-related API calls and provide mock responses
    await this.page.route('**/api/auth/**', route => {
      const url = route.request().url();
      
      if (url.includes('/session')) {
        // Return current session
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            user: {
              email: 'test@zentpoker.test',
              name: 'Test User',
              role: 'MEMBER',
            },
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          }),
        });
      } else {
        route.continue();
      }
    });
  }
}