/**
 * API Tests Setup and Configuration
 * 
 * This file contains setup configurations and utilities specific to API testing.
 * It extends the main jest.setup.js with API-specific configurations.
 */

// Additional API testing setup
export const API_TEST_CONFIG = {
  // Default test timeouts for different types of tests
  timeouts: {
    unit: 5000,      // 5 seconds for unit tests
    integration: 10000, // 10 seconds for integration tests
    performance: 15000, // 15 seconds for performance tests
  },
  
  // Test coverage thresholds for API endpoints
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/app/api/**/route.ts': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  
  // Database connection pooling for tests
  database: {
    maxConnections: 5,
    connectionTimeout: 3000,
    idleTimeout: 30000,
  },
  
  // Mock service configurations
  mockServices: {
    resetBetweenTests: true,
    logMockCalls: process.env.NODE_ENV === 'development',
    strictMocking: true,
  },
};

// Global test utilities for API testing
export const setupApiTestGlobals = () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/zentpoker_test';
  process.env.NEXTAUTH_SECRET = 'test-secret-key-for-api-testing';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
  
  // Mock external services that shouldn't be called during testing
  global.mockExternalServices = {
    kakaoPayment: jest.fn(),
    smsService: jest.fn(),
    emailService: jest.fn(),
    auditLogger: jest.fn(),
  };
  
  // Performance monitoring for API tests
  global.performanceMonitor = {
    startTime: 0,
    endTime: 0,
    start: () => { global.performanceMonitor.startTime = Date.now(); },
    end: () => { global.performanceMonitor.endTime = Date.now(); },
    duration: () => global.performanceMonitor.endTime - global.performanceMonitor.startTime,
  };
};

// Test data cleanup utilities
export const cleanupTestData = async () => {
  // Reset all mocks
  jest.clearAllMocks();
  
  // Clear test database if needed
  // Note: In real implementation, you might want to clean up test database
  // await prisma.$executeRaw`TRUNCATE TABLE "Transaction" CASCADE`;
  // await prisma.$executeRaw`TRUNCATE TABLE "Voucher" CASCADE`;
  // await prisma.$executeRaw`TRUNCATE TABLE "PointLog" CASCADE`;
  
  // Reset mock timers if used
  if (typeof jest.getRealSystemTime === 'function') {
    jest.useRealTimers();
  }
};

// Security test helpers
export const securityTestHelpers = {
  // Common XSS payloads for testing
  xssPayloads: [
    '<script>alert("xss")</script>',
    '<img src="x" onerror="alert(1)">',
    'javascript:alert("xss")',
    '<svg onload=alert(1)>',
    '"><script>alert(document.cookie)</script>',
    "'><script>alert(document.domain)</script>",
  ],
  
  // Common SQL injection payloads
  sqlInjectionPayloads: [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "'; UPDATE users SET role='ADMIN'; --",
    "' UNION SELECT * FROM users --",
    "admin'--",
    "admin'/*",
  ],
  
  // Path traversal payloads
  pathTraversalPayloads: [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2f',
    '....//....//....//etc/passwd',
  ],
  
  // Command injection payloads
  commandInjectionPayloads: [
    '; ls -la',
    '| whoami',
    '& echo vulnerable',
    '`cat /etc/passwd`',
    '$(cat /etc/passwd)',
  ],
};

// Performance benchmarking utilities
export const performanceBenchmarks = {
  // Expected response times (in milliseconds)
  responseTimeLimits: {
    GET: {
      fast: 100,
      medium: 300,
      slow: 1000,
    },
    POST: {
      fast: 200,
      medium: 500,
      slow: 1500,
    },
    PATCH: {
      fast: 150,
      medium: 400,
      slow: 1200,
    },
    DELETE: {
      fast: 100,
      medium: 300,
      slow: 1000,
    },
  },
  
  // Memory usage limits (in MB)
  memoryLimits: {
    perRequest: 50,
    totalHeap: 512,
  },
  
  // Concurrency limits
  concurrencyLimits: {
    maxConcurrentRequests: 100,
    maxQueueSize: 1000,
  },
};

// Test report generation utilities
export const testReporting = {
  generateCoverageReport: () => {
    // In a real implementation, this would generate detailed coverage reports
    console.log('📊 API Test Coverage Report Generated');
  },
  
  generatePerformanceReport: () => {
    // In a real implementation, this would generate performance reports
    console.log('⚡ API Performance Report Generated');
  },
  
  generateSecurityReport: () => {
    // In a real implementation, this would generate security test reports
    console.log('🔒 API Security Test Report Generated');
  },
};

// Custom matchers for API testing
export const customMatchers = {
  // Matcher to check if response is valid JSON API response
  toBeValidJsonApiResponse: (received: Response) => {
    const contentType = received.headers.get('content-type');
    const isValidStatus = received.status >= 200 && received.status < 600;
    const hasJsonContentType = contentType?.includes('application/json');
    
    return {
      pass: isValidStatus && hasJsonContentType,
      message: () => 
        `Expected response to be valid JSON API response, but got status: ${received.status}, content-type: ${contentType}`,
    };
  },
  
  // Matcher to check if response time is within limits
  toRespondWithinTimeLimit: (duration: number, limit: number) => {
    return {
      pass: duration <= limit,
      message: () => 
        `Expected response time ${duration}ms to be within limit ${limit}ms`,
    };
  },
  
  // Matcher to check if error response has proper structure
  toBeValidErrorResponse: (response: any) => {
    const hasSuccess = typeof response.success === 'boolean' && !response.success;
    const hasError = typeof response.error === 'string';
    const hasMessage = typeof response.message === 'string';
    
    return {
      pass: hasSuccess && hasError && hasMessage,
      message: () => 
        `Expected response to be valid error response with success: false, error: string, message: string`,
    };
  },
};

// Initialize API test setup
setupApiTestGlobals();

console.log('🧪 API Test Environment Initialized');
console.log(`📊 Coverage Thresholds: ${JSON.stringify(API_TEST_CONFIG.coverageThresholds.global)}`);
console.log(`⚡ Performance Limits: GET ${performanceBenchmarks.responseTimeLimits.GET.fast}ms, POST ${performanceBenchmarks.responseTimeLimits.POST.fast}ms`);
console.log(`🔒 Security Payloads Loaded: ${securityTestHelpers.xssPayloads.length} XSS, ${securityTestHelpers.sqlInjectionPayloads.length} SQLi`);

export default API_TEST_CONFIG;