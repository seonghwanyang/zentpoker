// 환경에 따른 MSW 설정을 자동으로 선택
export async function enableMocking() {
  if (typeof window === 'undefined') {
    // Node.js 환경 (서버, 테스트)
    const { server } = await import('./server');
    server.listen();
    return server;
  } else {
    // 브라우저 환경
    const { worker } = await import('./browser');
    await worker.start();
    return worker;
  }
}

export { handlers } from './handlers';
export { server } from './server';

// 브라우저에서만 worker를 export
if (typeof window !== 'undefined') {
  export { worker } from './browser';
}