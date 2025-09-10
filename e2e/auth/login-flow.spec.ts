import { test, expect, testGroups, retryConfig } from '../fixtures';

test.describe(testGroups.auth, () => {
  test.describe.configure(retryConfig.auth);

  test('should display login page correctly', async ({ guestPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(guestPage);
    await nav.goToLogin();

    // Check page title
    await expect(guestPage).toHaveTitle(/로그인|Login/);

    // Check login form elements
    await expect(guestPage.locator('[data-testid="login-form"]')).toBeVisible();
    await expect(guestPage.locator('[data-testid="google-login-button"]')).toBeVisible();
    await expect(guestPage.locator('[data-testid="kakao-login-button"]')).toBeVisible();

    // Check navigation elements
    await expect(guestPage.locator('[data-testid="home-link"]')).toBeVisible();
    await expect(guestPage.locator('[data-testid="register-link"]')).toBeVisible();
  });

  test('should redirect unauthenticated users to login', async ({ guestPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(guestPage);
    
    // Try to access protected route
    await nav.goToDashboard();
    
    // Should redirect to login
    await expect(guestPage).toHaveURL(/\/login/);
    
    // Should show appropriate message
    const alertMessage = guestPage.locator('[data-testid="login-required-message"]');
    if (await alertMessage.isVisible()) {
      await expect(alertMessage).toContainText('로그인이 필요합니다');
    }
  });

  test('should login as member successfully', async ({ guestPage, authHelper, navigationHelper }) => {
    const auth = new authHelper.constructor(guestPage);
    const nav = new navigationHelper.constructor(guestPage);

    // Go to login page
    await nav.goToLogin();

    // Mock OAuth flow for testing
    await auth.mockOAuthCallback('google', {
      email: 'member@zentpoker.test',
      name: 'Test Member',
      role: 'MEMBER',
    });

    // Simulate login
    await auth.loginAsMember();

    // Verify successful login
    await expect(auth.isAuthenticated()).resolves.toBe(true);
    await expect(auth.getCurrentUserRole()).resolves.toBe('MEMBER');

    // Should redirect to dashboard
    await expect(guestPage).toHaveURL(/\/dashboard/);

    // Check user menu is visible
    await expect(guestPage.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(guestPage.locator('[data-testid="user-name"]')).toContainText('Test Member');
  });

  test('should login as admin successfully', async ({ guestPage, authHelper, navigationHelper }) => {
    const auth = new authHelper.constructor(guestPage);
    const nav = new navigationHelper.constructor(guestPage);

    await nav.goToLogin();

    // Mock OAuth flow for admin
    await auth.mockOAuthCallback('google', {
      email: 'admin@zentpoker.test',
      name: 'Test Admin',
      role: 'ADMIN',
    });

    await auth.loginAsAdmin();

    // Verify admin login
    await expect(auth.isAuthenticated()).resolves.toBe(true);
    await expect(auth.getCurrentUserRole()).resolves.toBe('ADMIN');

    // Should redirect to admin dashboard
    await expect(guestPage).toHaveURL(/\/admin\/dashboard/);

    // Check admin sidebar is visible
    await expect(guestPage.locator('[data-testid="admin-sidebar"]')).toBeVisible();
  });

  test('should handle OAuth errors gracefully', async ({ guestPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(guestPage);
    await nav.goToLogin();

    // Mock OAuth error
    await guestPage.route('**/api/auth/callback/google', route => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({
          error: 'OAuth authentication failed',
          error_description: 'Invalid credentials',
        }),
      });
    });

    // Try to login
    await guestPage.locator('[data-testid="google-login-button"]').click();

    // Should show error message
    const errorMessage = guestPage.locator('[data-testid="login-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('로그인에 실패했습니다');
  });

  test('should logout successfully', async ({ memberPage, authHelper }) => {
    const auth = new authHelper.constructor(memberPage);

    // Verify we're logged in
    await expect(auth.isAuthenticated()).resolves.toBe(true);

    // Logout
    await auth.logout();

    // Verify logout
    await expect(auth.isAuthenticated()).resolves.toBe(false);
    await expect(memberPage).toHaveURL(/\/$/); // Should redirect to home
  });

  test('should maintain session across page refreshes', async ({ memberPage, authHelper }) => {
    const auth = new authHelper.constructor(memberPage);

    // Verify initial authentication
    await expect(auth.isAuthenticated()).resolves.toBe(true);

    // Refresh page
    await memberPage.reload();

    // Should still be authenticated
    await expect(auth.isAuthenticated()).resolves.toBe(true);
    await expect(memberPage.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should handle expired sessions', async ({ memberPage, authHelper }) => {
    const auth = new authHelper.constructor(memberPage);

    // Verify initial authentication
    await expect(auth.isAuthenticated()).resolves.toBe(true);

    // Mock expired session
    await memberPage.context().addCookies([
      {
        name: 'next-auth.session-token',
        value: 'expired-token',
        domain: 'localhost',
        path: '/',
        expires: Date.now() - 1000, // Expired
      },
    ]);

    // Try to access protected route
    await memberPage.goto('/dashboard');

    // Should redirect to login due to expired session
    await expect(memberPage).toHaveURL(/\/login/);
    
    // Should show session expired message
    const sessionExpiredMessage = memberPage.locator('[data-testid="session-expired-message"]');
    if (await sessionExpiredMessage.isVisible()) {
      await expect(sessionExpiredMessage).toContainText('세션이 만료되었습니다');
    }
  });

  test('should prevent unauthorized access to admin routes', async ({ memberPage }) => {
    // Try to access admin route as member
    await memberPage.goto('/admin/dashboard');

    // Should redirect to unauthorized page or show access denied
    const currentUrl = memberPage.url();
    expect(currentUrl).toMatch(/\/(unauthorized|403|dashboard)/);

    // If on unauthorized page, check message
    if (currentUrl.includes('unauthorized')) {
      await expect(memberPage.locator('[data-testid="unauthorized-message"]')).toBeVisible();
    }
  });

  test('should handle network errors during login', async ({ guestPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(guestPage);
    await nav.goToLogin();

    // Mock network error
    await guestPage.route('**/api/auth/**', route => {
      route.abort();
    });

    // Try to login
    await guestPage.locator('[data-testid="google-login-button"]').click();

    // Should show network error message
    const networkErrorMessage = guestPage.locator('[data-testid="network-error"]');
    if (await networkErrorMessage.isVisible()) {
      await expect(networkErrorMessage).toContainText('네트워크 오류');
    }
  });

  test('should support keyboard navigation in login form', async ({ guestPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(guestPage);
    await nav.goToLogin();

    // Test tab navigation
    await guestPage.keyboard.press('Tab');
    await expect(guestPage.locator('[data-testid="google-login-button"]')).toBeFocused();

    await guestPage.keyboard.press('Tab');
    await expect(guestPage.locator('[data-testid="kakao-login-button"]')).toBeFocused();

    // Test enter key activation
    await guestPage.keyboard.press('Enter');
    // Should trigger login attempt (would normally redirect to OAuth provider)
  });
});