import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Node.js 환경에서 사용되는 MSW 서버 설정
export const server = setupServer(...handlers);

// 서버 시작
server.listen({
  onUnhandledRequest: 'warn',
});

console.log('🔶 Mock Service Worker enabled.');

// 프로세스 종료 시 서버 정리
process.on('exit', () => {
  server.close();
});

process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.close();
  process.exit(0);
});

export default server;