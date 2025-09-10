import { test, expect } from '@playwright/test';
import { AuthTestHelper } from '../utils/auth-helpers';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 홈페이지로 이동
    await page.goto('/');
  });

  test('should display login page when not authenticated', async ({ page }) => {
    await expect(page).toHaveTitle(/ZentPoker/);
    await expect(page.getByRole('button', { name: /구글로 로그인/i })).toBeVisible();
  });

  test('should redirect to dashboard after successful Google login', async ({ page }) => {
    const authHelper = new AuthTestHelper(page);

    // Google 로그인 시도
    await authHelper.loginWithGoogle();

    // 대시보드로 리다이렉트 확인
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId('user-menu')).toBeVisible();
  });

  test('should display user information after login', async ({ page }) => {
    const authHelper = new AuthTestHelper(page);

    await authHelper.loginWithGoogle('test@example.com', 'Test User');

    // 사용자 정보 표시 확인
    await expect(page.getByText('Test User')).toBeVisible();
    await expect(page.getByText('test@example.com')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    const authHelper = new AuthTestHelper(page);

    // 먼저 로그인
    await authHelper.loginWithGoogle();
    await authHelper.expectToBeLoggedIn();

    // 로그아웃
    await authHelper.logout();
    await authHelper.expectToBeLoggedOut();
  });

  test('should redirect unauthorized users from admin pages', async ({ page }) => {
    const authHelper = new AuthTestHelper(page);

    // 일반 사용자로 로그인
    await authHelper.loginWithGoogle('user@example.com', 'Regular User');

    // 관리자 페이지 접근 시도
    await authHelper.expectToBeUnauthorized('/admin/dashboard');
  });

  test('should allow admin access to admin pages', async ({ page }) => {
    const authHelper = new AuthTestHelper(page);

    // 관리자로 로그인
    await authHelper.loginAsAdmin();

    // 관리자 페이지 접근 확인
    await authHelper.expectToHaveAccess('/admin/dashboard');
    await expect(page.getByText('관리자 대시보드')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthTestHelper(page);
    await page.goto('/');
    await authHelper.loginWithGoogle();
  });

  test('should navigate to points page', async ({ page }) => {
    await page.getByRole('link', { name: /포인트/i }).click();
    await expect(page).toHaveURL(/\/points/);
    await expect(page.getByText('포인트 관리')).toBeVisible();
  });

  test('should navigate to tournaments page', async ({ page }) => {
    await page.getByRole('link', { name: /토너먼트/i }).click();
    await expect(page).toHaveURL(/\/tournaments/);
    await expect(page.getByText('토너먼트')).toBeVisible();
  });

  test('should navigate to vouchers page', async ({ page }) => {
    await page.getByRole('link', { name: /바우처/i }).click();
    await expect(page).toHaveURL(/\/vouchers/);
    await expect(page.getByText('바우처')).toBeVisible();
  });

  test('should navigate to profile page', async ({ page }) => {
    await page.getByTestId('user-menu').click();
    await page.getByRole('menuitem', { name: /프로필/i }).click();
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByText('프로필 관리')).toBeVisible();
  });
});