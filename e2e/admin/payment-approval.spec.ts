import { test, expect, testGroups, retryConfig } from '../fixtures';

test.describe(testGroups.admin, () => {
  test.describe.configure(retryConfig.admin);

  test('should display payment confirmation page correctly for admin', async ({ 
    adminPage, 
    navigationHelper 
  }) => {
    const nav = new navigationHelper.constructor(adminPage);
    await nav.goToPaymentConfirmation();

    // Check admin access
    await expect(adminPage).toHaveTitle(/결제 승인|Payment Confirmation/);
    await expect(adminPage.locator('[data-testid="payment-confirmation-page"]')).toBeVisible();
    await expect(adminPage.locator('[data-testid="pending-payments-list"]')).toBeVisible();
    await expect(adminPage.locator('[data-testid="payment-filters"]')).toBeVisible();
  });

  test('should deny access to non-admin users', async ({ memberPage }) => {
    // Try to access admin payment confirmation page
    await memberPage.goto('/admin/payments/confirm');

    // Should redirect to unauthorized or show access denied
    const currentUrl = memberPage.url();
    expect(currentUrl).toMatch(/\/(unauthorized|403|dashboard)/);

    if (currentUrl.includes('unauthorized')) {
      await expect(memberPage.locator('[data-testid="unauthorized-message"]')).toBeVisible();
    }
  });

  test('should display pending payments correctly', async ({ 
    adminPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    // Create test payments
    const testUser = await databaseHelper.createTestUser({
      email: 'paymentuser@zentpoker.test',
      name: 'Payment Test User',
    });

    const payment1 = await databaseHelper.createTestPayment(testUser.email, {
      amount: 10000,
      method: 'KAKAO_PAY',
      status: 'PENDING',
      points: 1000,
    });

    const payment2 = await databaseHelper.createTestPayment(testUser.email, {
      amount: 50000,
      method: 'BANK_TRANSFER',
      status: 'PENDING',
      points: 5000,
    });

    const nav = new navigationHelper.constructor(adminPage);
    await nav.goToPaymentConfirmation();

    // Check payment entries are displayed
    const paymentEntries = adminPage.locator('[data-testid="payment-entry"]');
    await expect(paymentEntries).toHaveCountGreaterThan(0);

    // Check payment details
    const firstPayment = paymentEntries.first();
    await expect(firstPayment.locator('[data-testid="user-name"]')).toContainText('Payment Test User');
    await expect(firstPayment.locator('[data-testid="payment-amount"]')).toContainText('10,000');
    await expect(firstPayment.locator('[data-testid="payment-method"]')).toContainText('카카오페이');
    await expect(firstPayment.locator('[data-testid="payment-status"]')).toContainText('대기중');

    // Cleanup
    await databaseHelper.deleteTestUser(testUser.email);
  });

  test('should successfully approve payment', async ({ 
    adminPage, 
    navigationHelper,
    databaseHelper,
    apiHelper 
  }) => {
    // Create test user and payment
    const testUser = await databaseHelper.createTestUser({
      email: 'approveuser@zentpoker.test',
      name: 'Approve Test User',
      points: 1000,
    });

    const payment = await databaseHelper.createTestPayment(testUser.email, {
      amount: 20000,
      method: 'KAKAO_PAY',
      status: 'PENDING',
      points: 2000,
    });

    const nav = new navigationHelper.constructor(adminPage);
    await nav.goToPaymentConfirmation();

    // Find payment entry
    const paymentEntry = adminPage.locator('[data-testid="payment-entry"]', {
      hasText: 'Approve Test User'
    });

    // Approve payment
    await paymentEntry.locator('[data-testid="approve-button"]').click();

    // Confirm approval in modal
    const approvalModal = adminPage.locator('[data-testid="payment-approval-modal"]');
    await expect(approvalModal).toBeVisible();
    await expect(approvalModal.locator('[data-testid="payment-details"]')).toContainText('20,000원');
    await expect(approvalModal.locator('[data-testid="points-award"]')).toContainText('2,000P');

    await approvalModal.locator('[data-testid="confirm-approval"]').click();

    // Check success state
    await expect(adminPage.locator('[data-testid="approval-success"]')).toBeVisible();
    await expect(adminPage.locator('[data-testid="success-message"]')).toContainText('결제가 승인되었습니다');

    // Payment should be removed from pending list or marked as approved
    await expect(paymentEntry.locator('[data-testid="payment-status"]')).toContainText('승인됨');

    // Verify user points were updated
    const updatedUser = await databaseHelper.getUserByEmail(testUser.email);
    expect(updatedUser?.points).toBe(3000); // 1000 initial + 2000 from payment

    // Cleanup
    await databaseHelper.deleteTestUser(testUser.email);
  });

  test('should successfully reject payment', async ({ 
    adminPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    // Create test user and payment
    const testUser = await databaseHelper.createTestUser({
      email: 'rejectuser@zentpoker.test',
      name: 'Reject Test User',
      points: 1000,
    });

    const payment = await databaseHelper.createTestPayment(testUser.email, {
      amount: 15000,
      method: 'BANK_TRANSFER',
      status: 'PENDING',
      points: 1500,
    });

    const nav = new navigationHelper.constructor(adminPage);
    await nav.goToPaymentConfirmation();

    // Find payment entry
    const paymentEntry = adminPage.locator('[data-testid="payment-entry"]', {
      hasText: 'Reject Test User'
    });

    // Reject payment
    await paymentEntry.locator('[data-testid="reject-button"]').click();

    // Confirm rejection in modal
    const rejectionModal = adminPage.locator('[data-testid="payment-rejection-modal"]');
    await expect(rejectionModal).toBeVisible();
    
    // Add rejection reason
    await rejectionModal.locator('[data-testid="rejection-reason"]').fill('결제 정보 불일치');
    await rejectionModal.locator('[data-testid="confirm-rejection"]').click();

    // Check success state
    await expect(adminPage.locator('[data-testid="rejection-success"]')).toBeVisible();
    await expect(adminPage.locator('[data-testid="success-message"]')).toContainText('결제가 거절되었습니다');

    // Payment should be marked as rejected
    await expect(paymentEntry.locator('[data-testid="payment-status"]')).toContainText('거절됨');

    // Verify user points were not updated
    const updatedUser = await databaseHelper.getUserByEmail(testUser.email);
    expect(updatedUser?.points).toBe(1000); // Should remain unchanged

    // Cleanup
    await databaseHelper.deleteTestUser(testUser.email);
  });

  test('should filter payments by status', async ({ 
    adminPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    // Create payments with different statuses
    const testUser = await databaseHelper.createTestUser({
      email: 'filteruser@zentpoker.test',
      name: 'Filter Test User',
    });

    const pendingPayment = await databaseHelper.createTestPayment(testUser.email, {
      amount: 10000,
      status: 'PENDING',
    });

    const completedPayment = await databaseHelper.createTestPayment(testUser.email, {
      amount: 20000,
      status: 'COMPLETED',
    });

    const failedPayment = await databaseHelper.createTestPayment(testUser.email, {
      amount: 15000,
      status: 'FAILED',
    });

    const nav = new navigationHelper.constructor(adminPage);
    await nav.goToPaymentConfirmation();

    // Test "All" filter
    await adminPage.locator('[data-testid="filter-all"]').click();
    await expect(adminPage.locator('[data-testid="payment-entry"]')).toHaveCountGreaterThanOrEqual(3);

    // Test "Pending" filter
    await adminPage.locator('[data-testid="filter-pending"]').click();
    const pendingEntries = adminPage.locator('[data-testid="payment-entry"]');
    const pendingCount = await pendingEntries.count();
    
    for (let i = 0; i < pendingCount; i++) {
      const entry = pendingEntries.nth(i);
      await expect(entry.locator('[data-testid="payment-status"]')).toContainText('대기중');
    }

    // Test "Completed" filter
    await adminPage.locator('[data-testid="filter-completed"]').click();
    const completedEntries = adminPage.locator('[data-testid="payment-entry"]');
    const completedCount = await completedEntries.count();
    
    for (let i = 0; i < completedCount; i++) {
      const entry = completedEntries.nth(i);
      await expect(entry.locator('[data-testid="payment-status"]')).toContainText('완료');
    }

    // Cleanup
    await databaseHelper.deleteTestUser(testUser.email);
  });

  test('should filter payments by method', async ({ 
    adminPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    const testUser = await databaseHelper.createTestUser({
      email: 'methoduser@zentpoker.test',
      name: 'Method Test User',
    });

    await databaseHelper.createTestPayment(testUser.email, {
      amount: 10000,
      method: 'KAKAO_PAY',
      status: 'PENDING',
    });

    await databaseHelper.createTestPayment(testUser.email, {
      amount: 20000,
      method: 'BANK_TRANSFER',
      status: 'PENDING',
    });

    const nav = new navigationHelper.constructor(adminPage);
    await nav.goToPaymentConfirmation();

    // Filter by KakaoPay
    await adminPage.locator('[data-testid="filter-kakao-pay"]').click();
    const kakaoEntries = adminPage.locator('[data-testid="payment-entry"]');
    const kakaoCount = await kakaoEntries.count();
    
    for (let i = 0; i < kakaoCount; i++) {
      const entry = kakaoEntries.nth(i);
      await expect(entry.locator('[data-testid="payment-method"]')).toContainText('카카오페이');
    }

    // Filter by Bank Transfer
    await adminPage.locator('[data-testid="filter-bank-transfer"]').click();
    const bankEntries = adminPage.locator('[data-testid="payment-entry"]');
    const bankCount = await bankEntries.count();
    
    for (let i = 0; i < bankCount; i++) {
      const entry = bankEntries.nth(i);
      await expect(entry.locator('[data-testid="payment-method"]')).toContainText('계좌이체');
    }

    // Cleanup
    await databaseHelper.deleteTestUser(testUser.email);
  });

  test('should search payments by user', async ({ 
    adminPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    const testUser = await databaseHelper.createTestUser({
      email: 'searchuser@zentpoker.test',
      name: 'Search Test User',
    });

    await databaseHelper.createTestPayment(testUser.email, {
      amount: 10000,
      status: 'PENDING',
    });

    const nav = new navigationHelper.constructor(adminPage);
    await nav.goToPaymentConfirmation();

    // Search by user name
    const searchInput = adminPage.locator('[data-testid="user-search"]');
    await searchInput.fill('Search Test User');

    // Should show only matching payments
    const searchResults = adminPage.locator('[data-testid="payment-entry"]');
    const resultsCount = await searchResults.count();
    
    for (let i = 0; i < resultsCount; i++) {
      const entry = searchResults.nth(i);
      await expect(entry.locator('[data-testid="user-name"]')).toContainText('Search Test User');
    }

    // Clear search
    await searchInput.fill('');
    await expect(adminPage.locator('[data-testid="payment-entry"]')).toHaveCountGreaterThan(0);

    // Cleanup
    await databaseHelper.deleteTestUser(testUser.email);
  });

  test('should handle bulk payment operations', async ({ 
    adminPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    // Create multiple test payments
    const testUser = await databaseHelper.createTestUser({
      email: 'bulkuser@zentpoker.test',
      name: 'Bulk Test User',
    });

    await Promise.all([
      databaseHelper.createTestPayment(testUser.email, { amount: 10000, status: 'PENDING' }),
      databaseHelper.createTestPayment(testUser.email, { amount: 20000, status: 'PENDING' }),
      databaseHelper.createTestPayment(testUser.email, { amount: 15000, status: 'PENDING' }),
    ]);

    const nav = new navigationHelper.constructor(adminPage);
    await nav.goToPaymentConfirmation();

    // Select multiple payments
    const paymentCheckboxes = adminPage.locator('[data-testid="payment-checkbox"]');
    await paymentCheckboxes.first().click();
    await paymentCheckboxes.nth(1).click();

    // Bulk approve
    await adminPage.locator('[data-testid="bulk-approve"]').click();
    
    const bulkApprovalModal = adminPage.locator('[data-testid="bulk-approval-modal"]');
    await expect(bulkApprovalModal).toBeVisible();
    await expect(bulkApprovalModal.locator('[data-testid="selected-count"]')).toContainText('2');
    
    await bulkApprovalModal.locator('[data-testid="confirm-bulk-approval"]').click();

    // Check success message
    await expect(adminPage.locator('[data-testid="bulk-success"]')).toBeVisible();
    await expect(adminPage.locator('[data-testid="success-message"]')).toContainText('선택된 결제가 승인되었습니다');

    // Cleanup
    await databaseHelper.deleteTestUser(testUser.email);
  });

  test('should handle payment approval errors', async ({ 
    adminPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    const testUser = await databaseHelper.createTestUser({
      email: 'erroruser@zentpoker.test',
      name: 'Error Test User',
    });

    const payment = await databaseHelper.createTestPayment(testUser.email, {
      amount: 10000,
      status: 'PENDING',
    });

    const nav = new navigationHelper.constructor(adminPage);
    await nav.goToPaymentConfirmation();

    // Mock API error
    await adminPage.route('**/api/admin/payments/confirm', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({
          error: '결제 승인 처리 중 오류가 발생했습니다'
        }),
      });
    });

    // Try to approve payment
    const paymentEntry = adminPage.locator('[data-testid="payment-entry"]', {
      hasText: 'Error Test User'
    });
    await paymentEntry.locator('[data-testid="approve-button"]').click();
    await adminPage.locator('[data-testid="confirm-approval"]').click();

    // Check error handling
    await expect(adminPage.locator('[data-testid="approval-error"]')).toBeVisible();
    await expect(adminPage.locator('[data-testid="error-message"]')).toContainText('결제 승인 처리 중 오류가 발생했습니다');

    // Payment should remain in pending state
    await expect(paymentEntry.locator('[data-testid="payment-status"]')).toContainText('대기중');

    // Cleanup
    await databaseHelper.deleteTestUser(testUser.email);
  });

  test('should validate rejection reason requirement', async ({ 
    adminPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    const testUser = await databaseHelper.createTestUser({
      email: 'reasonuser@zentpoker.test',
      name: 'Reason Test User',
    });

    await databaseHelper.createTestPayment(testUser.email, {
      amount: 10000,
      status: 'PENDING',
    });

    const nav = new navigationHelper.constructor(adminPage);
    await nav.goToPaymentConfirmation();

    // Try to reject without reason
    const paymentEntry = adminPage.locator('[data-testid="payment-entry"]', {
      hasText: 'Reason Test User'
    });
    await paymentEntry.locator('[data-testid="reject-button"]').click();

    const rejectionModal = adminPage.locator('[data-testid="payment-rejection-modal"]');
    const confirmButton = rejectionModal.locator('[data-testid="confirm-rejection"]');
    
    // Confirm button should be disabled without reason
    await expect(confirmButton).toBeDisabled();

    // Add reason
    await rejectionModal.locator('[data-testid="rejection-reason"]').fill('Test rejection reason');
    await expect(confirmButton).toBeEnabled();

    // Cleanup
    await databaseHelper.deleteTestUser(testUser.email);
  });

  test('should show payment transaction history', async ({ 
    adminPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    const testUser = await databaseHelper.createTestUser({
      email: 'historyuser@zentpoker.test',
      name: 'History Test User',
    });

    const payment = await databaseHelper.createTestPayment(testUser.email, {
      amount: 10000,
      status: 'COMPLETED',
    });

    // Create related point transaction
    await databaseHelper.createPointTransaction(testUser.email, {
      type: 'CHARGE',
      amount: 1000,
      description: '결제 승인으로 인한 포인트 지급',
    });

    const nav = new navigationHelper.constructor(adminPage);
    await nav.goToPaymentConfirmation();

    // Click on payment to view details
    const paymentEntry = adminPage.locator('[data-testid="payment-entry"]', {
      hasText: 'History Test User'
    });
    await paymentEntry.locator('[data-testid="view-details"]').click();

    // Check payment details modal
    const detailsModal = adminPage.locator('[data-testid="payment-details-modal"]');
    await expect(detailsModal).toBeVisible();
    
    // Check transaction history section
    await expect(detailsModal.locator('[data-testid="transaction-history"]')).toBeVisible();
    await expect(detailsModal.locator('[data-testid="transaction-entry"]')).toBeVisible();

    // Cleanup
    await databaseHelper.deleteTestUser(testUser.email);
  });
});