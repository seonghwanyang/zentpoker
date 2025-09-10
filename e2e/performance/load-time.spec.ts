import { test, expect, testGroups, retryConfig } from '../fixtures';

test.describe(testGroups.performance, () => {
  test.describe.configure(retryConfig.performance);

  // Performance thresholds (in milliseconds)
  const PERFORMANCE_THRESHOLDS = {
    firstContentfulPaint: 2000,
    largestContentfulPaint: 2500,
    cumulativeLayoutShift: 0.1,
    firstInputDelay: 100,
    timeToInteractive: 3000,
    totalBlockingTime: 200,
  };

  test('should load home page within performance budget', async ({ guestPage }) => {
    // Start performance measurement
    await guestPage.goto('/', { waitUntil: 'networkidle' });

    // Measure Core Web Vitals
    const vitals = await guestPage.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitalsData: any = {};

          entries.forEach((entry: any) => {
            if (entry.entryType === 'paint') {
              if (entry.name === 'first-contentful-paint') {
                vitalsData.firstContentfulPaint = entry.startTime;
              }
            }
            if (entry.entryType === 'largest-contentful-paint') {
              vitalsData.largestContentfulPaint = entry.startTime;
            }
            if (entry.entryType === 'layout-shift') {
              if (!vitalsData.cumulativeLayoutShift) {
                vitalsData.cumulativeLayoutShift = 0;
              }
              if (!entry.hadRecentInput) {
                vitalsData.cumulativeLayoutShift += entry.value;
              }
            }
            if (entry.entryType === 'first-input') {
              vitalsData.firstInputDelay = entry.processingStart - entry.startTime;
            }
          });

          // Get Time to Interactive
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            vitalsData.timeToInteractive = navigation.domInteractive - navigation.navigationStart;
            vitalsData.loadComplete = navigation.loadEventEnd - navigation.navigationStart;
            vitalsData.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
          }

          resolve(vitalsData);
        }).observe({
          entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input', 'navigation']
        });

        // Fallback timeout
        setTimeout(() => {
          resolve({});
        }, 5000);
      });
    });

    // Assert performance metrics
    console.log('Performance metrics:', vitals);

    if ((vitals as any).firstContentfulPaint) {
      expect((vitals as any).firstContentfulPaint).toBeLessThan(PERFORMANCE_THRESHOLDS.firstContentfulPaint);
    }

    if ((vitals as any).largestContentfulPaint) {
      expect((vitals as any).largestContentfulPaint).toBeLessThan(PERFORMANCE_THRESHOLDS.largestContentfulPaint);
    }

    if ((vitals as any).cumulativeLayoutShift !== undefined) {
      expect((vitals as any).cumulativeLayoutShift).toBeLessThan(PERFORMANCE_THRESHOLDS.cumulativeLayoutShift);
    }

    if ((vitals as any).timeToInteractive) {
      expect((vitals as any).timeToInteractive).toBeLessThan(PERFORMANCE_THRESHOLDS.timeToInteractive);
    }
  });

  test('should load dashboard page efficiently for authenticated users', async ({ memberPage }) => {
    const startTime = Date.now();
    
    await memberPage.goto('/dashboard');
    await memberPage.waitForSelector('[data-testid="dashboard-main"]', { state: 'visible' });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3 seconds max

    // Check that critical elements are loaded
    await expect(memberPage.locator('[data-testid="points-balance"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="quick-actions"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="recent-activity-list"]')).toBeVisible();
  });

  test('should handle large transaction history efficiently', async ({ 
    memberPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    // Create multiple transactions for performance testing
    const testUser = await databaseHelper.getUserByEmail('member@zentpoker.test');
    if (testUser) {
      // Create 50 test transactions
      for (let i = 0; i < 50; i++) {
        await databaseHelper.createPointTransaction(testUser.email, {
          type: i % 2 === 0 ? 'CHARGE' : 'USE',
          amount: Math.floor(Math.random() * 1000) + 100,
          description: `Test transaction ${i + 1}`,
        });
      }
    }

    const nav = new navigationHelper.constructor(memberPage);
    
    const startTime = Date.now();
    await nav.goToPoints();
    
    // Wait for transaction table to load
    await memberPage.waitForSelector('[data-testid="transaction-table"]', { state: 'visible' });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // 5 seconds max for large data set

    // Verify pagination works efficiently
    const paginationStartTime = Date.now();
    const nextButton = memberPage.locator('[data-testid="next-page"]');
    
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await memberPage.waitForLoadState('networkidle');
    }
    
    const paginationTime = Date.now() - paginationStartTime;
    expect(paginationTime).toBeLessThan(2000); // 2 seconds max for pagination
  });

  test('should load voucher purchase page with acceptable performance', async ({ 
    memberPage, 
    navigationHelper,
    apiHelper 
  }) => {
    const api = new apiHelper.constructor(memberPage);
    
    // Mock large voucher dataset
    const mockVouchers = Array.from({ length: 20 }, (_, i) => ({
      id: `voucher-${i}`,
      name: `Voucher ${i + 1}`,
      description: `Test voucher ${i + 1} description`,
      price: (i + 1) * 1000,
      value: (i + 1) * 100,
      type: i % 2 === 0 ? 'POINTS' : 'DISCOUNT',
      isActive: true,
    }));

    await api.mockApiResponse('**/api/vouchers/list', { vouchers: mockVouchers });

    const nav = new navigationHelper.constructor(memberPage);
    
    const startTime = Date.now();
    await nav.goToVoucherPurchase();
    
    // Wait for voucher cards to render
    await memberPage.waitForSelector('[data-testid="voucher-card"]', { state: 'visible' });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(4000); // 4 seconds max for voucher page

    // Test filtering performance
    const filterStartTime = Date.now();
    await memberPage.locator('[data-testid="filter-points"]').click();
    await memberPage.waitForLoadState('networkidle');
    
    const filterTime = Date.now() - filterStartTime;
    expect(filterTime).toBeLessThan(1000); // 1 second max for filtering
  });

  test('should handle tournament list loading efficiently', async ({ 
    memberPage, 
    navigationHelper,
    databaseHelper 
  }) => {
    // Create multiple tournaments
    for (let i = 0; i < 15; i++) {
      await databaseHelper.createTestTournament({
        name: `Performance Test Tournament ${i + 1}`,
        maxParticipants: 100,
        entryFee: 1000 + (i * 100),
        prizePool: 10000 + (i * 1000),
        status: i % 3 === 0 ? 'UPCOMING' : (i % 3 === 1 ? 'ACTIVE' : 'COMPLETED'),
      });
    }

    const nav = new navigationHelper.constructor(memberPage);
    
    const startTime = Date.now();
    await nav.goToTournaments();
    
    // Wait for tournament cards to load
    await memberPage.waitForSelector('[data-testid="tournament-card"]', { state: 'visible' });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3 seconds max

    // Test filtering performance
    const filterStartTime = Date.now();
    await memberPage.locator('[data-testid="filter-upcoming"]').click();
    await memberPage.waitForLoadState('networkidle');
    
    const filterTime = Date.now() - filterStartTime;
    expect(filterTime).toBeLessThan(1500); // 1.5 seconds max for filtering
  });

  test('should handle admin dashboard loading efficiently', async ({ adminPage, navigationHelper }) => {
    const nav = new navigationHelper.constructor(adminPage);
    
    const startTime = Date.now();
    await nav.goToAdminDashboard();
    
    // Wait for essential admin elements
    await adminPage.waitForSelector('[data-testid="admin-sidebar"]', { state: 'visible' });
    await adminPage.waitForSelector('[data-testid="admin-stats-cards"]', { state: 'visible' });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(4000); // 4 seconds max for admin dashboard

    // Check that analytics charts are loaded efficiently
    const chartLoadStartTime = Date.now();
    await adminPage.waitForSelector('[data-testid="revenue-chart"]', { state: 'visible' });
    
    const chartLoadTime = Date.now() - chartLoadStartTime;
    expect(chartLoadTime).toBeLessThan(2000); // 2 seconds max for charts
  });

  test('should handle API response times efficiently', async ({ memberPage, apiHelper }) => {
    const api = new apiHelper.constructor(memberPage);

    // Test points balance API
    const balanceStartTime = Date.now();
    const balance = await api.getPointsBalance();
    const balanceTime = Date.now() - balanceStartTime;
    
    expect(balanceTime).toBeLessThan(1000); // 1 second max
    expect(typeof balance).toBe('number');

    // Test transaction history API
    const transactionsStartTime = Date.now();
    const transactions = await api.getPointTransactions();
    const transactionsTime = Date.now() - transactionsStartTime;
    
    expect(transactionsTime).toBeLessThan(2000); // 2 seconds max
    expect(Array.isArray(transactions)).toBe(true);
  });

  test('should maintain performance on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12 Pro

    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(4000); // 4 seconds max for mobile

    // Test mobile navigation performance
    const navStartTime = Date.now();
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForSelector('[data-testid="mobile-menu"]', { state: 'visible' });
    }
    
    const navTime = Date.now() - navStartTime;
    expect(navTime).toBeLessThan(500); // 500ms max for menu toggle
  });

  test('should handle concurrent user simulation', async ({ page }) => {
    // Simulate multiple concurrent operations
    const operations = [
      page.goto('/dashboard'),
      page.goto('/points'),
      page.goto('/tournaments'),
      page.goto('/vouchers'),
    ];

    const startTime = Date.now();
    
    // Execute operations concurrently (in new contexts to simulate different users)
    const contexts = await Promise.all([
      page.context().browser()?.newContext(),
      page.context().browser()?.newContext(),
      page.context().browser()?.newContext(),
    ]);

    const concurrentPages = await Promise.all(
      contexts.map(context => context?.newPage())
    );

    const concurrentOperations = concurrentPages.map((concurrentPage, index) => {
      if (concurrentPage) {
        const routes = ['/dashboard', '/points', '/tournaments', '/vouchers'];
        return concurrentPage.goto(routes[index % routes.length]);
      }
      return Promise.resolve();
    });

    await Promise.all(concurrentOperations);
    
    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(8000); // 8 seconds max for concurrent operations

    // Cleanup
    await Promise.all(contexts.map(context => context?.close()));
  });

  test('should handle network throttling gracefully', async ({ page }) => {
    // Simulate slow network
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 1024 * 1024, // 1 Mbps
      uploadThroughput: 512 * 1024,     // 512 Kbps
      latency: 100, // 100ms latency
    });

    const startTime = Date.now();
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000); // 10 seconds max on slow network

    // Test that critical functionality still works
    await expect(page.locator('[data-testid="points-balance"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Restore normal network conditions
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
  });

  test('should measure and validate bundle sizes', async ({ page }) => {
    await page.goto('/dashboard');

    // Measure resource sizes
    const resourceSizes = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const sizes = {
        totalJS: 0,
        totalCSS: 0,
        totalImages: 0,
        totalFonts: 0,
      };

      resources.forEach((resource) => {
        const size = resource.transferSize || 0;
        const name = resource.name.toLowerCase();

        if (name.includes('.js')) {
          sizes.totalJS += size;
        } else if (name.includes('.css')) {
          sizes.totalCSS += size;
        } else if (name.includes('.png') || name.includes('.jpg') || name.includes('.svg') || name.includes('.webp')) {
          sizes.totalImages += size;
        } else if (name.includes('.woff') || name.includes('.ttf')) {
          sizes.totalFonts += size;
        }
      });

      return sizes;
    });

    console.log('Resource sizes:', resourceSizes);

    // Assert reasonable bundle sizes (in bytes)
    expect(resourceSizes.totalJS).toBeLessThan(2 * 1024 * 1024); // 2MB max for JS
    expect(resourceSizes.totalCSS).toBeLessThan(500 * 1024);     // 500KB max for CSS
    expect(resourceSizes.totalImages).toBeLessThan(1024 * 1024); // 1MB max for images
    expect(resourceSizes.totalFonts).toBeLessThan(200 * 1024);   // 200KB max for fonts
  });
});