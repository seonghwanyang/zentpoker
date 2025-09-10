import { test, expect, testGroups, retryConfig } from '../fixtures';

test.describe(testGroups.payment, () => {
  test.describe.configure(retryConfig.payment);

  test('should display voucher purchase page correctly', async ({ memberPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToVoucherPurchase();

    // Check page elements
    await expect(memberPage).toHaveTitle(/바우처 구매|Voucher Purchase/);
    await expect(memberPage.locator('[data-testid="voucher-purchase-form"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="voucher-list"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="current-balance"]')).toBeVisible();
  });

  test('should display available vouchers', async ({ memberPage, navigationHelper, apiHelper }) => {
    const nav = new navigationHelper.constructor(memberPage);
    const api = new apiHelper.constructor(memberPage);
    
    await nav.goToVoucherPurchase();

    // Mock voucher data
    await api.mockApiResponse('**/api/vouchers/list', {
      vouchers: [
        {
          id: 'voucher-1',
          name: '1000P 바우처',
          description: '1000 포인트 바우처',
          price: 5000,
          value: 1000,
          type: 'POINTS',
          isActive: true,
        },
        {
          id: 'voucher-2',
          name: '5000P 바우처',
          description: '5000 포인트 바우처',
          price: 20000,
          value: 5000,
          type: 'POINTS',
          isActive: true,
        }
      ]
    });

    await memberPage.reload();

    // Check voucher cards are displayed
    const voucherCards = memberPage.locator('[data-testid="voucher-card"]');
    await expect(voucherCards).toHaveCount(2);

    // Check voucher details
    await expect(voucherCards.first()).toContainText('1000P 바우처');
    await expect(voucherCards.first()).toContainText('5,000원');
  });

  test('should successfully purchase voucher with sufficient balance', async ({ 
    memberPage, 
    navigationHelper, 
    apiHelper, 
    databaseHelper 
  }) => {
    const nav = new navigationHelper.constructor(memberPage);
    const api = new apiHelper.constructor(memberPage);
    
    await nav.goToVoucherPurchase();

    // Ensure user has sufficient balance
    await databaseHelper.updateUserPoints('member@zentpoker.test', 10000);

    // Mock successful purchase
    await api.mockApiResponse('**/api/vouchers/purchase', {
      success: true,
      voucherId: 'voucher-1',
      transactionId: 'tx-123',
      remainingBalance: 5000,
    });

    // Select voucher and purchase
    const firstVoucher = memberPage.locator('[data-testid="voucher-card"]').first();
    await firstVoucher.locator('[data-testid="purchase-button"]').click();

    // Confirm purchase in modal
    await expect(memberPage.locator('[data-testid="purchase-modal"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="voucher-details"]')).toContainText('1000P 바우처');
    await expect(memberPage.locator('[data-testid="purchase-amount"]')).toContainText('5,000원');

    await memberPage.locator('[data-testid="confirm-purchase"]').click();

    // Check success state
    await expect(memberPage.locator('[data-testid="purchase-success"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="success-message"]')).toContainText('구매가 완료되었습니다');

    // Check balance update
    await expect(memberPage.locator('[data-testid="current-balance"]')).toContainText('5,000P');
  });

  test('should prevent purchase with insufficient balance', async ({ 
    memberPage, 
    navigationHelper, 
    databaseHelper 
  }) => {
    const nav = new navigationHelper.constructor(memberPage);
    
    await nav.goToVoucherPurchase();

    // Set insufficient balance
    await databaseHelper.updateUserPoints('member@zentpoker.test', 1000);
    await memberPage.reload();

    // Try to purchase expensive voucher
    const expensiveVoucher = memberPage.locator('[data-testid="voucher-card"]').last();
    const purchaseButton = expensiveVoucher.locator('[data-testid="purchase-button"]');

    // Button should be disabled
    await expect(purchaseButton).toBeDisabled();
    
    // Should show insufficient balance message
    await expect(expensiveVoucher.locator('[data-testid="insufficient-balance"]')).toBeVisible();
    await expect(expensiveVoucher.locator('[data-testid="insufficient-balance"]')).toContainText('포인트 부족');
  });

  test('should handle purchase errors gracefully', async ({ 
    memberPage, 
    navigationHelper, 
    apiHelper 
  }) => {
    const nav = new navigationHelper.constructor(memberPage);
    const api = new apiHelper.constructor(memberPage);
    
    await nav.goToVoucherPurchase();

    // Mock purchase failure
    await api.mockApiResponse('**/api/vouchers/purchase', {
      error: '바우처 구매에 실패했습니다',
    }, 400);

    // Attempt purchase
    const firstVoucher = memberPage.locator('[data-testid="voucher-card"]').first();
    await firstVoucher.locator('[data-testid="purchase-button"]').click();

    // Confirm purchase
    await memberPage.locator('[data-testid="confirm-purchase"]').click();

    // Check error handling
    await expect(memberPage.locator('[data-testid="purchase-error"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="error-message"]')).toContainText('바우처 구매에 실패했습니다');

    // Modal should remain open for retry
    await expect(memberPage.locator('[data-testid="purchase-modal"]')).toBeVisible();
  });

  test('should validate voucher quantity selection', async ({ memberPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToVoucherPurchase();

    const firstVoucher = memberPage.locator('[data-testid="voucher-card"]').first();
    await firstVoucher.locator('[data-testid="purchase-button"]').click();

    const quantityInput = memberPage.locator('[data-testid="quantity-input"]');
    const confirmButton = memberPage.locator('[data-testid="confirm-purchase"]');

    // Test invalid quantities
    await quantityInput.fill('0');
    await expect(memberPage.locator('[data-testid="quantity-error"]')).toContainText('최소 1개');
    await expect(confirmButton).toBeDisabled();

    await quantityInput.fill('101');
    await expect(memberPage.locator('[data-testid="quantity-error"]')).toContainText('최대 100개');
    await expect(confirmButton).toBeDisabled();

    await quantityInput.fill('-1');
    await expect(memberPage.locator('[data-testid="quantity-error"]')).toContainText('올바른 수량');
    await expect(confirmButton).toBeDisabled();

    // Test valid quantity
    await quantityInput.fill('5');
    await expect(memberPage.locator('[data-testid="quantity-error"]')).not.toBeVisible();
    await expect(confirmButton).toBeEnabled();

    // Check total calculation
    await expect(memberPage.locator('[data-testid="total-amount"]')).toContainText('25,000원'); // 5000 * 5
  });

  test('should display purchase confirmation modal correctly', async ({ 
    memberPage, 
    navigationHelper 
  }) => {
    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToVoucherPurchase();

    // Open purchase modal
    const firstVoucher = memberPage.locator('[data-testid="voucher-card"]').first();
    await firstVoucher.locator('[data-testid="purchase-button"]').click();

    const modal = memberPage.locator('[data-testid="purchase-modal"]');
    await expect(modal).toBeVisible();

    // Check modal elements
    await expect(modal.locator('[data-testid="modal-title"]')).toContainText('바우처 구매');
    await expect(modal.locator('[data-testid="voucher-details"]')).toBeVisible();
    await expect(modal.locator('[data-testid="quantity-input"]')).toHaveValue('1');
    await expect(modal.locator('[data-testid="total-amount"]')).toBeVisible();
    await expect(modal.locator('[data-testid="current-balance"]')).toBeVisible();
    await expect(modal.locator('[data-testid="remaining-balance"]')).toBeVisible();

    // Check action buttons
    await expect(modal.locator('[data-testid="cancel-purchase"]')).toBeVisible();
    await expect(modal.locator('[data-testid="confirm-purchase"]')).toBeVisible();
  });

  test('should cancel purchase correctly', async ({ memberPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToVoucherPurchase();

    // Open purchase modal
    const firstVoucher = memberPage.locator('[data-testid="voucher-card"]').first();
    await firstVoucher.locator('[data-testid="purchase-button"]').click();

    await expect(memberPage.locator('[data-testid="purchase-modal"]')).toBeVisible();

    // Cancel purchase
    await memberPage.locator('[data-testid="cancel-purchase"]').click();

    // Modal should close
    await expect(memberPage.locator('[data-testid="purchase-modal"]')).not.toBeVisible();

    // Should remain on purchase page
    await expect(memberPage).toHaveURL(/\/vouchers\/purchase/);
  });

  test('should handle network errors during purchase', async ({ 
    memberPage, 
    navigationHelper 
  }) => {
    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToVoucherPurchase();

    // Mock network failure
    await memberPage.route('**/api/vouchers/purchase', route => {
      route.abort();
    });

    // Attempt purchase
    const firstVoucher = memberPage.locator('[data-testid="voucher-card"]').first();
    await firstVoucher.locator('[data-testid="purchase-button"]').click();
    await memberPage.locator('[data-testid="confirm-purchase"]').click();

    // Check network error handling
    await expect(memberPage.locator('[data-testid="network-error"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="error-message"]')).toContainText('네트워크 오류');
  });

  test('should display purchase history', async ({ 
    memberPage, 
    navigationHelper, 
    databaseHelper 
  }) => {
    // Create test purchase history
    const testUser = await databaseHelper.getUserByEmail('member@zentpoker.test');
    if (testUser) {
      const voucher = await databaseHelper.createTestVoucher({
        code: 'PURCHASED-VOUCHER',
        value: 1000,
      });
      
      await databaseHelper.useVoucher(testUser.email, voucher.code);
    }

    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToVoucherPurchase();

    // Navigate to history tab
    await memberPage.locator('[data-testid="history-tab"]').click();

    // Check history display
    const historySection = memberPage.locator('[data-testid="purchase-history"]');
    await expect(historySection).toBeVisible();

    const historyEntries = memberPage.locator('[data-testid="history-entry"]');
    await expect(historyEntries.first()).toBeVisible();
    await expect(historyEntries.first()).toContainText('PURCHASED-VOUCHER');
  });

  test('should show loading states during purchase', async ({ 
    memberPage, 
    navigationHelper,
    apiHelper 
  }) => {
    const nav = new navigationHelper.constructor(memberPage);
    const api = new apiHelper.constructor(memberPage);
    
    await nav.goToVoucherPurchase();

    // Mock delayed response
    await memberPage.route('**/api/vouchers/purchase', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true }),
        });
      }, 2000);
    });

    // Start purchase
    const firstVoucher = memberPage.locator('[data-testid="voucher-card"]').first();
    await firstVoucher.locator('[data-testid="purchase-button"]').click();
    
    const confirmButton = memberPage.locator('[data-testid="confirm-purchase"]');
    await confirmButton.click();

    // Check loading states
    await expect(confirmButton).toBeDisabled();
    await expect(confirmButton).toContainText('처리 중...');
    await expect(memberPage.locator('[data-testid="loading-spinner"]')).toBeVisible();

    // Should prevent modal close during processing
    const cancelButton = memberPage.locator('[data-testid="cancel-purchase"]');
    await expect(cancelButton).toBeDisabled();
  });

  test('should handle multiple voucher types', async ({ 
    memberPage, 
    navigationHelper, 
    apiHelper 
  }) => {
    const nav = new navigationHelper.constructor(memberPage);
    const api = new apiHelper.constructor(memberPage);
    
    await nav.goToVoucherPurchase();

    // Mock different voucher types
    await api.mockApiResponse('**/api/vouchers/list', {
      vouchers: [
        {
          id: 'points-voucher',
          name: '포인트 바우처',
          type: 'POINTS',
          value: 1000,
          price: 5000,
        },
        {
          id: 'discount-voucher',
          name: '할인 바우처',
          type: 'DISCOUNT',
          value: 20, // 20% discount
          price: 3000,
        }
      ]
    });

    await memberPage.reload();

    // Check voucher type indicators
    const pointsVoucher = memberPage.locator('[data-testid="voucher-card"]').first();
    await expect(pointsVoucher.locator('[data-testid="voucher-type"]')).toContainText('포인트');
    await expect(pointsVoucher.locator('[data-testid="voucher-value"]')).toContainText('1,000P');

    const discountVoucher = memberPage.locator('[data-testid="voucher-card"]').last();
    await expect(discountVoucher.locator('[data-testid="voucher-type"]')).toContainText('할인');
    await expect(discountVoucher.locator('[data-testid="voucher-value"]')).toContainText('20%');
  });
});