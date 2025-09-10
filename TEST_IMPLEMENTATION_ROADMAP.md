# 🗺️ ZentPoker 테스트 구현 로드맵

## 📅 6주 구현 계획

### Week 1: Foundation (기반 구축)
#### Day 1-2: 테스트 환경 설정
```bash
# 필요 패키지 설치
npm install --save-dev @playwright/test playwright-mcp msw @faker-js/faker
npm install --save-dev @testing-library/react @testing-library/react-hooks
npm install --save-dev supertest node-mocks-http

# Playwright 초기화
npx playwright install
npx playwright install-deps

# 테스트 DB 설정
createdb zentpoker_test
```

**작업 항목:**
- [ ] Jest 설정 최적화
- [ ] Playwright 설정 파일 생성
- [ ] 테스트 데이터베이스 구성
- [ ] Mock 서버 설정 (MSW)
- [ ] CI/CD 파이프라인 구성

#### Day 3-5: Critical API Tests
```typescript
// 구현할 테스트 파일들
✅ src/__tests__/api/points/charge/route.test.ts (완료)
⏳ src/__tests__/api/points/balance/route.test.ts
⏳ src/__tests__/api/vouchers/purchase/route.test.ts
⏳ src/__tests__/api/vouchers/list/route.test.ts
⏳ src/__tests__/api/admin/payments/confirm/route.test.ts
```

### Week 2: Core Business Logic
#### Day 6-8: 인증/인가 테스트
```typescript
// 구현 예정
src/__tests__/lib/auth/
├── auth-options.test.ts      // NextAuth 설정
├── session-validation.test.ts // 세션 검증
├── role-guard.test.ts        // 역할 기반 접근
└── oauth-flow.test.ts        // OAuth 플로우
```

#### Day 9-10: 데이터베이스 트랜잭션
```typescript
// 구현 예정
src/__tests__/lib/db/
├── transactions.test.ts      // 트랜잭션 무결성
├── concurrent-access.test.ts // 동시성 제어
└── rollback-scenarios.test.ts // 롤백 시나리오
```

### Week 3: Component Testing
#### Day 11-13: UI 컴포넌트
```typescript
// 우선순위 컴포넌트
src/__tests__/components/
├── points/
│   ├── balance-card.test.tsx
│   └── charge-form.test.tsx
├── vouchers/
│   ├── voucher-card.test.tsx
│   └── purchase-modal.test.tsx
└── layout/
    ├── header.test.tsx
    └── sidebar.test.tsx
```

#### Day 14-15: 통합 테스트
```typescript
// 페이지 레벨 통합 테스트
src/__tests__/pages/
├── dashboard.test.tsx
├── points-charge.test.tsx
└── voucher-purchase.test.tsx
```

### Week 4: E2E Implementation
#### Day 16-18: Critical E2E Flows
```typescript
// Playwright 테스트
e2e/
├── auth/
│   ├── login.spec.ts
│   └── logout.spec.ts
├── payment/
│   ├── charge-points.spec.ts
│   └── purchase-voucher.spec.ts
└── admin/
    ├── approve-payment.spec.ts
    └── manage-members.spec.ts
```

#### Day 19-20: Cross-browser Testing
```typescript
// 멀티 브라우저 설정
playwright.config.ts
projects: [
  { name: 'chromium' },
  { name: 'firefox' },
  { name: 'webkit' },
  { name: 'mobile-chrome' },
  { name: 'mobile-safari' }
]
```

### Week 5: Advanced Testing
#### Day 21-23: Performance Testing
```typescript
// 성능 테스트
e2e/performance/
├── load-testing.spec.ts      // 부하 테스트
├── stress-testing.spec.ts    // 스트레스 테스트
└── memory-leaks.spec.ts      // 메모리 누수
```

#### Day 24-25: Security Testing
```typescript
// 보안 테스트
src/__tests__/security/
├── sql-injection.test.ts     // SQL 인젝션
├── xss-prevention.test.ts    // XSS 방지
├── auth-bypass.test.ts       // 인증 우회
└── rate-limiting.test.ts     // Rate Limiting
```

### Week 6: Polish & Documentation
#### Day 26-28: 테스트 리팩토링
- 테스트 코드 최적화
- 헬퍼 함수 추출
- 테스트 데이터 팩토리
- 커스텀 매처 생성

#### Day 29-30: 문서화 및 리포팅
- 테스트 커버리지 리포트
- 테스트 실행 가이드
- CI/CD 통합 완료
- 팀 교육 자료

## 🎯 일일 작업 체크리스트

### 매일 반복 작업
```bash
# 아침 (09:00)
□ 전날 테스트 결과 확인
□ CI/CD 파이프라인 상태 체크
□ 테스트 실패 원인 분석

# 오전 (10:00-12:00)
□ 신규 테스트 작성
□ 코드 리뷰
□ PR 생성

# 오후 (14:00-17:00)
□ 테스트 실행 및 디버깅
□ 커버리지 확인
□ 문서 업데이트

# 저녁 (17:00-18:00)
□ 일일 리포트 작성
□ 다음날 계획 수립
□ CI/CD 실행
```

## 📊 주간 마일스톤

### Week 1 목표
- ✅ 테스트 환경 100% 구성
- ✅ API 테스트 5개 완료
- ✅ 커버리지 20% 달성

### Week 2 목표
- ✅ 인증/인가 테스트 완료
- ✅ DB 트랜잭션 테스트 완료
- ✅ 커버리지 35% 달성

### Week 3 목표
- ✅ 핵심 컴포넌트 테스트 완료
- ✅ 페이지 통합 테스트 완료
- ✅ 커버리지 50% 달성

### Week 4 목표
- ✅ E2E Critical Path 완료
- ✅ Cross-browser 테스트 완료
- ✅ 커버리지 65% 달성

### Week 5 목표
- ✅ 성능 테스트 완료
- ✅ 보안 테스트 완료
- ✅ 커버리지 75% 달성

### Week 6 목표
- ✅ 전체 테스트 스위트 안정화
- ✅ 문서화 100% 완료
- ✅ 커버리지 80% 달성

## 🛠️ 테스트 도구 설정

### 1. Jest Configuration
```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
```

### 2. Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 3. MSW Setup
```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // Google OAuth Mock
  rest.get('https://accounts.google.com/oauth/authorize', (req, res, ctx) => {
    return res(
      ctx.status(302),
      ctx.set('Location', '/api/auth/callback/google?code=mock-code')
    );
  }),

  // KakaoPay Mock
  rest.post('https://kapi.kakao.com/v1/payment/ready', (req, res, ctx) => {
    return res(
      ctx.json({
        tid: 'T1234567890',
        next_redirect_pc_url: 'https://mockpay.kakao.com',
        created_at: new Date().toISOString(),
      })
    );
  }),

  // Test Database Reset
  rest.post('/api/test/reset-db', async (req, res, ctx) => {
    // Reset database logic
    return res(ctx.json({ success: true }));
  }),
];

// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

## 📈 커버리지 목표 추적

### 현재 상태 (Week 0)
```
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files            |    3.2  |     2.8  |    4.1  |    3.2  |
 api/points/charge   |   92.1  |    88.5  |   95.0  |   92.1  | ✅
 api/points/balance  |    0.0  |     0.0  |    0.0  |    0.0  | ❌
 api/vouchers        |    0.0  |     0.0  |    0.0  |    0.0  | ❌
 components          |    0.0  |     0.0  |    0.0  |    0.0  | ❌
 lib/auth            |    0.0  |     0.0  |    0.0  |    0.0  | ❌
```

### 목표 상태 (Week 6)
```
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files            |   80.0  |    75.0  |   80.0  |   80.0  |
 api/*               |   85.0  |    80.0  |   85.0  |   85.0  | ✅
 components/*        |   75.0  |    70.0  |   75.0  |   75.0  | ✅
 lib/*               |   90.0  |    85.0  |   90.0  |   90.0  | ✅
 pages/*             |   70.0  |    65.0  |   70.0  |   70.0  | ✅
```

## 🚀 Quick Commands

```bash
# Unit Tests
npm run test:unit           # 모든 유닛 테스트
npm run test:unit:watch     # Watch 모드
npm run test:unit:coverage  # 커버리지 포함

# Integration Tests  
npm run test:integration    # 통합 테스트
npm run test:api            # API 테스트만

# E2E Tests
npm run test:e2e            # 모든 E2E 테스트
npm run test:e2e:headed     # 브라우저 표시
npm run test:e2e:debug      # 디버그 모드
npm run test:e2e:critical   # Critical Path만

# Reports
npm run test:report         # HTML 리포트 생성
npm run coverage:report     # 커버리지 리포트
npm run test:ci             # CI 환경용

# Utilities
npm run test:reset-db       # 테스트 DB 리셋
npm run test:seed           # 테스트 데이터 시드
```

## ✅ 완료 기준

### 테스트 품질
- [ ] 모든 Critical Path 100% 커버
- [ ] API 엔드포인트 85% 이상 커버
- [ ] 컴포넌트 70% 이상 커버
- [ ] 0 High/Critical 버그

### 성능 기준
- [ ] 전체 테스트 10분 이내 실행
- [ ] E2E 테스트 5분 이내 실행
- [ ] 테스트 Flakiness < 1%

### 문서화
- [ ] 모든 테스트 케이스 문서화
- [ ] 테스트 실행 가이드 작성
- [ ] CI/CD 파이프라인 문서
- [ ] 트러블슈팅 가이드

## 🎉 최종 결과물

1. **완벽한 테스트 커버리지**
   - 80% 이상 코드 커버리지
   - 100% Critical Path 커버리지

2. **자동화된 테스트 파이프라인**
   - PR당 자동 테스트 실행
   - 일일 Regression 테스트
   - 주간 Full Suite 실행

3. **상세한 테스트 리포트**
   - 실시간 대시보드
   - 트렌드 분석
   - 버그 추적

4. **팀 역량 향상**
   - 테스트 작성 가이드라인
   - 베스트 프랙티스 문서
   - 교육 세션 자료

---

이 로드맵을 따라 6주 안에 ZentPoker의 완벽한 테스트 인프라를 구축할 수 있습니다!