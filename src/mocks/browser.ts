import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// 브라우저 환경에서 사용되는 MSW 워커 설정
export const worker = setupWorker(...handlers);

// 개발 환경에서만 워커 시작
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  worker.start({
    onUnhandledRequest: 'warn',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  }).then(() => {
    console.log('🔶 Mock Service Worker enabled in browser.');
  }).catch((error) => {
    console.error('Failed to start MSW worker:', error);
  });
}

export default worker;