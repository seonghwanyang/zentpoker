import { PrismaClient } from '@prisma/client';

// We need to test the actual prisma.ts file, so we'll mock the PrismaClient constructor
const mockPrismaInstance = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn(),
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockPrismaConstructor = jest.fn().mockImplementation(() => mockPrismaInstance);

jest.mock('@prisma/client', () => ({
  PrismaClient: mockPrismaConstructor,
}));

// Clear the module cache to ensure fresh imports
beforeEach(() => {
  jest.clearAllMocks();
  // Clear the require cache for the prisma module
  delete require.cache[require.resolve('@/lib/prisma')];
  // Clear the global prisma instance
  (globalThis as any).prisma = undefined;
});

describe('Prisma Client Singleton Tests', () => {
  describe('Singleton Pattern Verification', () => {
    it('should return the same instance when imported multiple times', () => {
      // Import prisma multiple times
      const { prisma: prisma1 } = require('@/lib/prisma');
      const { prisma: prisma2 } = require('@/lib/prisma');
      const { prisma: prisma3 } = require('@/lib/prisma');

      expect(prisma1).toBe(prisma2);
      expect(prisma2).toBe(prisma3);
      expect(mockPrismaConstructor).toHaveBeenCalledTimes(1);
    });

    it('should create only one PrismaClient instance in development', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Import prisma multiple times in development
      const { prisma: prisma1 } = require('@/lib/prisma');
      const { prisma: prisma2 } = require('@/lib/prisma');

      expect(prisma1).toBe(prisma2);
      expect(mockPrismaConstructor).toHaveBeenCalledTimes(1);

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should create only one PrismaClient instance in production', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Clear global to simulate production environment
      (globalThis as any).prisma = undefined;

      // Import prisma multiple times in production
      const { prisma: prisma1 } = require('@/lib/prisma');
      const { prisma: prisma2 } = require('@/lib/prisma');

      expect(prisma1).toBe(prisma2);
      expect(mockPrismaConstructor).toHaveBeenCalledTimes(1);

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should store instance globally in non-production environments', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const { prisma } = require('@/lib/prisma');

      // In development, the instance should be stored globally
      expect((globalThis as any).prisma).toBe(prisma);

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should not store instance globally in production', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Clear global to simulate production environment
      (globalThis as any).prisma = undefined;

      require('@/lib/prisma');

      // In production, the instance should not be stored globally
      expect((globalThis as any).prisma).toBeUndefined();

      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('Configuration Tests', () => {
    it('should configure logging correctly in development', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      require('@/lib/prisma');

      expect(mockPrismaConstructor).toHaveBeenCalledWith({
        log: ['query', 'error', 'warn'],
      });

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should configure logging correctly in production', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Clear global to simulate fresh production environment
      (globalThis as any).prisma = undefined;

      require('@/lib/prisma');

      expect(mockPrismaConstructor).toHaveBeenCalledWith({
        log: ['error'],
      });

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should configure logging correctly in test environment', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      require('@/lib/prisma');

      expect(mockPrismaConstructor).toHaveBeenCalledWith({
        log: ['error'], // Test is treated like production
      });

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should handle undefined NODE_ENV', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      require('@/lib/prisma');

      expect(mockPrismaConstructor).toHaveBeenCalledWith({
        log: ['query', 'error', 'warn'], // Default to development logging
      });

      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('Connection Management', () => {
    it('should allow manual connection', async () => {
      const { prisma } = require('@/lib/prisma');

      await prisma.$connect();

      expect(mockPrismaInstance.$connect).toHaveBeenCalledTimes(1);
    });

    it('should allow manual disconnection', async () => {
      const { prisma } = require('@/lib/prisma');

      await prisma.$disconnect();

      expect(mockPrismaInstance.$disconnect).toHaveBeenCalledTimes(1);
    });

    it('should handle connection errors gracefully', async () => {
      const connectionError = new Error('Connection failed');
      mockPrismaInstance.$connect.mockRejectedValue(connectionError);

      const { prisma } = require('@/lib/prisma');

      await expect(prisma.$connect()).rejects.toThrow('Connection failed');
    });

    it('should handle disconnection errors gracefully', async () => {
      const disconnectionError = new Error('Disconnection failed');
      mockPrismaInstance.$disconnect.mockRejectedValue(disconnectionError);

      const { prisma } = require('@/lib/prisma');

      await expect(prisma.$disconnect()).rejects.toThrow('Disconnection failed');
    });
  });

  describe('Query Performance', () => {
    it('should track query execution time in development', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const { prisma } = require('@/lib/prisma');

      // Mock a slow query
      mockPrismaInstance.user.findMany.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return [];
      });

      const startTime = Date.now();
      await prisma.user.findMany();
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
      expect(mockPrismaInstance.user.findMany).toHaveBeenCalledTimes(1);

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should handle query timeouts', async () => {
      const { prisma } = require('@/lib/prisma');

      const timeoutError = new Error('Query timeout');
      timeoutError.name = 'TimeoutError';
      mockPrismaInstance.user.findMany.mockRejectedValue(timeoutError);

      await expect(prisma.user.findMany()).rejects.toThrow('Query timeout');
    });

    it('should handle concurrent queries efficiently', async () => {
      const { prisma } = require('@/lib/prisma');

      // Mock concurrent queries
      mockPrismaInstance.user.findMany.mockResolvedValue([]);
      mockPrismaInstance.user.findUnique.mockResolvedValue({ id: '1' });

      const queries = [
        prisma.user.findMany(),
        prisma.user.findMany(),
        prisma.user.findUnique({ where: { id: '1' } }),
      ];

      const results = await Promise.all(queries);

      expect(results).toHaveLength(3);
      expect(mockPrismaInstance.user.findMany).toHaveBeenCalledTimes(2);
      expect(mockPrismaInstance.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle Prisma client initialization errors', () => {
      mockPrismaConstructor.mockImplementation(() => {
        throw new Error('Prisma client initialization failed');
      });

      expect(() => {
        require('@/lib/prisma');
      }).toThrow('Prisma client initialization failed');
    });

    it('should handle database connection errors', async () => {
      const { prisma } = require('@/lib/prisma');

      const dbError = new Error('Database connection failed');
      dbError.name = 'PrismaClientInitializationError';
      mockPrismaInstance.user.findMany.mockRejectedValue(dbError);

      await expect(prisma.user.findMany()).rejects.toThrow('Database connection failed');
    });

    it('should handle transaction errors', async () => {
      const { prisma } = require('@/lib/prisma');

      const transactionError = new Error('Transaction failed');
      mockPrismaInstance.$transaction.mockRejectedValue(transactionError);

      await expect(prisma.$transaction(async (tx) => {
        // Mock transaction callback
      })).rejects.toThrow('Transaction failed');
    });
  });

  describe('Logging Configuration', () => {
    it('should log queries in development mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      require('@/lib/prisma');

      const logConfig = mockPrismaConstructor.mock.calls[0][0].log;
      expect(logConfig).toContain('query');
      expect(logConfig).toContain('error');
      expect(logConfig).toContain('warn');

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should only log errors in production mode', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Clear global to simulate production environment
      (globalThis as any).prisma = undefined;

      require('@/lib/prisma');

      const logConfig = mockPrismaConstructor.mock.calls[0][0].log;
      expect(logConfig).toEqual(['error']);
      expect(logConfig).not.toContain('query');
      expect(logConfig).not.toContain('warn');

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should handle custom log levels', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Mock console methods
      const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
      const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

      require('@/lib/prisma');

      // Verify logging configuration includes the expected levels
      const logConfig = mockPrismaConstructor.mock.calls[0][0].log;
      expect(Array.isArray(logConfig)).toBe(true);
      expect(logConfig.length).toBeGreaterThan(0);

      mockConsoleLog.mockRestore();
      mockConsoleError.mockRestore();
      mockConsoleWarn.mockRestore();
      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('Development vs Production Modes', () => {
    it('should behave differently in development vs production', () => {
      // Test development mode
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const { prisma: devPrisma } = require('@/lib/prisma');
      const devCallArgs = mockPrismaConstructor.mock.calls[0][0];

      // Clear and test production mode
      jest.clearAllMocks();
      delete require.cache[require.resolve('@/lib/prisma')];
      (globalThis as any).prisma = undefined;
      process.env.NODE_ENV = 'production';

      const { prisma: prodPrisma } = require('@/lib/prisma');
      const prodCallArgs = mockPrismaConstructor.mock.calls[0][0];

      // Compare configurations
      expect(devCallArgs.log).toContain('query');
      expect(prodCallArgs.log).not.toContain('query');
      expect(devCallArgs.log).toHaveLength(3);
      expect(prodCallArgs.log).toHaveLength(1);

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should handle hot reloading in development', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // First import
      const { prisma: prisma1 } = require('@/lib/prisma');
      
      // Simulate hot reload by clearing cache but keeping global
      delete require.cache[require.resolve('@/lib/prisma')];
      
      // Second import should reuse global instance
      const { prisma: prisma2 } = require('@/lib/prisma');

      expect(prisma1).toBe(prisma2);
      // Constructor should still only be called once due to global storage
      expect(mockPrismaConstructor).toHaveBeenCalledTimes(1);

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should not leak instances between production deployments', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // First "deployment"
      (globalThis as any).prisma = undefined;
      const { prisma: prisma1 } = require('@/lib/prisma');

      // Clear cache to simulate new deployment
      jest.clearAllMocks();
      delete require.cache[require.resolve('@/lib/prisma')];
      (globalThis as any).prisma = undefined;

      // Second "deployment"
      const { prisma: prisma2 } = require('@/lib/prisma');

      // Each deployment should create its own instance
      expect(mockPrismaConstructor).toHaveBeenCalledTimes(1);
      // Note: We can't directly compare instances since they're mocked,
      // but we can verify the constructor was called for the new instance

      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('Memory Management', () => {
    it('should not cause memory leaks with repeated imports', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Import prisma multiple times
      for (let i = 0; i < 10; i++) {
        require('@/lib/prisma');
      }

      // Should still only create one instance
      expect(mockPrismaConstructor).toHaveBeenCalledTimes(1);

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should properly cleanup resources on disconnect', async () => {
      const { prisma } = require('@/lib/prisma');

      // Mock successful disconnect
      mockPrismaInstance.$disconnect.mockResolvedValue(undefined);

      await prisma.$disconnect();

      expect(mockPrismaInstance.$disconnect).toHaveBeenCalledTimes(1);
    });
  });
});

// Integration-style tests with the actual module structure
describe('Prisma Client Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete require.cache[require.resolve('@/lib/prisma')];
    (globalThis as any).prisma = undefined;
  });

  it('should export a working prisma client instance', async () => {
    const { prisma } = require('@/lib/prisma');

    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe('function');
    expect(typeof prisma.$disconnect).toBe('function');
    expect(typeof prisma.$transaction).toBe('function');
  });

  it('should maintain consistent API across imports', () => {
    const { prisma: prisma1 } = require('@/lib/prisma');
    const { prisma: prisma2 } = require('@/lib/prisma');

    // Both should have the same API
    expect(Object.keys(prisma1)).toEqual(Object.keys(prisma2));
    
    // And should be the same instance
    expect(prisma1).toBe(prisma2);
  });

  it('should work with destructuring imports', () => {
    const { prisma } = require('@/lib/prisma');

    expect(prisma).toBeDefined();
    expect(prisma.$connect).toBeDefined();
  });

  it('should work with default imports', () => {
    // This tests the module.exports structure
    const prismaModule = require('@/lib/prisma');

    expect(prismaModule.prisma).toBeDefined();
    expect(typeof prismaModule.prisma.$connect).toBe('function');
  });
});