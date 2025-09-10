import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class VouchersPage extends BasePage {
  // Voucher overview elements
  readonly vouchersList: Locator;
  readonly voucherCards: Locator;
  readonly purchaseButton: Locator;
  readonly filterTabs: Locator;
  readonly searchInput: Locator;
  
  // Purchase form elements
  readonly purchaseModal: Locator;
  readonly purchaseForm: Locator;
  readonly quantityInput: Locator;
  readonly totalAmount: Locator;
  readonly currentBalance: Locator;
  readonly remainingBalance: Locator;
  readonly confirmPurchaseButton: Locator;
  readonly cancelPurchaseButton: Locator;
  
  // Voucher details
  readonly voucherName: Locator;
  readonly voucherDescription: Locator;
  readonly voucherPrice: Locator;
  readonly voucherValue: Locator;
  readonly voucherType: Locator;
  readonly voucherExpiry: Locator;
  
  // Purchase history elements
  readonly historyTab: Locator;
  readonly purchaseHistory: Locator;
  readonly historyEntries: Locator;
  readonly historyPagination: Locator;
  
  // Status and feedback elements
  readonly purchaseSuccess: Locator;
  readonly purchaseError: Locator;
  readonly insufficientBalance: Locator;
  readonly loadingSpinner: Locator;
  
  // Validation messages
  readonly quantityError: Locator;
  readonly networkError: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize voucher page locators
    this.vouchersList = page.locator('[data-testid="voucher-list"]');
    this.voucherCards = page.locator('[data-testid="voucher-card"]');
    this.purchaseButton = page.locator('[data-testid="purchase-button"]');
    this.filterTabs = page.locator('[data-testid="voucher-filters"]');
    this.searchInput = page.locator('[data-testid="voucher-search"]');
    
    // Purchase modal
    this.purchaseModal = page.locator('[data-testid="purchase-modal"]');
    this.purchaseForm = page.locator('[data-testid="voucher-purchase-form"]');
    this.quantityInput = page.locator('[data-testid="quantity-input"]');
    this.totalAmount = page.locator('[data-testid="total-amount"]');
    this.currentBalance = page.locator('[data-testid="current-balance"]');
    this.remainingBalance = page.locator('[data-testid="remaining-balance"]');
    this.confirmPurchaseButton = page.locator('[data-testid="confirm-purchase"]');
    this.cancelPurchaseButton = page.locator('[data-testid="cancel-purchase"]');
    
    // Voucher details
    this.voucherName = page.locator('[data-testid="voucher-name"]');
    this.voucherDescription = page.locator('[data-testid="voucher-description"]');
    this.voucherPrice = page.locator('[data-testid="voucher-price"]');
    this.voucherValue = page.locator('[data-testid="voucher-value"]');
    this.voucherType = page.locator('[data-testid="voucher-type"]');
    this.voucherExpiry = page.locator('[data-testid="voucher-expiry"]');
    
    // History
    this.historyTab = page.locator('[data-testid="history-tab"]');
    this.purchaseHistory = page.locator('[data-testid="purchase-history"]');
    this.historyEntries = page.locator('[data-testid="history-entry"]');
    this.historyPagination = page.locator('[data-testid="history-pagination"]');
    
    // Status elements
    this.purchaseSuccess = page.locator('[data-testid="purchase-success"]');
    this.purchaseError = page.locator('[data-testid="purchase-error"]');
    this.insufficientBalance = page.locator('[data-testid="insufficient-balance"]');
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    
    // Validation
    this.quantityError = page.locator('[data-testid="quantity-error"]');
    this.networkError = page.locator('[data-testid="network-error"]');
  }

  // Navigation
  async goto() {
    await this.page.goto('/vouchers');
    await this.waitForPageLoad();
  }

  async goToPurchasePage() {
    await this.page.goto('/vouchers/purchase');
    await this.waitForPageLoad();
  }

  // Voucher browsing
  async getVoucherCount(): Promise<number> {
    await this.waitForLoadingToComplete();
    return await this.voucherCards.count();
  }

  async getVoucherDetails(index: number) {
    const voucherCard = this.voucherCards.nth(index);
    
    return {
      name: await voucherCard.locator('[data-testid="voucher-name"]').textContent() || '',
      description: await voucherCard.locator('[data-testid="voucher-description"]').textContent() || '',
      price: await this.extractNumber(await voucherCard.locator('[data-testid="voucher-price"]').textContent() || ''),
      value: await this.extractNumber(await voucherCard.locator('[data-testid="voucher-value"]').textContent() || ''),
      type: await voucherCard.locator('[data-testid="voucher-type"]').textContent() || '',
    };
  }

  async selectVoucher(index: number) {
    const voucherCard = this.voucherCards.nth(index);
    const purchaseButton = voucherCard.locator('[data-testid="purchase-button"]');
    await purchaseButton.click();
    await this.purchaseModal.waitFor({ state: 'visible' });
  }

  async filterVouchersByType(type: 'all' | 'points' | 'discount') {
    const filterButton = this.filterTabs.locator(`[data-testid="filter-${type}"]`);
    await filterButton.click();
    await this.waitForLoadingToComplete();
  }

  async searchVouchers(query: string) {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.waitForLoadingToComplete();
  }

  // Purchase process
  async isPurchaseModalOpen(): Promise<boolean> {
    return await this.purchaseModal.isVisible();
  }

  async setQuantity(quantity: number) {
    await this.quantityInput.clear();
    await this.quantityInput.fill(quantity.toString());
    
    // Wait for total calculation to update
    await this.page.waitForTimeout(500);
  }

  async getQuantity(): Promise<number> {
    const quantityValue = await this.quantityInput.inputValue();
    return parseInt(quantityValue) || 0;
  }

  async getTotalAmount(): Promise<number> {
    const totalText = await this.totalAmount.textContent();
    return this.extractNumber(totalText || '');
  }

  async getCurrentBalance(): Promise<number> {
    const balanceText = await this.currentBalance.textContent();
    return this.extractNumber(balanceText || '');
  }

  async getRemainingBalance(): Promise<number> {
    const remainingText = await this.remainingBalance.textContent();
    return this.extractNumber(remainingText || '');
  }

  async confirmPurchase() {
    await this.confirmPurchaseButton.click();
    await this.waitForLoadingToComplete();
  }

  async cancelPurchase() {
    await this.cancelPurchaseButton.click();
    await this.purchaseModal.waitFor({ state: 'hidden' });
  }

  async purchaseVoucher(voucherIndex: number, quantity: number = 1) {
    await this.selectVoucher(voucherIndex);
    await this.setQuantity(quantity);
    await this.confirmPurchase();
  }

  // Purchase validation
  async isPurchaseFormValid(): Promise<boolean> {
    const quantity = await this.getQuantity();
    const totalAmount = await this.getTotalAmount();
    const currentBalance = await this.getCurrentBalance();
    
    return quantity > 0 && totalAmount <= currentBalance;
  }

  async canPurchaseVoucher(voucherIndex: number): Promise<boolean> {
    const voucherCard = this.voucherCards.nth(voucherIndex);
    const purchaseButton = voucherCard.locator('[data-testid="purchase-button"]');
    
    return await purchaseButton.isEnabled();
  }

  async hasInsufficientBalance(voucherIndex: number): Promise<boolean> {
    const voucherCard = this.voucherCards.nth(voucherIndex);
    const insufficientBalanceIndicator = voucherCard.locator('[data-testid="insufficient-balance"]');
    
    return await insufficientBalanceIndicator.isVisible();
  }

  // Purchase status
  async isPurchaseProcessing(): Promise<boolean> {
    return await this.loadingSpinner.isVisible();
  }

  async isPurchaseSuccessful(): Promise<boolean> {
    return await this.purchaseSuccess.isVisible();
  }

  async hasPurchaseError(): Promise<boolean> {
    return await this.purchaseError.isVisible();
  }

  async getPurchaseErrorMessage(): Promise<string> {
    if (await this.hasPurchaseError()) {
      const errorMessageElement = this.purchaseError.locator('[data-testid="error-message"]');
      return await errorMessageElement.textContent() || '';
    }
    return '';
  }

  async getPurchaseSuccessMessage(): Promise<string> {
    if (await this.isPurchaseSuccessful()) {
      const successMessageElement = this.purchaseSuccess.locator('[data-testid="success-message"]');
      return await successMessageElement.textContent() || '';
    }
    return '';
  }

  // Purchase history
  async goToHistoryTab() {
    await this.historyTab.click();
    await this.waitForLoadingToComplete();
  }

  async getPurchaseHistoryCount(): Promise<number> {
    if (await this.purchaseHistory.isVisible()) {
      return await this.historyEntries.count();
    }
    return 0;
  }

  async getHistoryEntry(index: number) {
    const entry = this.historyEntries.nth(index);
    
    return {
      voucherName: await entry.locator('[data-testid="history-voucher-name"]').textContent() || '',
      quantity: await this.extractNumber(await entry.locator('[data-testid="history-quantity"]').textContent() || ''),
      totalAmount: await this.extractNumber(await entry.locator('[data-testid="history-total"]').textContent() || ''),
      purchaseDate: await entry.locator('[data-testid="history-date"]').textContent() || '',
      status: await entry.locator('[data-testid="history-status"]').textContent() || '',
    };
  }

  // Voucher types
  async getPointsVouchers() {
    await this.filterVouchersByType('points');
    const count = await this.getVoucherCount();
    const vouchers = [];
    
    for (let i = 0; i < count; i++) {
      const details = await this.getVoucherDetails(i);
      if (details.type.toLowerCase().includes('points') || details.type.toLowerCase().includes('포인트')) {
        vouchers.push({ index: i, ...details });
      }
    }
    
    return vouchers;
  }

  async getDiscountVouchers() {
    await this.filterVouchersByType('discount');
    const count = await this.getVoucherCount();
    const vouchers = [];
    
    for (let i = 0; i < count; i++) {
      const details = await this.getVoucherDetails(i);
      if (details.type.toLowerCase().includes('discount') || details.type.toLowerCase().includes('할인')) {
        vouchers.push({ index: i, ...details });
      }
    }
    
    return vouchers;
  }

  // Validation errors
  async hasQuantityError(): Promise<boolean> {
    return await this.quantityError.isVisible();
  }

  async getQuantityErrorMessage(): Promise<string> {
    if (await this.hasQuantityError()) {
      return await this.quantityError.textContent() || '';
    }
    return '';
  }

  async hasNetworkError(): Promise<boolean> {
    return await this.networkError.isVisible();
  }

  // Helper methods
  private extractNumber(text: string): number {
    const match = text.match(/[\d,]+/);
    if (match) {
      return parseInt(match[0].replace(/,/g, ''));
    }
    return 0;
  }

  // Mobile specific actions
  async toggleVoucherFilters() {
    if (await this.isMobile()) {
      const toggleButton = this.page.locator('[data-testid="toggle-voucher-filters"]');
      if (await toggleButton.isVisible()) {
        await toggleButton.click();
      }
    }
  }

  // Voucher recommendations
  async getRecommendedVouchers() {
    const recommendedSection = this.page.locator('[data-testid="recommended-vouchers"]');
    if (await recommendedSection.isVisible()) {
      const recommendedCards = recommendedSection.locator('[data-testid="voucher-card"]');
      return await recommendedCards.count();
    }
    return 0;
  }

  async selectRecommendedVoucher(index: number) {
    const recommendedSection = this.page.locator('[data-testid="recommended-vouchers"]');
    const recommendedCard = recommendedSection.locator('[data-testid="voucher-card"]').nth(index);
    const purchaseButton = recommendedCard.locator('[data-testid="purchase-button"]');
    
    await purchaseButton.click();
    await this.purchaseModal.waitFor({ state: 'visible' });
  }

  // Sort and organize
  async sortVouchersByPrice(order: 'asc' | 'desc' = 'asc') {
    const sortButton = this.page.locator('[data-testid="sort-by-price"]');
    await sortButton.click();
    
    const sortOption = this.page.locator(`[data-testid="sort-price-${order}"]`);
    await sortOption.click();
    await this.waitForLoadingToComplete();
  }

  async sortVouchersByValue(order: 'asc' | 'desc' = 'desc') {
    const sortButton = this.page.locator('[data-testid="sort-by-value"]');
    await sortButton.click();
    
    const sortOption = this.page.locator(`[data-testid="sort-value-${order}"]`);
    await sortOption.click();
    await this.waitForLoadingToComplete();
  }

  // Refresh and reload
  async refreshVouchers() {
    const refreshButton = this.page.locator('[data-testid="refresh-vouchers"]');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await this.waitForLoadingToComplete();
    }
  }
}