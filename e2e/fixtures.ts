import { test as base, Page, BrowserContext } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { AuthHelper } from './helpers/auth.helper';
import { NavigationHelper } from './helpers/navigation.helper';
import { ApiHelper } from './helpers/api.helper';
import { DatabaseHelper } from './helpers/database.helper';

// Custom test fixtures for ZentPoker E2E tests
export interface ZentPokerFixtures {
  // Authenticated contexts
  adminPage: Page;
  memberPage: Page;
  guestPage: Page;
  
  // Helper utilities
  authHelper: AuthHelper;
  navigationHelper: NavigationHelper;
  apiHelper: ApiHelper;
  databaseHelper: DatabaseHelper;
  
  // Database connection
  prisma: PrismaClient;
}

export const test = base.extend<ZentPokerFixtures>({
  // Database connection fixture
  prisma: async ({}, use) => {
    const prisma = new PrismaClient();
    await prisma.$connect();
    await use(prisma);
    await prisma.$disconnect();
  },

  // Helper fixtures
  authHelper: async ({ page }, use) => {
    const authHelper = new AuthHelper(page);
    await use(authHelper);
  },

  navigationHelper: async ({ page }, use) => {
    const navigationHelper = new NavigationHelper(page);
    await use(navigationHelper);
  },

  apiHelper: async ({ page }, use) => {
    const apiHelper = new ApiHelper(page);
    await use(apiHelper);
  },

  databaseHelper: async ({ prisma }, use) => {
    const databaseHelper = new DatabaseHelper(prisma);
    await use(databaseHelper);
  },

  // Guest page (no authentication)
  guestPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // Admin authenticated page
  adminPage: async ({ browser, authHelper }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const auth = new AuthHelper(page);
    
    // Set up admin session
    await auth.loginAsAdmin();
    
    await use(page);
    await context.close();
  },

  // Member authenticated page
  memberPage: async ({ browser, authHelper }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const auth = new AuthHelper(page);
    
    // Set up member session
    await auth.loginAsMember();
    
    await use(page);
    await context.close();
  },
});

// Export expect from Playwright
export { expect } from '@playwright/test';

// Custom expect matchers for ZentPoker
export const zentPokerExpect = {
  // Custom matcher for checking authentication state
  async toBeAuthenticated(page: Page) {
    const isAuthenticated = await page.evaluate(() => {
      return !!document.querySelector('[data-testid="user-menu"]');
    });
    return {
      pass: isAuthenticated,
      message: () => isAuthenticated ? 'Expected page to not be authenticated' : 'Expected page to be authenticated'
    };
  },

  // Custom matcher for checking user role
  async toHaveUserRole(page: Page, expectedRole: 'ADMIN' | 'MEMBER' | 'GUEST') {
    const userRole = await page.evaluate(() => {
      const roleElement = document.querySelector('[data-testid="user-role"]');
      return roleElement?.textContent;
    });
    return {
      pass: userRole === expectedRole,
      message: () => `Expected user role to be ${expectedRole}, but got ${userRole}`
    };
  },

  // Custom matcher for checking points balance
  async toHavePointsBalance(page: Page, expectedBalance: number) {
    const balance = await page.evaluate(() => {
      const balanceElement = document.querySelector('[data-testid="points-balance"]');
      return balanceElement ? parseInt(balanceElement.textContent || '0') : 0;
    });
    return {
      pass: balance === expectedBalance,
      message: () => `Expected points balance to be ${expectedBalance}, but got ${balance}`
    };
  },
};

// Test groups for organizing tests
export const testGroups = {
  auth: 'Authentication Tests',
  payment: 'Payment Flow Tests',
  tournament: 'Tournament Tests',
  admin: 'Admin Panel Tests',
  member: 'Member Dashboard Tests',
  performance: 'Performance Tests',
  accessibility: 'Accessibility Tests',
  mobile: 'Mobile Responsiveness Tests',
} as const;

// Common test data
export const testData = {
  users: {
    admin: {
      email: 'admin@zentpoker.test',
      password: 'test-password',
      name: 'Test Admin',
    },
    member: {
      email: 'member@zentpoker.test',  
      password: 'test-password',
      name: 'Test Member',
    },
  },
  
  tournaments: {
    upcoming: {
      name: 'E2E Test Tournament',
      entryFee: 1000,
    },
  },
  
  vouchers: {
    valid: {
      code: 'E2E-TEST-VOUCHER',
      value: 1000,
    },
  },
  
  payments: {
    kakaoPay: {
      amount: 10000,
      method: 'KAKAO_PAY',
    },
  },
} as const;

// Retry configuration for different test types
export const retryConfig = {
  // Payment flows are flaky due to external services
  payment: { retries: 3 },
  
  // Authentication flows are usually stable
  auth: { retries: 1 },
  
  // Admin operations should be reliable
  admin: { retries: 2 },
  
  // Performance tests shouldn't retry
  performance: { retries: 0 },
} as const;