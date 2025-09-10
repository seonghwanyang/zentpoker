# ZentPoker Test Environment

This directory contains the complete test setup for ZentPoker, including unit tests, integration tests, and end-to-end tests.

## Test Structure

```
tests/
├── e2e/                    # End-to-end tests with Playwright
│   ├── auth.e2e.ts        # Authentication flow tests
│   ├── global-setup.ts    # Global test setup
│   └── global-teardown.ts # Global test cleanup
├── integration/           # Integration tests
│   └── api.test.ts       # API integration tests
└── utils/                # Test utilities
    ├── auth-helpers.ts   # Authentication test helpers
    ├── db-helpers.ts     # Database test helpers
    └── test-data.ts      # Test data factories
```

## Test Types

### Unit Tests
Located in `src/__tests__/` directories. Tests individual components and functions in isolation.

```bash
npm run test:unit
```

### Integration Tests
Located in `tests/integration/`. Tests API endpoints and service integrations.

```bash
npm run test:integration
```

### End-to-End Tests
Located in `tests/e2e/`. Tests complete user workflows in the browser.

```bash
npm run test:e2e
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run unit tests |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:coverage` | Run unit tests with coverage report |
| `npm run test:ci` | Run unit tests for CI environment |
| `npm run test:unit` | Run only unit tests |
| `npm run test:integration` | Run only integration tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:e2e:headed` | Run E2E tests with visible browser |
| `npm run test:e2e:debug` | Run E2E tests in debug mode |
| `npm run test:e2e:ui` | Run E2E tests with Playwright UI |
| `npm run test:all` | Run all test types |

## Database Test Scripts

| Command | Description |
|---------|-------------|
| `npm run db:test:reset` | Reset test database |
| `npm run db:test:migrate` | Run migrations on test database |
| `npm run db:test:seed` | Seed test database with sample data |
| `npm run db:test:setup` | Full test database setup |

## Test Configuration

### Environment Variables
Create a `.env.test` file for test-specific environment variables:

```env
NODE_ENV=test
DATABASE_URL_TEST=postgresql://username:password@localhost:5432/zentpoker_test
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXTAUTH_SECRET=test-secret-key
```

### Jest Configuration
- Configuration: `jest.config.js`
- Setup file: `jest.setup.js`
- Coverage threshold: 70% for branches, functions, lines, statements

### Playwright Configuration
- Configuration: `playwright.config.ts`
- Base URL: `http://localhost:3001`
- Browsers: Chromium, Firefox, WebKit
- Mobile testing: Pixel 5, iPhone 12

## Mock Service Worker (MSW)

MSW is used for API mocking in both tests and development:

- **Handlers**: `src/mocks/handlers.ts`
- **Server setup**: `src/mocks/server.ts`
- **Browser setup**: `src/mocks/browser.ts`

### Available Mocks
- Google OAuth flow
- KakaoPay payment integration
- All API endpoints
- Database operations

## Test Utilities

### Authentication Helpers
```typescript
import { createMockSession, AuthTestHelper } from '../utils/auth-helpers';

// Create mock session
const session = createMockSession({ user: { role: 'ADMIN' } });

// E2E authentication helper
const authHelper = new AuthTestHelper(page);
await authHelper.loginWithGoogle();
```

### Database Helpers
```typescript
import { setupDatabaseTests, createTestUser } from '../utils/db-helpers';

describe('Database Tests', () => {
  setupDatabaseTests(); // Handles setup/cleanup

  test('should create user', async () => {
    const user = await createTestUser({ tier: 'GOLD' });
    expect(user.tier).toBe('GOLD');
  });
});
```

### Test Data Factories
```typescript
import { UserFactory, TransactionFactory } from '../utils/test-data';

// Create test data
const user = UserFactory.bronze({ points: 50000 });
const transaction = TransactionFactory.charge({ amount: 25000 });
```

## Best Practices

### Unit Tests
- Test components in isolation
- Mock external dependencies
- Use test data factories for consistent data
- Aim for high test coverage

### Integration Tests
- Test API endpoints with real database interactions
- Use MSW for external service mocking
- Test error scenarios and edge cases
- Verify data persistence and retrieval

### E2E Tests
- Test complete user workflows
- Use Page Object Model pattern
- Test critical business paths
- Include both positive and negative scenarios

### Test Data Management
- Use factories for consistent test data
- Clean up test data after each test
- Use separate test database
- Seed database with realistic test data

## Debugging Tests

### Unit/Integration Tests
```bash
# Run specific test file
npm test -- --testNamePattern="specific test name"

# Run tests in watch mode
npm run test:watch

# Run tests with verbose output
npm test -- --verbose
```

### E2E Tests
```bash
# Run with visible browser
npm run test:e2e:headed

# Debug specific test
npm run test:e2e:debug -- --grep "login flow"

# Use Playwright UI mode
npm run test:e2e:ui
```

## CI/CD Integration

Tests are configured to run in CI environments:

- **Unit/Integration**: Jest with coverage reporting
- **E2E**: Playwright with multiple browsers
- **Database**: Automated setup and teardown
- **Artifacts**: Screenshots, videos, and coverage reports

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Ensure test database is running
   - Check `DATABASE_URL_TEST` environment variable
   - Run `npm run db:test:setup`

2. **MSW not working**
   - Check if MSW server is started in test setup
   - Verify handlers are properly configured
   - Check for unhandled requests in console

3. **E2E tests failing**
   - Ensure application is running on correct port
   - Check if test data is properly seeded
   - Verify selectors and wait conditions

4. **Authentication tests failing**
   - Check mock session configuration
   - Verify NextAuth setup in test environment
   - Ensure proper OAuth mocking

### Getting Help

If you encounter issues:

1. Check the test output and error messages
2. Review the test configuration files
3. Ensure all dependencies are installed
4. Verify environment variables are set correctly
5. Check if the test database is properly set up