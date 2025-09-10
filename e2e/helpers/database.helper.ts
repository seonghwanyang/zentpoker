import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export class DatabaseHelper {
  constructor(private prisma: PrismaClient) {}

  // User management
  /**
   * Create test user
   */
  async createTestUser(options: {
    email?: string;
    name?: string;
    role?: 'ADMIN' | 'MEMBER';
    status?: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
    points?: number;
  } = {}) {
    const userData = {
      email: options.email || faker.internet.email(),
      name: options.name || faker.person.fullName(),
      role: options.role || 'MEMBER',
      status: options.status || 'ACTIVE',
      points: options.points || 1000,
    };

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        profile: {
          create: {
            displayName: userData.name,
            bio: `Test user created by E2E tests`,
          }
        }
      },
      include: {
        profile: true,
      }
    });

    return user;
  }

  /**
   * Delete test user
   */
  async deleteTestUser(email: string) {
    // Delete related data first
    await this.prisma.userProfile.deleteMany({
      where: { user: { email } }
    });
    
    await this.prisma.pointTransaction.deleteMany({
      where: { user: { email } }
    });
    
    await this.prisma.payment.deleteMany({
      where: { user: { email } }
    });
    
    await this.prisma.tournamentEntry.deleteMany({
      where: { user: { email } }
    });
    
    await this.prisma.voucherUsage.deleteMany({
      where: { user: { email } }
    });

    // Delete user
    await this.prisma.user.delete({
      where: { email }
    });
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        pointTransactions: true,
        payments: true,
        tournamentEntries: true,
        voucherUsages: true,
      }
    });
  }

  /**
   * Update user points
   */
  async updateUserPoints(email: string, points: number) {
    return await this.prisma.user.update({
      where: { email },
      data: { points },
    });
  }

  // Tournament management
  /**
   * Create test tournament
   */
  async createTestTournament(options: {
    name?: string;
    maxParticipants?: number;
    entryFee?: number;
    prizePool?: number;
    startDate?: Date;
    endDate?: Date;
    status?: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  } = {}) {
    return await this.prisma.tournament.create({
      data: {
        name: options.name || `Test Tournament ${faker.string.alphanumeric(5)}`,
        description: faker.lorem.sentences(2),
        maxParticipants: options.maxParticipants || 100,
        entryFee: options.entryFee || 1000,
        prizePool: options.prizePool || 50000,
        startDate: options.startDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
        endDate: options.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: options.status || 'UPCOMING',
      }
    });
  }

  /**
   * Delete test tournament
   */
  async deleteTestTournament(tournamentId: string) {
    // Delete related entries first
    await this.prisma.tournamentEntry.deleteMany({
      where: { tournamentId }
    });

    return await this.prisma.tournament.delete({
      where: { id: tournamentId }
    });
  }

  /**
   * Enter user in tournament
   */
  async enterUserInTournament(userEmail: string, tournamentId: string) {
    const user = await this.prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) throw new Error('User not found');

    return await this.prisma.tournamentEntry.create({
      data: {
        userId: user.id,
        tournamentId,
        enteredAt: new Date(),
      }
    });
  }

  // Voucher management
  /**
   * Create test voucher
   */
  async createTestVoucher(options: {
    code?: string;
    type?: 'POINTS' | 'DISCOUNT';
    value?: number;
    validUntil?: Date;
    usageLimit?: number;
    isActive?: boolean;
  } = {}) {
    return await this.prisma.voucher.create({
      data: {
        code: options.code || `TEST-${faker.string.alphanumeric(8).toUpperCase()}`,
        type: options.type || 'POINTS',
        value: options.value || 1000,
        description: faker.lorem.sentence(),
        validUntil: options.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: options.isActive ?? true,
        usageLimit: options.usageLimit || 100,
        usageCount: 0,
      }
    });
  }

  /**
   * Use voucher
   */
  async useVoucher(userEmail: string, voucherCode: string) {
    const user = await this.prisma.user.findUnique({ where: { email: userEmail } });
    const voucher = await this.prisma.voucher.findUnique({ where: { code: voucherCode } });
    
    if (!user || !voucher) {
      throw new Error('User or voucher not found');
    }

    // Create usage record
    await this.prisma.voucherUsage.create({
      data: {
        userId: user.id,
        voucherId: voucher.id,
        usedAt: new Date(),
      }
    });

    // Update voucher usage count
    await this.prisma.voucher.update({
      where: { id: voucher.id },
      data: { usageCount: { increment: 1 } }
    });

    return voucher;
  }

  // Payment management
  /**
   * Create test payment
   */
  async createTestPayment(userEmail: string, options: {
    amount?: number;
    method?: 'KAKAO_PAY' | 'BANK_TRANSFER';
    status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    points?: number;
  } = {}) {
    const user = await this.prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) throw new Error('User not found');

    return await this.prisma.payment.create({
      data: {
        userId: user.id,
        amount: options.amount || 10000,
        method: options.method || 'KAKAO_PAY',
        status: options.status || 'PENDING',
        points: options.points || 1000,
        externalTransactionId: faker.string.alphanumeric(20),
      }
    });
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(paymentId: string, status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED') {
    return await this.prisma.payment.update({
      where: { id: paymentId },
      data: { 
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      }
    });
  }

  // Point transaction management
  /**
   * Create point transaction
   */
  async createPointTransaction(userEmail: string, options: {
    type?: 'CHARGE' | 'USE' | 'REFUND' | 'ADJUSTMENT';
    amount?: number;
    description?: string;
  } = {}) {
    const user = await this.prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) throw new Error('User not found');

    return await this.prisma.pointTransaction.create({
      data: {
        userId: user.id,
        type: options.type || 'CHARGE',
        amount: options.amount || 1000,
        description: options.description || 'Test transaction',
        balanceAfter: user.points + (options.amount || 1000),
      }
    });
  }

  // Cleanup methods
  /**
   * Clean up all test data
   */
  async cleanupTestData() {
    // Delete in reverse dependency order
    await this.prisma.voucherUsage.deleteMany({
      where: {
        user: { email: { contains: 'test' } }
      }
    });

    await this.prisma.pointTransaction.deleteMany({
      where: {
        user: { email: { contains: 'test' } }
      }
    });

    await this.prisma.payment.deleteMany({
      where: {
        user: { email: { contains: 'test' } }
      }
    });

    await this.prisma.tournamentEntry.deleteMany({
      where: {
        user: { email: { contains: 'test' } }
      }
    });

    await this.prisma.userProfile.deleteMany({
      where: {
        user: { email: { contains: 'test' } }
      }
    });

    await this.prisma.user.deleteMany({
      where: {
        email: { contains: 'test' }
      }
    });

    await this.prisma.tournament.deleteMany({
      where: {
        name: { contains: 'Test' }
      }
    });

    await this.prisma.voucher.deleteMany({
      where: {
        code: { startsWith: 'TEST-' }
      }
    });
  }

  /**
   * Reset database to clean state
   */
  async resetDatabase() {
    // Truncate all tables in correct order
    const tablenames = await this.prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations') {
        await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
      }
    }
  }

  /**
   * Seed test data
   */
  async seedTestData() {
    // Create admin user
    const adminUser = await this.createTestUser({
      email: 'admin@zentpoker.test',
      name: 'Test Admin',
      role: 'ADMIN',
      points: 10000,
    });

    // Create member user
    const memberUser = await this.createTestUser({
      email: 'member@zentpoker.test',
      name: 'Test Member',
      role: 'MEMBER',
      points: 5000,
    });

    // Create test tournament
    const tournament = await this.createTestTournament({
      name: 'E2E Test Tournament',
      entryFee: 1000,
      prizePool: 50000,
    });

    // Create test voucher
    const voucher = await this.createTestVoucher({
      code: 'E2E-TEST-VOUCHER',
      value: 1000,
    });

    return {
      adminUser,
      memberUser,
      tournament,
      voucher,
    };
  }

  // Query helpers
  /**
   * Count records in table
   */
  async countRecords(tableName: string): Promise<number> {
    const result = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${tableName}"`);
    return Number((result as any)[0].count);
  }

  /**
   * Get table statistics
   */
  async getTableStats() {
    return {
      users: await this.prisma.user.count(),
      tournaments: await this.prisma.tournament.count(),
      vouchers: await this.prisma.voucher.count(),
      payments: await this.prisma.payment.count(),
      pointTransactions: await this.prisma.pointTransaction.count(),
    };
  }
}