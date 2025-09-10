import { teardownTestEnvironment } from '../utils/db-helpers';
import { server } from '../../src/mocks/server';

async function globalTeardown() {
  console.log('🧹 Starting E2E test global teardown...');

  try {
    // MSW 서버 종료
    server.close();
    console.log('✅ Mock Service Worker stopped');

    // 테스트 데이터베이스 정리
    await teardownTestEnvironment();
    console.log('✅ Test database cleanup completed');

    console.log('🎯 E2E test global teardown completed');
  } catch (error) {
    console.error('❌ E2E test global teardown failed:', error);
    // teardown 실패는 전체 테스트를 중단시키지 않음
  }
}

export default globalTeardown;