import { chromium, FullConfig } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test global setup...');

  try {
    // Check if database is available
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Reset test database
    console.log('📊 Resetting test database...');
    execSync('npm run db:test:reset', { stdio: 'inherit' });
    
    // Run database migrations for test environment
    console.log('🔄 Running test database migrations...');
    execSync('npm run db:test:migrate', { stdio: 'inherit' });
    
    // Seed test database
    console.log('🌱 Seeding test database...');
    execSync('npm run db:test:seed', { stdio: 'inherit' });

    // Create test users and data
    await setupTestData();
    
    // Verify application health
    await verifyApplicationHealth(config);

    console.log('🎯 E2E test global setup completed successfully');
    
  } catch (error) {
    console.error('❌ E2E test global setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function setupTestData() {
  console.log('🔧 Setting up test data...');
  
  // Create test admin user
  await prisma.user.upsert({
    where: { email: 'admin@zentpoker.test' },
    update: {},
    create: {
      email: 'admin@zentpoker.test',
      name: 'Test Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      points: 10000,
      profile: {
        create: {
          displayName: 'Test Admin',
          bio: 'E2E Test Admin User',
        }
      }
    }
  });

  // Create test member user
  await prisma.user.upsert({
    where: { email: 'member@zentpoker.test' },
    update: {},
    create: {
      email: 'member@zentpoker.test',
      name: 'Test Member',
      role: 'MEMBER',
      status: 'ACTIVE',
      points: 5000,
      profile: {
        create: {
          displayName: 'Test Member',
          bio: 'E2E Test Member User',
        }
      }
    }
  });

  // Create test tournament
  await prisma.tournament.upsert({
    where: { 
      name: 'E2E Test Tournament'
    },
    update: {},
    create: {
      name: 'E2E Test Tournament',
      description: 'Tournament for E2E testing',
      maxParticipants: 100,
      entryFee: 1000,
      prizePool: 50000,
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      status: 'UPCOMING',
    }
  });

  // Create test vouchers
  await prisma.voucher.upsert({
    where: { code: 'E2E-TEST-VOUCHER' },
    update: {},
    create: {
      code: 'E2E-TEST-VOUCHER',
      type: 'POINTS',
      value: 1000,
      description: 'E2E Test Voucher',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
      usageLimit: 100,
    }
  });

  console.log('✅ Test data setup completed');
}

async function verifyApplicationHealth(config: FullConfig) {
  console.log('🏥 Performing application health check...');
  
  const browser = await chromium.launch({
    headless: true,
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  
  const page = await context.newPage();
  
  try {
    const baseURL = config.projects[0].use?.baseURL || 'http://localhost:3001';
    
    // Wait for application to be ready
    await page.goto(baseURL, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    
    // Check if main page loads
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Check basic navigation elements
    const title = await page.title();
    console.log(`📄 Application title: ${title}`);
    
    // Verify API health
    const response = await page.request.get(`${baseURL}/api/health`);
    if (!response.ok()) {
      console.warn('⚠️ API health check endpoint not available, continuing...');
    }
    
    console.log('✅ Application health check passed');
    
  } catch (error) {
    console.error('❌ Application health check failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;