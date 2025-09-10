'use client';

import dynamic from 'next/dynamic';

// 클라이언트 사이드에서만 렌더링되도록 동적 import
const TestAuthClient = dynamic(
  () => import('@/components/test-auth-client'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }
);

export default function TestAuthPage() {
  return <TestAuthClient />;
}