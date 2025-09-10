import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  // Page elements
  readonly loginForm: Locator;
  readonly googleLoginButton: Locator;
  readonly kakaoLoginButton: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;
  readonly homeLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.loginForm = page.locator('[data-testid="login-form"]');
    this.googleLoginButton = page.locator('[data-testid="google-login-button"]');
    this.kakaoLoginButton = page.locator('[data-testid="kakao-login-button"]');
    this.emailInput = page.locator('[data-testid="email-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.registerLink = page.locator('[data-testid="register-link"]');
    this.homeLink = page.locator('[data-testid="home-link"]');
    this.forgotPasswordLink = page.locator('[data-testid="forgot-password-link"]');
    this.errorMessage = page.locator('[data-testid="login-error"]');
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
  }

  // Navigation
  async goto() {
    await this.page.goto('/login');
    await this.waitForPageLoad();
  }

  // Authentication actions
  async loginWithGoogle() {
    await this.googleLoginButton.click();
    // Wait for OAuth redirect or mock handling
    await this.waitForNavigation();
  }

  async loginWithKakao() {
    await this.kakaoLoginButton.click();
    await this.waitForNavigation();
  }

  async loginWithCredentials(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.waitForNavigation();
  }

  // Navigation actions
  async goToRegister() {
    await this.registerLink.click();
    await this.waitForNavigation('/register');
  }

  async goToHome() {
    await this.homeLink.click();
    await this.waitForNavigation('/');
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
    await this.waitForNavigation('/forgot-password');
  }

  // Validation methods
  async isFormVisible(): Promise<boolean> {
    return await this.loginForm.isVisible();
  }

  async isGoogleLoginAvailable(): Promise<boolean> {
    return await this.googleLoginButton.isVisible();
  }

  async isKakaoLoginAvailable(): Promise<boolean> {
    return await this.kakaoLoginButton.isVisible();
  }

  async hasError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  async getErrorMessage(): Promise<string> {
    if (await this.hasError()) {
      return await this.errorMessage.textContent() || '';
    }
    return '';
  }

  async isLoading(): Promise<boolean> {
    return await this.loadingSpinner.isVisible();
  }

  // Form validation
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.loginButton.isEnabled();
  }

  async isEmailValid(): Promise<boolean> {
    const emailValue = await this.emailInput.inputValue();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  }

  async hasPasswordMinLength(): Promise<boolean> {
    const passwordValue = await this.passwordInput.inputValue();
    return passwordValue.length >= 8;
  }

  // Helper methods
  async clearForm() {
    await this.emailInput.clear();
    await this.passwordInput.clear();
  }

  async fillForm(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submitForm() {
    await this.loginButton.click();
  }

  // Mock OAuth responses for testing
  async mockGoogleOAuth(userData: { email: string; name: string; id: string }) {
    await this.page.route('**/api/auth/callback/google', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          user: userData,
          url: '/dashboard',
        }),
      });
    });
  }

  async mockKakaoOAuth(userData: { email: string; name: string; id: string }) {
    await this.page.route('**/api/auth/callback/kakao', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          user: userData,
          url: '/dashboard',
        }),
      });
    });
  }

  async mockOAuthError(provider: 'google' | 'kakao', errorMessage: string) {
    await this.page.route(`**/api/auth/callback/${provider}`, route => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({
          error: errorMessage,
        }),
      });
    });
  }

  // Wait for authentication completion
  async waitForAuthenticationComplete() {
    // Wait for redirect to dashboard or success page
    await this.page.waitForURL(url => 
      url.pathname.includes('/dashboard') || 
      url.pathname.includes('/profile') ||
      url.pathname === '/'
    );
  }

  // Accessibility helpers
  async isKeyboardNavigable(): Promise<boolean> {
    // Test tab navigation through form elements
    await this.page.keyboard.press('Tab');
    const focusedElement = await this.page.locator(':focus').elementHandle();
    return focusedElement !== null;
  }

  async submitWithEnterKey() {
    await this.passwordInput.press('Enter');
  }

  // Mobile responsive helpers
  async isMobileLayout(): Promise<boolean> {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width < 768 : false;
  }

  async togglePasswordVisibility() {
    const toggleButton = this.page.locator('[data-testid="password-toggle"]');
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
    }
  }
}