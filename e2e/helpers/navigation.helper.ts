import { Page, expect } from '@playwright/test';

export class NavigationHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to home page
   */
  async goToHome() {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to login page
   */
  async goToLogin() {
    await this.page.goto('/login');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to dashboard
   */
  async goToDashboard() {
    await this.page.goto('/dashboard');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to points page
   */
  async goToPoints() {
    await this.page.goto('/points');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to point charge page
   */
  async goToPointCharge() {
    await this.page.goto('/points/charge');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to tournaments page
   */
  async goToTournaments() {
    await this.page.goto('/tournaments');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to specific tournament page
   */
  async goToTournament(tournamentId: string) {
    await this.page.goto(`/tournaments/${tournamentId}`);
    await this.waitForPageLoad();
  }

  /**
   * Navigate to vouchers page
   */
  async goToVouchers() {
    await this.page.goto('/vouchers');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to voucher purchase page
   */
  async goToVoucherPurchase() {
    await this.page.goto('/vouchers/purchase');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to profile page
   */
  async goToProfile() {
    await this.page.goto('/profile');
    await this.waitForPageLoad();
  }

  // Admin navigation methods
  /**
   * Navigate to admin dashboard
   */
  async goToAdminDashboard() {
    await this.page.goto('/admin/dashboard');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to admin members page
   */
  async goToAdminMembers() {
    await this.page.goto('/admin/members');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to admin tournaments page
   */
  async goToAdminTournaments() {
    await this.page.goto('/admin/tournaments');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to tournament creation page
   */
  async goToCreateTournament() {
    await this.page.goto('/admin/tournaments/create');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to admin vouchers page
   */
  async goToAdminVouchers() {
    await this.page.goto('/admin/vouchers');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to voucher pricing page
   */
  async goToVoucherPricing() {
    await this.page.goto('/admin/vouchers/pricing');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to payment confirmation page
   */
  async goToPaymentConfirmation() {
    await this.page.goto('/admin/payments/confirm');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to admin reports page
   */
  async goToAdminReports() {
    await this.page.goto('/admin/reports');
    await this.waitForPageLoad();
  }

  // Navigation using UI elements
  /**
   * Navigate using sidebar menu
   */
  async navigateViaSidebar(menuItem: string) {
    const sidebarItem = this.page.locator(`[data-testid="sidebar-${menuItem}"]`);
    await sidebarItem.click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate using header menu
   */
  async navigateViaHeader(menuItem: string) {
    const headerItem = this.page.locator(`[data-testid="header-${menuItem}"]`);
    await headerItem.click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate using breadcrumbs
   */
  async navigateViaBreadcrumb(breadcrumbText: string) {
    const breadcrumb = this.page.locator(`[data-testid="breadcrumb"]`, { hasText: breadcrumbText });
    await breadcrumb.click();
    await this.waitForPageLoad();
  }

  // Navigation state checks
  /**
   * Check if currently on specific page
   */
  async isOnPage(path: string): Promise<boolean> {
    const currentUrl = this.page.url();
    return currentUrl.includes(path);
  }

  /**
   * Get current page path
   */
  async getCurrentPath(): Promise<string> {
    const url = new URL(this.page.url());
    return url.pathname;
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
    
    // Wait for any loading spinners to disappear
    const loadingSpinner = this.page.locator('[data-testid="loading"]');
    if (await loadingSpinner.isVisible()) {
      await loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
    }
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(expectedPath?: string) {
    await this.page.waitForURL(expectedPath ? `**${expectedPath}` : '**', {
      waitUntil: 'networkidle',
      timeout: 10000,
    });
    await this.waitForPageLoad();
  }

  /**
   * Go back in browser history
   */
  async goBack() {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  /**
   * Go forward in browser history
   */
  async goForward() {
    await this.page.goForward();
    await this.waitForPageLoad();
  }

  /**
   * Reload current page
   */
  async reload() {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  // Mobile navigation helpers
  /**
   * Open mobile menu
   */
  async openMobileMenu() {
    const mobileMenuButton = this.page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(this.page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    }
  }

  /**
   * Close mobile menu
   */
  async closeMobileMenu() {
    const mobileMenuClose = this.page.locator('[data-testid="mobile-menu-close"]');
    if (await mobileMenuClose.isVisible()) {
      await mobileMenuClose.click();
      await expect(this.page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
    }
  }

  // Tab navigation
  /**
   * Navigate to tab in tab container
   */
  async navigateToTab(tabName: string) {
    const tab = this.page.locator(`[data-testid="tab-${tabName}"]`);
    await tab.click();
    
    // Wait for tab content to load
    const tabContent = this.page.locator(`[data-testid="tab-content-${tabName}"]`);
    await expect(tabContent).toBeVisible();
  }

  // Error handling
  /**
   * Check if on error page
   */
  async isOnErrorPage(): Promise<boolean> {
    const errorPage = this.page.locator('[data-testid="error-page"]');
    return await errorPage.isVisible();
  }

  /**
   * Check if on 404 page
   */
  async isOn404Page(): Promise<boolean> {
    const notFoundPage = this.page.locator('[data-testid="not-found-page"]');
    return await notFoundPage.isVisible();
  }

  /**
   * Check if page requires authentication
   */
  async requiresAuthentication(): Promise<boolean> {
    return await this.isOnPage('/login') || await this.isOnPage('/unauthorized');
  }
}