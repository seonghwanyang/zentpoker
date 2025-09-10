import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;
  
  // Common elements present on all pages
  readonly header: Locator;
  readonly footer: Locator;
  readonly navigation: Locator;
  readonly userMenu: Locator;
  readonly loadingIndicator: Locator;
  readonly errorBanner: Locator;
  readonly successBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize common locators
    this.header = page.locator('[data-testid="header"]');
    this.footer = page.locator('[data-testid="footer"]');
    this.navigation = page.locator('[data-testid="navigation"]');
    this.userMenu = page.locator('[data-testid="user-menu"]');
    this.loadingIndicator = page.locator('[data-testid="loading"]');
    this.errorBanner = page.locator('[data-testid="error-banner"]');
    this.successBanner = page.locator('[data-testid="success-banner"]');
  }

  // Common page actions
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
    
    // Wait for any loading indicators to disappear
    if (await this.loadingIndicator.isVisible()) {
      await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 });
    }
  }

  async waitForNavigation(expectedPath?: string) {
    if (expectedPath) {
      await this.page.waitForURL(`**${expectedPath}`, {
        waitUntil: 'networkidle',
        timeout: 10000,
      });
    } else {
      await this.page.waitForURL('**', {
        waitUntil: 'networkidle',
        timeout: 10000,
      });
    }
    await this.waitForPageLoad();
  }

  async reload() {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  async goBack() {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  async goForward() {
    await this.page.goForward();
    await this.waitForPageLoad();
  }

  // Common UI interactions
  async clickUserMenu() {
    if (await this.userMenu.isVisible()) {
      await this.userMenu.click();
    }
  }

  async isUserLoggedIn(): Promise<boolean> {
    return await this.userMenu.isVisible();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  // Error and success handling
  async hasError(): Promise<boolean> {
    return await this.errorBanner.isVisible();
  }

  async getErrorMessage(): Promise<string> {
    if (await this.hasError()) {
      return await this.errorBanner.textContent() || '';
    }
    return '';
  }

  async hasSuccess(): Promise<boolean> {
    return await this.successBanner.isVisible();
  }

  async getSuccessMessage(): Promise<string> {
    if (await this.hasSuccess()) {
      return await this.successBanner.textContent() || '';
    }
    return '';
  }

  async dismissErrorBanner() {
    const dismissButton = this.errorBanner.locator('[data-testid="dismiss-error"]');
    if (await dismissButton.isVisible()) {
      await dismissButton.click();
    }
  }

  async dismissSuccessBanner() {
    const dismissButton = this.successBanner.locator('[data-testid="dismiss-success"]');
    if (await dismissButton.isVisible()) {
      await dismissButton.click();
    }
  }

  // Loading states
  async isLoading(): Promise<boolean> {
    return await this.loadingIndicator.isVisible();
  }

  async waitForLoadingToComplete() {
    if (await this.isLoading()) {
      await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 30000 });
    }
  }

  // Form helpers
  async fillInput(selector: string, value: string) {
    const input = this.page.locator(selector);
    await input.clear();
    await input.fill(value);
  }

  async selectOption(selector: string, value: string) {
    await this.page.locator(selector).selectOption(value);
  }

  async checkCheckbox(selector: string) {
    const checkbox = this.page.locator(selector);
    if (!await checkbox.isChecked()) {
      await checkbox.check();
    }
  }

  async uncheckCheckbox(selector: string) {
    const checkbox = this.page.locator(selector);
    if (await checkbox.isChecked()) {
      await checkbox.uncheck();
    }
  }

  // Modal handling
  async isModalOpen(modalSelector: string): Promise<boolean> {
    return await this.page.locator(modalSelector).isVisible();
  }

  async closeModal(modalSelector: string) {
    const closeButton = this.page.locator(`${modalSelector} [data-testid="close-modal"]`);
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }

  async clickModalBackground(modalSelector: string) {
    const modalOverlay = this.page.locator(`${modalSelector} [data-testid="modal-overlay"]`);
    if (await modalOverlay.isVisible()) {
      await modalOverlay.click();
    }
  }

  // Scroll helpers
  async scrollToTop() {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async scrollToElement(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  // Viewport helpers
  async isMobile(): Promise<boolean> {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width < 768 : false;
  }

  async isTablet(): Promise<boolean> {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width >= 768 && viewport.width < 1024 : false;
  }

  async isDesktop(): Promise<boolean> {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width >= 1024 : false;
  }

  // Keyboard navigation helpers
  async pressEscape() {
    await this.page.keyboard.press('Escape');
  }

  async pressEnter() {
    await this.page.keyboard.press('Enter');
  }

  async pressTab() {
    await this.page.keyboard.press('Tab');
  }

  async pressShiftTab() {
    await this.page.keyboard.press('Shift+Tab');
  }

  // Screenshot helpers
  async takeScreenshot(name?: string) {
    const screenshotName = name || `screenshot-${Date.now()}.png`;
    await this.page.screenshot({ 
      path: `test-results/screenshots/${screenshotName}`,
      fullPage: true 
    });
  }

  async takeElementScreenshot(selector: string, name?: string) {
    const screenshotName = name || `element-screenshot-${Date.now()}.png`;
    const element = this.page.locator(selector);
    await element.screenshot({ 
      path: `test-results/screenshots/${screenshotName}`
    });
  }

  // Accessibility helpers
  async checkFocusOrder(selectors: string[]): Promise<boolean> {
    for (let i = 0; i < selectors.length; i++) {
      await this.page.keyboard.press('Tab');
      const focusedElement = this.page.locator(':focus');
      const expectedElement = this.page.locator(selectors[i]);
      
      if (!await focusedElement.isVisible() || !await expectedElement.isVisible()) {
        return false;
      }
    }
    return true;
  }

  async hasAriaLabel(selector: string): Promise<boolean> {
    const element = this.page.locator(selector);
    const ariaLabel = await element.getAttribute('aria-label');
    return ariaLabel !== null && ariaLabel.length > 0;
  }

  async hasProperHeadingStructure(): Promise<boolean> {
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    return headings.length > 0;
  }

  // Network helpers
  async waitForApiResponse(urlPattern: string, timeout = 10000) {
    return await this.page.waitForResponse(
      response => response.url().includes(urlPattern) && response.status() === 200,
      { timeout }
    );
  }

  async mockApiResponse(urlPattern: string, responseData: any, status = 200) {
    await this.page.route(urlPattern, route => {
      route.fulfill({
        status,
        body: JSON.stringify(responseData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  }

  // Assertion helpers
  async expectToBeVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async expectToHaveText(selector: string, text: string) {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  async expectToHaveValue(selector: string, value: string) {
    await expect(this.page.locator(selector)).toHaveValue(value);
  }

  async expectToBeEnabled(selector: string) {
    await expect(this.page.locator(selector)).toBeEnabled();
  }

  async expectToBeDisabled(selector: string) {
    await expect(this.page.locator(selector)).toBeDisabled();
  }

  // Cleanup helpers
  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  async clearSessionStorage() {
    await this.page.evaluate(() => sessionStorage.clear());
  }

  async clearAllStorage() {
    await this.clearLocalStorage();
    await this.clearSessionStorage();
  }
}