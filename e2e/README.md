# ZentPoker E2E Test Suite

This directory contains comprehensive end-to-end tests for the ZentPoker application using Playwright.

## Overview

The E2E test suite covers critical user flows, performance metrics, and accessibility compliance across multiple browsers and devices.

## Structure

```
e2e/
├── auth/                    # Authentication flow tests
├── payment/                 # Payment and point charging tests
├── tournament/              # Tournament entry and management tests
├── admin/                   # Admin panel functionality tests
├── performance/             # Performance and load time tests
├── accessibility/           # Accessibility compliance tests
├── pages/                   # Page Object Model classes
├── helpers/                 # Test utility classes
├── fixtures.ts             # Custom test fixtures and configuration
├── global-setup.ts         # Global test setup
└── global-teardown.ts      # Global test cleanup
```

## Test Categories

### 🔐 Authentication Tests (`auth/`)
- OAuth login flows (Google, Kakao)
- Session management
- Role-based access control
- Authentication error handling

### 💳 Payment Tests (`payment/`)
- Point charging with KakaoPay
- Voucher purchase flows
- Payment validation and error handling
- Transaction history

### 🏆 Tournament Tests (`tournament/`)
- Tournament browsing and filtering
- Entry and exit flows
- Point deduction validation
- Tournament status management

### 👨‍💼 Admin Tests (`admin/`)
- Payment approval workflows
- Member management
- Admin dashboard functionality
- System monitoring

### ⚡ Performance Tests (`performance/`)
- Page load time measurement
- Core Web Vitals assessment
- API response time testing
- Bundle size validation
- Mobile performance testing

### ♿ Accessibility Tests (`accessibility/`)
- WCAG compliance checking
- Keyboard navigation testing
- Screen reader compatibility
- ARIA attributes validation
- Color contrast verification

## Setup and Configuration

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Environment Setup

1. Create a `.env.test` file with test database credentials:
```bash
DATABASE_URL="your-test-database-url"
NEXTAUTH_SECRET="test-secret"
NEXTAUTH_URL="http://localhost:3001"
```

2. Set up test database:
```bash
npm run db:test:setup
```

## Running Tests

### All E2E Tests
```bash
npm run test:e2e
```

### Specific Test Categories
```bash
# Authentication tests
npx playwright test auth/

# Payment tests
npx playwright test payment/

# Tournament tests
npx playwright test tournament/

# Admin tests
npx playwright test admin/

# Performance tests
npx playwright test performance/

# Accessibility tests
npx playwright test accessibility/
```

### Browser-Specific Tests
```bash
# Chrome only
npx playwright test --project="Desktop Chrome"

# Firefox only
npx playwright test --project="Desktop Firefox"

# Mobile Chrome
npx playwright test --project="Mobile Chrome"
```

### Debug Mode
```bash
# Run with browser visible
npm run test:e2e:headed

# Debug mode with Playwright Inspector
npm run test:e2e:debug

# UI mode for interactive testing
npm run test:e2e:ui
```

### Specific Tests
```bash
# Run specific test file
npx playwright test auth/login-flow.spec.ts

# Run specific test
npx playwright test -g "should login as member successfully"
```

## Page Objects

The test suite uses the Page Object Model pattern for maintainable and reusable test code:

```typescript
// Example usage
import { LoginPage } from '../pages/login.page';

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.loginWithGoogle();
  await loginPage.waitForAuthenticationComplete();
});
```

### Available Page Objects
- `LoginPage` - Login page interactions
- `DashboardPage` - Member dashboard functionality
- `PointsPage` - Points management and charging
- `VouchersPage` - Voucher browsing and purchasing
- `AdminDashboardPage` - Admin panel operations

## Test Helpers

### Authentication Helper
```typescript
const authHelper = new AuthHelper(page);

// Login as different user types
await authHelper.loginAsAdmin();
await authHelper.loginAsMember();
await authHelper.logout();
```

### API Helper
```typescript
const apiHelper = new ApiHelper(page);

// API interactions
const balance = await apiHelper.getPointsBalance();
await apiHelper.chargePoints(10000, 'KAKAO_PAY');
const vouchers = await apiHelper.getVouchers();
```

### Database Helper
```typescript
const databaseHelper = new DatabaseHelper(prisma);

// Test data management
const user = await databaseHelper.createTestUser({
  email: 'test@example.com',
  role: 'MEMBER'
});

await databaseHelper.cleanupTestData();
```

### Navigation Helper
```typescript
const navigationHelper = new NavigationHelper(page);

// Navigation utilities
await navigationHelper.goToDashboard();
await navigationHelper.goToPointCharge();
await navigationHelper.waitForPageLoad();
```

## Custom Fixtures

The test suite provides custom fixtures for common testing scenarios:

```typescript
import { test, expect } from '../fixtures';

test('example test', async ({ 
  adminPage,      // Pre-authenticated admin page
  memberPage,     // Pre-authenticated member page
  guestPage,      // Non-authenticated page
  authHelper,     // Authentication utilities
  apiHelper,      // API interaction utilities
  databaseHelper, // Database operations
  prisma          // Direct database access
}) => {
  // Test implementation
});
```

## Configuration

### Browser Configuration
The test suite is configured to run on multiple browsers and viewports:

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: Chrome (Pixel 5), Safari (iPhone 12)
- **Tablet**: Chrome (iPad Pro)
- **Custom**: Small desktop (1024x768)

### Performance Thresholds
```typescript
const PERFORMANCE_THRESHOLDS = {
  firstContentfulPaint: 2000,    // 2 seconds
  largestContentfulPaint: 2500,  // 2.5 seconds
  cumulativeLayoutShift: 0.1,    // 10%
  firstInputDelay: 100,          // 100ms
  timeToInteractive: 3000,       // 3 seconds
};
```

### Accessibility Standards
Tests validate against WCAG 2.1 AA standards using axe-core.

## Test Data Management

### Automatic Cleanup
- Test data is automatically created and cleaned up
- Each test runs in isolation with fresh data
- Database is reset between test runs

### Test Users
Pre-configured test users are available:
```typescript
const testUsers = {
  admin: { email: 'admin@zentpoker.test', role: 'ADMIN' },
  member: { email: 'member@zentpoker.test', role: 'MEMBER' }
};
```

## Continuous Integration

### GitHub Actions Integration
The test suite integrates with CI/CD pipelines:

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

### Parallel Execution
Tests run in parallel across multiple workers for faster execution:
- CI: 1 worker (to avoid resource conflicts)
- Local: CPU core count (for maximum speed)

## Reporting

### HTML Reports
```bash
# Generate HTML report
npx playwright show-report
```

### JUnit Reports
JUnit XML reports are generated for CI integration at:
```
test-results/e2e-results.xml
```

### Screenshots and Videos
- Screenshots captured on test failures
- Videos recorded for failed tests
- Traces available for debugging

## Best Practices

### Writing Tests
1. **Use Page Objects** for reusable component interactions
2. **Leverage Fixtures** for common setup scenarios
3. **Test Real User Flows** rather than implementation details
4. **Use Proper Selectors** with `data-testid` attributes
5. **Handle Async Operations** properly with appropriate waits

### Performance Testing
1. **Set Realistic Thresholds** based on user expectations
2. **Test on Multiple Network Conditions** including slow connections
3. **Measure Core Web Vitals** consistently
4. **Monitor Bundle Sizes** to prevent regression

### Accessibility Testing
1. **Run Automated Checks** with axe-core
2. **Test Keyboard Navigation** thoroughly
3. **Validate Screen Reader Experience** with proper ARIA
4. **Check Color Contrast** and visual accessibility

## Troubleshooting

### Common Issues

#### Test Timeouts
```typescript
// Increase timeout for slow operations
test.setTimeout(60000); // 60 seconds

// Or use specific waits
await page.waitForResponse(response => 
  response.url().includes('/api/data'), 
  { timeout: 30000 }
);
```

#### Authentication Issues
```typescript
// Clear auth state before test
await authHelper.clearAuthState();
await authHelper.loginAsMember();
```

#### Database Connection Issues
```bash
# Reset test database
npm run db:test:reset
npm run db:test:setup
```

### Debug Tips
1. Use `await page.pause()` to stop execution and inspect
2. Enable `headed: true` mode to see browser actions
3. Check network panel for failed requests
4. Review console logs for JavaScript errors

## Contributing

### Adding New Tests
1. Follow the existing directory structure
2. Use appropriate page objects and helpers
3. Include proper test descriptions and grouping
4. Add performance/accessibility tests for new features
5. Update documentation as needed

### Updating Page Objects
1. Keep page objects focused on single pages/components
2. Provide both high-level and low-level interaction methods
3. Include proper TypeScript types
4. Add JSDoc comments for complex methods

### Test Data
1. Use the DatabaseHelper for consistent test data creation
2. Ensure proper cleanup in global teardown
3. Use realistic data that represents actual user scenarios
4. Document any special test data requirements