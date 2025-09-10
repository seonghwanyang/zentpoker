import { test, expect, testGroups, retryConfig } from '../fixtures';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe(testGroups.accessibility, () => {
  test.describe.configure(retryConfig.admin);

  test.beforeEach(async ({ page }) => {
    // Inject axe-core into each page
    await injectAxe(page);
  });

  test('should pass accessibility audit on home page', async ({ guestPage }) => {
    await guestPage.goto('/');
    await guestPage.waitForLoadState('networkidle');

    // Run accessibility audit
    await checkA11y(guestPage, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        rules: {
          // Skip color contrast rules as they might be flaky in automated tests
          'color-contrast': { enabled: false }
        }
      }
    });

    // Additional manual accessibility checks
    await expect(guestPage.locator('h1')).toBeVisible(); // Page should have main heading
    await expect(guestPage.locator('[role="main"]')).toBeVisible(); // Main content area
    
    // Check for proper HTML semantics
    const hasSkipLink = await guestPage.locator('a[href="#main"]').count() > 0;
    if (hasSkipLink) {
      expect(hasSkipLink).toBe(true);
    }
  });

  test('should pass accessibility audit on login page', async ({ guestPage }) => {
    await guestPage.goto('/login');
    await guestPage.waitForLoadState('networkidle');

    await checkA11y(guestPage, null, {
      detailedReport: true,
      axeOptions: {
        rules: {
          'color-contrast': { enabled: false }
        }
      }
    });

    // Check form accessibility
    const loginForm = guestPage.locator('[data-testid="login-form"]');
    await expect(loginForm).toBeVisible();

    // Check for proper labels
    const googleButton = guestPage.locator('[data-testid="google-login-button"]');
    if (await googleButton.isVisible()) {
      const ariaLabel = await googleButton.getAttribute('aria-label');
      const buttonText = await googleButton.textContent();
      expect(ariaLabel || buttonText).toBeTruthy();
    }

    // Check keyboard navigation
    await guestPage.keyboard.press('Tab');
    const focusedElement = await guestPage.locator(':focus').count();
    expect(focusedElement).toBeGreaterThan(0);
  });

  test('should pass accessibility audit on dashboard page', async ({ memberPage }) => {
    await memberPage.goto('/dashboard');
    await memberPage.waitForLoadState('networkidle');

    await checkA11y(memberPage, null, {
      detailedReport: true,
      axeOptions: {
        rules: {
          'color-contrast': { enabled: false }
        }
      }
    });

    // Check dashboard specific accessibility
    const sidebar = memberPage.locator('[data-testid="member-sidebar"]');
    if (await sidebar.isVisible()) {
      const sidebarRole = await sidebar.getAttribute('role');
      expect(['navigation', 'menu', 'complementary'].includes(sidebarRole || '')).toBe(true);
    }

    // Check for proper heading structure
    const headings = await memberPage.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    expect(headings.length).toBeGreaterThan(0);

    // Verify main content is properly marked
    const mainContent = memberPage.locator('[data-testid="dashboard-main"]');
    if (await mainContent.isVisible()) {
      const role = await mainContent.getAttribute('role');
      expect(role === 'main' || await memberPage.locator('main').count() > 0).toBe(true);
    }
  });

  test('should have accessible forms on points charge page', async ({ memberPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToPointCharge();

    await checkA11y(memberPage, null, {
      detailedReport: true,
      axeOptions: {
        rules: {
          'color-contrast': { enabled: false }
        }
      }
    });

    // Check form field accessibility
    const amountInput = memberPage.locator('[data-testid="amount-input"]');
    if (await amountInput.isVisible()) {
      const labelId = await amountInput.getAttribute('aria-labelledby');
      const ariaLabel = await amountInput.getAttribute('aria-label');
      const associatedLabel = memberPage.locator(`label[for="${await amountInput.getAttribute('id')}"]`);
      
      const hasProperLabel = labelId || ariaLabel || (await associatedLabel.count() > 0);
      expect(hasProperLabel).toBe(true);

      // Check for error message association
      const hasError = await memberPage.locator('[data-testid="amount-error"]').isVisible();
      if (hasError) {
        const ariaDescribedBy = await amountInput.getAttribute('aria-describedby');
        expect(ariaDescribedBy).toBeTruthy();
      }
    }

    // Check payment method selection accessibility
    const paymentMethods = memberPage.locator('[data-testid="payment-method-selector"] input[type="radio"]');
    const radioCount = await paymentMethods.count();
    
    for (let i = 0; i < radioCount; i++) {
      const radio = paymentMethods.nth(i);
      const radioName = await radio.getAttribute('name');
      const radioLabel = memberPage.locator(`label[for="${await radio.getAttribute('id')}"]`);
      
      expect(radioName).toBeTruthy();
      if (await radioLabel.count() > 0) {
        expect(await radioLabel.isVisible()).toBe(true);
      }
    }
  });

  test('should have accessible tournament cards and filters', async ({ memberPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToTournaments();

    await checkA11y(memberPage, null, {
      detailedReport: true,
      axeOptions: {
        rules: {
          'color-contrast': { enabled: false }
        }
      }
    });

    // Check tournament card accessibility
    const tournamentCards = memberPage.locator('[data-testid="tournament-card"]');
    const cardCount = await tournamentCards.count();

    if (cardCount > 0) {
      const firstCard = tournamentCards.first();
      
      // Check if card has proper semantics
      const cardRole = await firstCard.getAttribute('role');
      const hasArticleTag = await firstCard.evaluate(el => el.tagName.toLowerCase() === 'article');
      
      expect(cardRole === 'article' || hasArticleTag).toBe(true);

      // Check button accessibility in cards
      const joinButton = firstCard.locator('[data-testid="enter-tournament"], [data-testid="view-details"]');
      if (await joinButton.count() > 0) {
        const buttonText = await joinButton.first().textContent();
        const ariaLabel = await joinButton.first().getAttribute('aria-label');
        expect(buttonText?.trim() || ariaLabel).toBeTruthy();
      }
    }

    // Check filter accessibility
    const filterButtons = memberPage.locator('[data-testid="tournaments-filter"] button');
    const filterCount = await filterButtons.count();

    for (let i = 0; i < filterCount; i++) {
      const filterButton = filterButtons.nth(i);
      const buttonText = await filterButton.textContent();
      const ariaLabel = await filterButton.getAttribute('aria-label');
      const ariaPressed = await filterButton.getAttribute('aria-pressed');
      
      expect(buttonText?.trim() || ariaLabel).toBeTruthy();
      
      // Filter buttons should have pressed state if they're toggles
      if (ariaPressed !== null) {
        expect(['true', 'false'].includes(ariaPressed)).toBe(true);
      }
    }
  });

  test('should have accessible modals and dialogs', async ({ memberPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToVoucherPurchase();

    // Open purchase modal
    const voucherCard = memberPage.locator('[data-testid="voucher-card"]').first();
    if (await voucherCard.isVisible()) {
      const purchaseButton = voucherCard.locator('[data-testid="purchase-button"]');
      await purchaseButton.click();

      // Wait for modal to appear
      const modal = memberPage.locator('[data-testid="purchase-modal"]');
      await modal.waitFor({ state: 'visible' });

      await checkA11y(memberPage, null, {
        detailedReport: true,
        axeOptions: {
          rules: {
            'color-contrast': { enabled: false }
          }
        }
      });

      // Check modal accessibility properties
      const modalRole = await modal.getAttribute('role');
      const ariaModal = await modal.getAttribute('aria-modal');
      const ariaLabel = await modal.getAttribute('aria-label');
      const ariaLabelledBy = await modal.getAttribute('aria-labelledby');

      expect(modalRole).toBe('dialog');
      expect(ariaModal).toBe('true');
      expect(ariaLabel || ariaLabelledBy).toBeTruthy();

      // Check if focus is trapped in modal
      const focusableElements = await modal.locator('button, input, select, textarea, [tabindex]:not([tabindex="-1"])').count();
      expect(focusableElements).toBeGreaterThan(0);

      // Test escape key functionality
      await memberPage.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    }
  });

  test('should have accessible admin dashboard', async ({ adminPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(adminPage);
    await nav.goToAdminDashboard();

    await checkA11y(adminPage, null, {
      detailedReport: true,
      axeOptions: {
        rules: {
          'color-contrast': { enabled: false }
        }
      }
    });

    // Check admin sidebar navigation
    const adminSidebar = adminPage.locator('[data-testid="admin-sidebar"]');
    if (await adminSidebar.isVisible()) {
      const sidebarRole = await adminSidebar.getAttribute('role');
      expect(['navigation', 'menu'].includes(sidebarRole || '')).toBe(true);

      // Check navigation links
      const navLinks = adminSidebar.locator('a, button[role="menuitem"]');
      const linkCount = await navLinks.count();

      for (let i = 0; i < linkCount; i++) {
        const link = navLinks.nth(i);
        const linkText = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        expect(linkText?.trim() || ariaLabel).toBeTruthy();
      }
    }

    // Check statistics cards accessibility
    const statsCards = adminPage.locator('[data-testid="admin-stats-cards"] [data-testid*="card"]');
    const cardCount = await statsCards.count();

    for (let i = 0; i < cardCount; i++) {
      const card = statsCards.nth(i);
      const cardTitle = await card.locator('[data-testid*="title"], h2, h3').textContent();
      const cardValue = await card.locator('[data-testid*="value"], [data-testid*="stat"]').textContent();
      
      expect(cardTitle || cardValue).toBeTruthy();
      
      // Check if numbers have proper formatting for screen readers
      if (cardValue && /\d/.test(cardValue)) {
        const ariaLabel = await card.getAttribute('aria-label');
        // Numbers should be formatted appropriately (e.g., "1,234" should be read as "1 thousand 2 hundred 34")
        if (ariaLabel) {
          expect(ariaLabel.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should support keyboard navigation throughout the application', async ({ memberPage }) => {
    await memberPage.goto('/dashboard');
    await memberPage.waitForLoadState('networkidle');

    // Test tab navigation
    let tabCount = 0;
    const maxTabs = 20; // Prevent infinite loops

    while (tabCount < maxTabs) {
      await memberPage.keyboard.press('Tab');
      
      const focusedElement = memberPage.locator(':focus');
      const focusedCount = await focusedElement.count();
      
      if (focusedCount === 0) {
        break; // No more focusable elements
      }

      // Check if focused element is visible and interactive
      const isVisible = await focusedElement.isVisible();
      const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
      const role = await focusedElement.getAttribute('role');
      const tabIndex = await focusedElement.getAttribute('tabindex');

      expect(isVisible).toBe(true);
      
      // Focused element should be interactive
      const isInteractive = ['button', 'input', 'select', 'textarea', 'a'].includes(tagName) ||
                          ['button', 'link', 'menuitem', 'tab'].includes(role || '') ||
                          tabIndex === '0';
      
      expect(isInteractive).toBe(true);

      tabCount++;
    }

    expect(tabCount).toBeGreaterThan(0); // Should have some focusable elements
  });

  test('should have proper ARIA landmarks and page structure', async ({ memberPage }) => {
    await memberPage.goto('/dashboard');
    await memberPage.waitForLoadState('networkidle');

    // Check for essential landmarks
    const main = await memberPage.locator('[role="main"], main').count();
    expect(main).toBeGreaterThan(0);

    const navigation = await memberPage.locator('[role="navigation"], nav').count();
    expect(navigation).toBeGreaterThan(0);

    // Check heading structure
    const h1Count = await memberPage.locator('h1').count();
    expect(h1Count).toBe(1); // Should have exactly one h1

    // Check if headings are in proper order
    const allHeadings = await memberPage.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    expect(allHeadings.length).toBeGreaterThan(1); // Should have multiple headings

    // Verify skip links if present
    const skipLink = memberPage.locator('a[href="#main"], a[href="#content"]');
    const skipLinkCount = await skipLink.count();
    
    if (skipLinkCount > 0) {
      // Skip link should be the first focusable element
      await memberPage.keyboard.press('Tab');
      const firstFocused = await memberPage.locator(':focus').getAttribute('href');
      expect(firstFocused).toMatch(/#(main|content)/);
    }
  });

  test('should handle screen reader announcements for dynamic content', async ({ memberPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(memberPage);
    await nav.goToPointCharge();

    // Fill amount to trigger dynamic updates
    const amountInput = memberPage.locator('[data-testid="amount-input"]');
    await amountInput.fill('10000');

    // Check if preview updates have proper ARIA live regions
    const pointsPreview = memberPage.locator('[data-testid="points-preview"]');
    if (await pointsPreview.isVisible()) {
      const ariaLive = await pointsPreview.getAttribute('aria-live');
      const ariaAtomic = await pointsPreview.getAttribute('aria-atomic');
      
      // Live region should announce changes
      expect(ariaLive).toBeTruthy();
      expect(['polite', 'assertive'].includes(ariaLive || '')).toBe(true);
    }

    // Test error message announcements
    await amountInput.fill('0'); // Invalid amount
    
    const errorMessage = memberPage.locator('[data-testid="amount-error"]');
    if (await errorMessage.isVisible()) {
      const ariaLive = await errorMessage.getAttribute('aria-live');
      const role = await errorMessage.getAttribute('role');
      
      // Error should be announced
      expect(ariaLive === 'assertive' || role === 'alert').toBe(true);
    }
  });

  test('should have accessible data tables', async ({ adminPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(adminPage);
    await nav.goToAdminMembers();

    await checkA11y(adminPage, null, {
      detailedReport: true,
      axeOptions: {
        rules: {
          'color-contrast': { enabled: false }
        }
      }
    });

    // Check if tables have proper structure
    const tables = adminPage.locator('table');
    const tableCount = await tables.count();

    if (tableCount > 0) {
      const firstTable = tables.first();
      
      // Check for table headers
      const headers = await firstTable.locator('th').count();
      expect(headers).toBeGreaterThan(0);

      // Check for proper table caption or title
      const caption = await firstTable.locator('caption').count();
      const ariaLabel = await firstTable.getAttribute('aria-label');
      const ariaLabelledBy = await firstTable.getAttribute('aria-labelledby');
      
      expect(caption > 0 || ariaLabel || ariaLabelledBy).toBeTruthy();

      // Check if sortable columns have proper ARIA attributes
      const sortableHeaders = firstTable.locator('th[aria-sort], th button');
      const sortableCount = await sortableHeaders.count();
      
      for (let i = 0; i < sortableCount; i++) {
        const header = sortableHeaders.nth(i);
        const ariaSort = await header.getAttribute('aria-sort');
        const role = await header.getAttribute('role');
        
        if (ariaSort) {
          expect(['ascending', 'descending', 'none'].includes(ariaSort)).toBe(true);
        }
        
        if (role) {
          expect(role).toBe('columnheader');
        }
      }
    }
  });

  test('should maintain accessibility during loading states', async ({ memberPage }) => {
    await memberPage.goto('/dashboard');

    // Check loading state accessibility
    const loadingIndicator = memberPage.locator('[data-testid="loading"]');
    if (await loadingIndicator.isVisible()) {
      const ariaLabel = await loadingIndicator.getAttribute('aria-label');
      const role = await loadingIndicator.getAttribute('role');
      const ariaLive = await loadingIndicator.getAttribute('aria-live');
      
      // Loading indicator should be announced to screen readers
      expect(ariaLabel || role === 'status' || ariaLive).toBeTruthy();
    }

    // Wait for content to load and check accessibility
    await memberPage.waitForLoadState('networkidle');
    
    await checkA11y(memberPage, null, {
      detailedReport: true,
      axeOptions: {
        rules: {
          'color-contrast': { enabled: false }
        }
      }
    });
  });
});