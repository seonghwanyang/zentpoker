import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function globalTeardown() {
  console.log('🧹 Starting E2E test global teardown...');

  try {
    await prisma.$connect();
    
    // Clean up test data
    await cleanupTestData();
    
    // Optional: Reset test database completely
    if (process.env.E2E_CLEANUP_DB === 'true') {
      console.log('🗑️ Performing complete database cleanup...');
      execSync('npm run db:test:reset', { stdio: 'inherit' });
    }
    
    console.log('✅ E2E test global teardown completed');
    
  } catch (error) {
    console.error('❌ E2E test global teardown failed:', error);
    // Don't throw - teardown failures shouldn't fail the test run
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanupTestData() {
  console.log('🧼 Cleaning up test data...');
  
  try {
    // Clean up in reverse dependency order
    await prisma.tournamentEntry.deleteMany({
      where: {
        user: {
          email: {
            contains: '.test'
          }
        }
      }
    });
    
    await prisma.voucherUsage.deleteMany({
      where: {
        user: {
          email: {
            contains: '.test'
          }
        }
      }
    });
    
    await prisma.pointTransaction.deleteMany({
      where: {
        user: {
          email: {
            contains: '.test'
          }
        }
      }
    });
    
    await prisma.payment.deleteMany({
      where: {
        user: {
          email: {
            contains: '.test'
          }
        }
      }
    });
    
    // Delete test tournaments
    await prisma.tournament.deleteMany({
      where: {
        name: {
          contains: 'E2E Test'
        }
      }
    });
    
    // Delete test vouchers
    await prisma.voucher.deleteMany({
      where: {
        code: {
          startsWith: 'E2E-TEST'
        }
      }
    });
    
    // Delete test user profiles
    await prisma.userProfile.deleteMany({
      where: {
        user: {
          email: {
            contains: '.test'
          }
        }
      }
    });
    
    // Delete test users
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '.test'
        }
      }
    });
    
    console.log('✅ Test data cleanup completed');
    
  } catch (error) {
    console.error('❌ Test data cleanup failed:', error);
    // Continue with teardown even if cleanup fails
  }
}

export default globalTeardown;