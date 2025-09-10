import { test, expect, testGroups, retryConfig } from '../fixtures';

test.describe(testGroups.payment, () => {
  test.describe.configure(retryConfig.payment);

  test('should display point charge page correctly', async ({ memberPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToPointCharge();

    // Check page elements
    await expect(memberPage).toHaveTitle(/포인트 충전|Point Charge/);
    await expect(memberPage.locator('[data-testid="point-charge-form"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="amount-input"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="payment-method-selector"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="charge-button"]')).toBeVisible();

    // Check current balance display
    await expect(memberPage.locator('[data-testid="current-balance"]')).toBeVisible();
    
    // Check pricing information
    await expect(memberPage.locator('[data-testid="pricing-info"]')).toBeVisible();
  });

  test('should validate charge amount input', async ({ memberPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToPointCharge();

    const amountInput = memberPage.locator('[data-testid="amount-input"]');
    const chargeButton = memberPage.locator('[data-testid="charge-button"]');

    // Test invalid inputs
    await amountInput.fill('0');
    await expect(memberPage.locator('[data-testid="amount-error"]')).toContainText('최소 충전 금액');

    await amountInput.fill('-1000');
    await expect(memberPage.locator('[data-testid="amount-error"]')).toContainText('올바른 금액');

    await amountInput.fill('999999999');
    await expect(memberPage.locator('[data-testid="amount-error"]')).toContainText('최대 충전 금액');

    // Test valid input
    await amountInput.fill('10000');
    await expect(memberPage.locator('[data-testid="amount-error"]')).not.toBeVisible();
    await expect(chargeButton).toBeEnabled();
  });

  test('should successfully charge points via KakaoPay', async ({ 
    memberPage, 
    navigationHelper, 
    apiHelper, 
    databaseHelper 
  }) => {
    const nav = new navigationHelper.constructor(memberPage);
    const api = new apiHelper.constructor(memberPage);
    
    await nav.goToPointCharge();

    // Get initial balance
    const initialBalance = await api.getPointsBalance();

    // Fill charge form
    await memberPage.locator('[data-testid="amount-input"]').fill('10000');
    await memberPage.locator('[data-testid="payment-method-kakao"]').click();

    // Mock KakaoPay success response
    await api.simulateKakaoPaySuccess({
      amount: 10000,
      points: 1000,
    });

    // Submit charge request
    await memberPage.locator('[data-testid="charge-button"]').click();

    // Should redirect to KakaoPay payment page (mocked)
    await expect(memberPage.locator('[data-testid="payment-processing"]')).toBeVisible();

    // Wait for payment completion
    await expect(memberPage.locator('[data-testid="payment-success"]')).toBeVisible({ timeout: 30000 });

    // Verify success message
    await expect(memberPage.locator('[data-testid="success-message"]')).toContainText('충전이 완료되었습니다');

    // Verify balance update
    const newBalance = await api.getPointsBalance();
    expect(newBalance).toBe(initialBalance + 1000);

    // Verify transaction record
    const transactions = await api.getPointTransactions();
    const latestTransaction = transactions[0];
    expect(latestTransaction.type).toBe('CHARGE');
    expect(latestTransaction.amount).toBe(1000);
  });

  test('should handle KakaoPay payment failure', async ({ memberPage, navigationHelper, apiHelper }) => {
    const nav = new navigationHelper.constructor(memberPage);
    const api = new apiHelper.constructor(memberPage);
    
    await nav.goToPointCharge();

    // Fill form
    await memberPage.locator('[data-testid="amount-input"]').fill('10000');
    await memberPage.locator('[data-testid="payment-method-kakao"]').click();

    // Mock payment failure
    await api.simulatePaymentFailure('결제가 취소되었습니다');

    // Submit charge request
    await memberPage.locator('[data-testid="charge-button"]').click();

    // Wait for error handling
    await expect(memberPage.locator('[data-testid="payment-error"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="error-message"]')).toContainText('결제가 취소되었습니다');

    // Should stay on charge page
    await expect(memberPage).toHaveURL(/\/points\/charge/);
  });

  test('should handle network errors during payment', async ({ memberPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToPointCharge();

    // Fill form
    await memberPage.locator('[data-testid="amount-input"]').fill('10000');
    await memberPage.locator('[data-testid="payment-method-kakao"]').click();

    // Mock network failure
    await memberPage.route('**/api/points/charge', route => {
      route.abort();
    });

    // Submit request
    await memberPage.locator('[data-testid="charge-button"]').click();

    // Should show network error
    await expect(memberPage.locator('[data-testid="network-error"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="error-message"]')).toContainText('네트워크 오류');
  });

  test('should display payment history', async ({ memberPage, navigationHelper, databaseHelper }) => {
    // Create test payment history
    const testUser = await databaseHelper.getUserByEmail('member@zentpoker.test');
    if (testUser) {
      await databaseHelper.createTestPayment(testUser.email, {
        amount: 10000,
        method: 'KAKAO_PAY',
        status: 'COMPLETED',
        points: 1000,
      });
    }

    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToPointCharge();

    // Check payment history section
    const historySection = memberPage.locator('[data-testid="payment-history"]');
    await expect(historySection).toBeVisible();

    // Check history entries
    const historyEntries = memberPage.locator('[data-testid="payment-entry"]');
    await expect(historyEntries.first()).toBeVisible();

    // Check entry details
    await expect(historyEntries.first()).toContainText('10,000원');
    await expect(historyEntries.first()).toContainText('카카오페이');
    await expect(historyEntries.first()).toContainText('완료');
  });

  test('should support different charge amounts', async ({ memberPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToPointCharge();

    const testAmounts = [
      { amount: '5000', expectedPoints: '500' },
      { amount: '10000', expectedPoints: '1,000' },
      { amount: '50000', expectedPoints: '5,000' },
      { amount: '100000', expectedPoints: '10,000' },
    ];

    for (const { amount, expectedPoints } of testAmounts) {
      await memberPage.locator('[data-testid="amount-input"]').fill(amount);
      
      // Check points preview
      const pointsPreview = memberPage.locator('[data-testid="points-preview"]');
      await expect(pointsPreview).toContainText(`${expectedPoints}P`);
    }
  });

  test('should handle concurrent charge attempts', async ({ 
    memberPage, 
    navigationHelper,
    apiHelper 
  }) => {
    const nav = new navigationHelper.constructor(memberPage);
    const api = new apiHelper.constructor(memberPage);
    
    await nav.goToPointCharge();

    // Fill form
    await memberPage.locator('[data-testid="amount-input"]').fill('10000');
    await memberPage.locator('[data-testid="payment-method-kakao"]').click();

    // Mock slow API response
    await memberPage.route('**/api/points/charge', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true }),
        });
      }, 2000);
    });

    // Submit first request
    const chargeButton = memberPage.locator('[data-testid="charge-button"]');
    await chargeButton.click();

    // Button should be disabled during processing
    await expect(chargeButton).toBeDisabled();
    
    // Loading state should be shown
    await expect(memberPage.locator('[data-testid="payment-processing"]')).toBeVisible();

    // Try to submit another request (should be prevented)
    // The form should remain disabled
    await expect(chargeButton).toBeDisabled();
  });

  test('should validate payment method selection', async ({ memberPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToPointCharge();

    // Fill amount without selecting payment method
    await memberPage.locator('[data-testid="amount-input"]').fill('10000');
    
    const chargeButton = memberPage.locator('[data-testid="charge-button"]');
    await chargeButton.click();

    // Should show validation error
    await expect(memberPage.locator('[data-testid="payment-method-error"]')).toContainText('결제 방법을 선택하세요');
  });

  test('should show loading states appropriately', async ({ memberPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToPointCharge();

    // Fill form
    await memberPage.locator('[data-testid="amount-input"]').fill('10000');
    await memberPage.locator('[data-testid="payment-method-kakao"]').click();

    // Mock delayed response
    await memberPage.route('**/api/points/charge', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true }),
        });
      }, 1000);
    });

    // Submit request
    await memberPage.locator('[data-testid="charge-button"]').click();

    // Check loading states
    await expect(memberPage.locator('[data-testid="payment-processing"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Button should show loading text
    const chargeButton = memberPage.locator('[data-testid="charge-button"]');
    await expect(chargeButton).toContainText('처리 중...');
  });

  test('should handle session expiry during payment', async ({ memberPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToPointCharge();

    // Fill form
    await memberPage.locator('[data-testid="amount-input"]').fill('10000');
    await memberPage.locator('[data-testid="payment-method-kakao"]').click();

    // Mock session expiry response
    await memberPage.route('**/api/points/charge', route => {
      route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      });
    });

    // Submit request
    await memberPage.locator('[data-testid="charge-button"]').click();

    // Should redirect to login
    await expect(memberPage).toHaveURL(/\/login/);
    
    // Should show session expired message
    const sessionMessage = memberPage.locator('[data-testid="session-expired-message"]');
    if (await sessionMessage.isVisible()) {
      await expect(sessionMessage).toContainText('세션이 만료되었습니다');
    }
  });
});