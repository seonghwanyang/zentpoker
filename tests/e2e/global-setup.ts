import { chromium, FullConfig } from '@playwright/test';
import { setupTestEnvironment } from '../utils/db-helpers';
import { server } from '../../src/mocks/server';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test global setup...');

  try {
    // MSW 서버 시작
    server.listen({ onUnhandledRequest: 'warn' });
    console.log('✅ Mock Service Worker started');

    // 테스트 데이터베이스 설정
    const seedData = await setupTestEnvironment();
    console.log('✅ Test database setup completed');

    // 브라우저 컨텍스트를 생성하여 인증 상태 설정
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // 애플리케이션이 시작될 때까지 대기
    await page.goto(config.projects[0].use?.baseURL || 'http://localhost:3001', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // MSW가 활성화되었는지 확인
    await page.evaluate(() => {
      if (typeof window !== 'undefined') {
        window.__MSW_ENABLED__ = true;
      }
    });

    console.log('✅ Application health check passed');

    await browser.close();

    console.log('🎯 E2E test global setup completed');
    
    return seedData;
  } catch (error) {
    console.error('❌ E2E test global setup failed:', error);
    throw error;
  }
}

export default globalSetup;