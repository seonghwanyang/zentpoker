import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class PointsPage extends BasePage {
  // Points overview elements
  readonly currentBalance: Locator;
  readonly balanceCard: Locator;
  readonly chargeButton: Locator;
  readonly transactionHistory: Locator;
  readonly filterButtons: Locator;
  
  // Charge form elements
  readonly chargeForm: Locator;
  readonly amountInput: Locator;
  readonly paymentMethodSelector: Locator;
  readonly kakaoPayOption: Locator;
  readonly bankTransferOption: Locator;
  readonly submitChargeButton: Locator;
  readonly pricingInfo: Locator;
  
  // Transaction history elements
  readonly transactionTable: Locator;
  readonly transactionEntries: Locator;
  readonly paginationControls: Locator;
  readonly searchInput: Locator;
  readonly dateFilter: Locator;
  readonly typeFilter: Locator;
  
  // Payment processing elements
  readonly paymentModal: Locator;
  readonly paymentProcessing: Locator;
  readonly paymentSuccess: Locator;
  readonly paymentError: Locator;
  
  // Validation messages
  readonly amountError: Locator;
  readonly paymentMethodError: Locator;
  readonly networkError: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize points page locators
    this.currentBalance = page.locator('[data-testid="current-balance"]');
    this.balanceCard = page.locator('[data-testid="balance-card"]');
    this.chargeButton = page.locator('[data-testid="charge-button"]');
    this.transactionHistory = page.locator('[data-testid="transaction-history"]');
    this.filterButtons = page.locator('[data-testid="filter-buttons"]');
    
    // Charge form
    this.chargeForm = page.locator('[data-testid="point-charge-form"]');
    this.amountInput = page.locator('[data-testid="amount-input"]');
    this.paymentMethodSelector = page.locator('[data-testid="payment-method-selector"]');
    this.kakaoPayOption = page.locator('[data-testid="payment-method-kakao"]');
    this.bankTransferOption = page.locator('[data-testid="payment-method-bank"]');
    this.submitChargeButton = page.locator('[data-testid="submit-charge"]');
    this.pricingInfo = page.locator('[data-testid="pricing-info"]');
    
    // Transaction history
    this.transactionTable = page.locator('[data-testid="transaction-table"]');
    this.transactionEntries = page.locator('[data-testid="transaction-entry"]');
    this.paginationControls = page.locator('[data-testid="pagination"]');
    this.searchInput = page.locator('[data-testid="transaction-search"]');
    this.dateFilter = page.locator('[data-testid="date-filter"]');
    this.typeFilter = page.locator('[data-testid="type-filter"]');
    
    // Payment processing
    this.paymentModal = page.locator('[data-testid="payment-modal"]');
    this.paymentProcessing = page.locator('[data-testid="payment-processing"]');
    this.paymentSuccess = page.locator('[data-testid="payment-success"]');
    this.paymentError = page.locator('[data-testid="payment-error"]');
    
    // Validation
    this.amountError = page.locator('[data-testid="amount-error"]');
    this.paymentMethodError = page.locator('[data-testid="payment-method-error"]');
    this.networkError = page.locator('[data-testid="network-error"]');
  }

  // Navigation
  async goto() {
    await this.page.goto('/points');
    await this.waitForPageLoad();
  }

  async goToCharge() {
    await this.chargeButton.click();
    await this.waitForNavigation('/points/charge');
  }

  // Balance information
  async getCurrentBalance(): Promise<number> {
    const balanceText = await this.currentBalance.textContent();
    if (balanceText) {
      const match = balanceText.match(/[\d,]+/);
      if (match) {
        return parseInt(match[0].replace(/,/g, ''));
      }
    }
    return 0;
  }

  async isBalanceVisible(): Promise<boolean> {
    return await this.balanceCard.isVisible();
  }

  // Point charging
  async fillChargeAmount(amount: number) {
    await this.amountInput.clear();
    await this.amountInput.fill(amount.toString());
  }

  async selectPaymentMethod(method: 'kakao' | 'bank') {
    if (method === 'kakao') {
      await this.kakaoPayOption.click();
    } else {
      await this.bankTransferOption.click();
    }
  }

  async submitChargeRequest() {
    await this.submitChargeButton.click();
  }

  async chargePoints(amount: number, method: 'kakao' | 'bank' = 'kakao') {
    await this.fillChargeAmount(amount);
    await this.selectPaymentMethod(method);
    await this.submitChargeRequest();
  }

  async isChargeFormValid(): Promise<boolean> {
    const amountValue = await this.amountInput.inputValue();
    const amount = parseInt(amountValue);
    
    // Check if amount is valid
    if (isNaN(amount) || amount <= 0) {
      return false;
    }
    
    // Check if payment method is selected
    const kakaoSelected = await this.kakaoPayOption.isChecked();
    const bankSelected = await this.bankTransferOption.isChecked();
    
    return kakaoSelected || bankSelected;
  }

  async getPointsPreview(): Promise<number> {
    const previewElement = this.page.locator('[data-testid="points-preview"]');
    if (await previewElement.isVisible()) {
      const previewText = await previewElement.textContent();
      if (previewText) {
        const match = previewText.match(/[\d,]+/);
        if (match) {
          return parseInt(match[0].replace(/,/g, ''));
        }
      }
    }
    return 0;
  }

  // Payment processing
  async isPaymentProcessing(): Promise<boolean> {
    return await this.paymentProcessing.isVisible();
  }

  async waitForPaymentCompletion() {
    // Wait for either success or error
    await Promise.race([
      this.paymentSuccess.waitFor({ state: 'visible', timeout: 30000 }),
      this.paymentError.waitFor({ state: 'visible', timeout: 30000 })
    ]);
  }

  async isPaymentSuccessful(): Promise<boolean> {
    return await this.paymentSuccess.isVisible();
  }

  async hasPaymentError(): Promise<boolean> {
    return await this.paymentError.isVisible();
  }

  async getPaymentErrorMessage(): Promise<string> {
    if (await this.hasPaymentError()) {
      const errorElement = this.paymentError.locator('[data-testid="error-message"]');
      return await errorElement.textContent() || '';
    }
    return '';
  }

  // Transaction history
  async getTransactionCount(): Promise<number> {
    return await this.transactionEntries.count();
  }

  async getTransactionEntry(index: number) {
    const entry = this.transactionEntries.nth(index);
    return {
      type: await entry.locator('[data-testid="transaction-type"]').textContent(),
      amount: await entry.locator('[data-testid="transaction-amount"]').textContent(),
      date: await entry.locator('[data-testid="transaction-date"]').textContent(),
      status: await entry.locator('[data-testid="transaction-status"]').textContent(),
    };
  }

  async filterTransactionsByType(type: 'all' | 'charge' | 'use' | 'refund') {
    await this.typeFilter.click();
    const option = this.page.locator(`[data-testid="filter-${type}"]`);
    await option.click();
    await this.waitForLoadingToComplete();
  }

  async filterTransactionsByDate(startDate?: string, endDate?: string) {
    const startDateInput = this.dateFilter.locator('[data-testid="start-date"]');
    const endDateInput = this.dateFilter.locator('[data-testid="end-date"]');
    
    if (startDate) {
      await startDateInput.fill(startDate);
    }
    
    if (endDate) {
      await endDateInput.fill(endDate);
    }
    
    const applyButton = this.dateFilter.locator('[data-testid="apply-filter"]');
    await applyButton.click();
    await this.waitForLoadingToComplete();
  }

  async searchTransactions(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.waitForLoadingToComplete();
  }

  async clearTransactionFilters() {
    const clearButton = this.page.locator('[data-testid="clear-filters"]');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await this.waitForLoadingToComplete();
    }
  }

  // Pagination
  async goToNextPage() {
    const nextButton = this.paginationControls.locator('[data-testid="next-page"]');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await this.waitForLoadingToComplete();
      return true;
    }
    return false;
  }

  async goToPreviousPage() {
    const prevButton = this.paginationControls.locator('[data-testid="prev-page"]');
    if (await prevButton.isEnabled()) {
      await prevButton.click();
      await this.waitForLoadingToComplete();
      return true;
    }
    return false;
  }

  async goToPage(pageNumber: number) {
    const pageButton = this.paginationControls.locator(`[data-testid="page-${pageNumber}"]`);
    if (await pageButton.isVisible()) {
      await pageButton.click();
      await this.waitForLoadingToComplete();
      return true;
    }
    return false;
  }

  async getCurrentPage(): Promise<number> {
    const activePageButton = this.paginationControls.locator('[data-testid="active-page"]');
    if (await activePageButton.isVisible()) {
      const pageText = await activePageButton.textContent();
      return pageText ? parseInt(pageText) : 1;
    }
    return 1;
  }

  // Validation
  async hasAmountError(): Promise<boolean> {
    return await this.amountError.isVisible();
  }

  async getAmountErrorMessage(): Promise<string> {
    if (await this.hasAmountError()) {
      return await this.amountError.textContent() || '';
    }
    return '';
  }

  async hasPaymentMethodError(): Promise<boolean> {
    return await this.paymentMethodError.isVisible();
  }

  async getPaymentMethodErrorMessage(): Promise<string> {
    if (await this.hasPaymentMethodError()) {
      return await this.paymentMethodError.textContent() || '';
    }
    return '';
  }

  // Pricing information
  async isPricingInfoVisible(): Promise<boolean> {
    return await this.pricingInfo.isVisible();
  }

  async getPricingRates(): Promise<{ amount: number; points: number; rate: string }[]> {
    const rates: { amount: number; points: number; rate: string }[] = [];
    const rateEntries = this.pricingInfo.locator('[data-testid="pricing-rate"]');
    const count = await rateEntries.count();
    
    for (let i = 0; i < count; i++) {
      const entry = rateEntries.nth(i);
      const amount = await entry.locator('[data-testid="rate-amount"]').textContent();
      const points = await entry.locator('[data-testid="rate-points"]').textContent();
      const rate = await entry.locator('[data-testid="rate-percent"]').textContent();
      
      rates.push({
        amount: amount ? parseInt(amount.replace(/[^0-9]/g, '')) : 0,
        points: points ? parseInt(points.replace(/[^0-9]/g, '')) : 0,
        rate: rate || '',
      });
    }
    
    return rates;
  }

  // Mobile specific actions
  async toggleTransactionFilters() {
    if (await this.isMobile()) {
      const toggleButton = this.page.locator('[data-testid="toggle-filters"]');
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
      }
    }
  }

  // Export/Download
  async downloadTransactionHistory() {
    const downloadButton = this.page.locator('[data-testid="download-history"]');
    if (await downloadButton.isVisible()) {
      await downloadButton.click();
      // Wait for download to start
      await this.page.waitForTimeout(1000);
      return true;
    }
    return false;
  }

  // Refresh data
  async refreshTransactionHistory() {
    const refreshButton = this.page.locator('[data-testid="refresh-transactions"]');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await this.waitForLoadingToComplete();
    }
  }
}