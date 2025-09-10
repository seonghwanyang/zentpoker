# 🎯 ZentPoker 테스트 전략 및 실행 계획

## 📊 현재 상태 분석
- **전체 코드 커버리지**: ~3% (15개 API 중 1개만 테스트됨)
- **컴포넌트 테스트**: 0%
- **E2E 테스트**: 0%
- **심각한 테스트 갭**: 결제, 인증, 관리자 기능

## 🔥 Unit Test 전략

### Phase 1: Critical API Routes (우선순위: 긴급)
```javascript
// 테스트 대상 API 엔드포인트
1. /api/points/charge ✅ (완료)
2. /api/points/balance ⚠️ (필수)
3. /api/vouchers/purchase ⚠️ (필수)
4. /api/admin/payments/confirm ⚠️ (필수)
5. /api/auth/[...nextauth] ⚠️ (필수)
```

#### 1.1 결제 시스템 테스트
```typescript
// src/__tests__/api/points/balance/route.test.ts
describe('GET /api/points/balance', () => {
  test('인증된 사용자 포인트 조회')
  test('미인증 접근 차단')
  test('비활성 계정 차단')
  test('데이터베이스 오류 처리')
})

// src/__tests__/api/vouchers/purchase/route.test.ts
describe('POST /api/vouchers/purchase', () => {
  test('정회원 할인가 적용')
  test('게스트 정상가 적용')
  test('포인트 부족시 거부')
  test('트랜잭션 원자성 보장')
  test('동시 구매 요청 처리')
})
```

#### 1.2 인증/인가 테스트
```typescript
// src/__tests__/lib/auth/auth-middleware.test.ts
describe('Authentication Middleware', () => {
  test('유효한 세션 토큰 검증')
  test('만료된 토큰 거부')
  test('ADMIN 역할 검증')
  test('USER 역할 제한')
  test('SUSPENDED 상태 차단')
})
```

### Phase 2: Business Logic (우선순위: 높음)
```typescript
// src/__tests__/lib/config/pricing.test.ts
describe('Pricing Calculations', () => {
  test('정회원 바인권 가격: 8,000원')
  test('게스트 바인권 가격: 10,000원')
  test('리바이 가격 계산')
  test('최소/최대 충전 금액 검증')
})

// src/__tests__/lib/db/transactions.test.ts
describe('Database Transactions', () => {
  test('포인트 차감 원자성')
  test('바우처 생성 롤백')
  test('동시성 제어')
  test('데드락 방지')
})
```

### Phase 3: Components (우선순위: 중간)
```typescript
// src/__tests__/components/points/balance-card.test.tsx
describe('BalanceCard Component', () => {
  test('포인트 표시 포맷팅')
  test('로딩 상태 표시')
  test('에러 상태 처리')
  test('새로고침 기능')
})

// src/__tests__/components/vouchers/voucher-card.test.tsx
describe('VoucherCard Component', () => {
  test('바우처 상태 표시')
  test('만료일 경고')
  test('사용 버튼 활성화')
})
```

## 🌐 E2E Test 전략 (Playwright MCP)

### Critical User Journeys

#### Journey 1: 완전한 결제 플로우
```typescript
// e2e/payment-flow.spec.ts
test.describe('Payment Complete Flow', () => {
  test('신규 유저 가입 → 포인트 충전 → 바우처 구매', async ({ page }) => {
    // 1. Google OAuth 로그인
    await page.goto('/login')
    await page.click('button:has-text("Google로 시작하기")')
    
    // 2. 포인트 충전 페이지
    await page.goto('/points/charge')
    await page.fill('input[name="amount"]', '30000')
    await page.click('button:has-text("충전하기")')
    
    // 3. KakaoPay 결제 모달
    await page.waitForSelector('[data-testid="kakao-pay-modal"]')
    
    // 4. 관리자 승인 (별도 브라우저 컨텍스트)
    const adminContext = await browser.newContext()
    const adminPage = await adminContext.newPage()
    await adminPage.goto('/admin/payments/confirm')
    await adminPage.click('[data-testid="approve-payment"]')
    
    // 5. 사용자 포인트 확인
    await page.goto('/points')
    await expect(page.locator('[data-testid="balance"]')).toHaveText('30,000')
    
    // 6. 바우처 구매
    await page.goto('/vouchers/purchase')
    await page.selectOption('select[name="type"]', 'BUYIN')
    await page.fill('input[name="quantity"]', '2')
    await page.click('button:has-text("구매하기")')
    
    // 7. 잔액 확인
    await expect(page.locator('[data-testid="balance"]')).toHaveText('10,000')
  })
})
```

#### Journey 2: 토너먼트 참가
```typescript
// e2e/tournament-entry.spec.ts
test.describe('Tournament Entry Flow', () => {
  test('토너먼트 목록 → 참가 → 바우처 사용', async ({ page }) => {
    // 1. 로그인 상태 설정
    await page.goto('/tournaments')
    
    // 2. 토너먼트 선택
    await page.click('[data-testid="tournament-card"]:first-child')
    
    // 3. 참가 신청
    await page.click('button:has-text("참가하기")')
    
    // 4. 바우처 선택
    await page.selectOption('[data-testid="voucher-select"]', 'BUYIN')
    await page.click('button:has-text("확인")')
    
    // 5. 참가 확인
    await expect(page.locator('[data-testid="entry-status"]')).toHaveText('참가 완료')
  })
})
```

#### Journey 3: 관리자 워크플로우
```typescript
// e2e/admin-workflow.spec.ts
test.describe('Admin Management', () => {
  test('회원 관리 → 포인트 조정 → 보고서 확인', async ({ page }) => {
    // 1. 관리자 로그인
    await loginAsAdmin(page)
    
    // 2. 회원 목록
    await page.goto('/admin/members')
    await page.fill('input[placeholder="검색..."]', 'test@example.com')
    
    // 3. 회원 상세
    await page.click('[data-testid="member-row"]:first-child')
    
    // 4. 포인트 조정
    await page.click('button:has-text("포인트 조정")')
    await page.fill('input[name="amount"]', '10000')
    await page.fill('textarea[name="reason"]', '이벤트 보상')
    await page.click('button:has-text("확인")')
    
    // 5. 보고서 확인
    await page.goto('/admin/reports')
    await expect(page.locator('[data-testid="daily-revenue"]')).toBeVisible()
  })
})
```

### Performance Testing
```typescript
// e2e/performance.spec.ts
test.describe('Performance Tests', () => {
  test('동시 사용자 50명 포인트 조회', async ({ page }) => {
    const promises = Array.from({ length: 50 }, async (_, i) => {
      const context = await browser.newContext()
      const page = await context.newPage()
      await page.goto('/api/points/balance')
      const startTime = Date.now()
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(1000) // 1초 이내
      await context.close()
    })
    
    await Promise.all(promises)
  })
})
```

## 📋 실행 계획

### Week 1: Critical Unit Tests
```bash
# Day 1-2: API 테스트
npm run test:api -- --coverage

# Day 3-4: 비즈니스 로직
npm run test:lib -- --coverage

# Day 5: 통합 테스트
npm run test:integration
```

### Week 2: Component & E2E Tests
```bash
# Day 1-2: 컴포넌트 테스트
npm run test:components

# Day 3-5: E2E 설정 및 구현
npx playwright install
npm run test:e2e
```

## 🛠 테스트 인프라 설정

### 1. Playwright MCP 설정
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
})
```

### 2. 테스트 데이터베이스
```bash
# .env.test
DATABASE_URL="postgresql://test_db_url"

# 테스트 전 초기화
npm run db:test:reset
```

### 3. Mock 서버
```typescript
// mocks/handlers.ts
export const handlers = [
  rest.post('/api/kakao/pay', (req, res, ctx) => {
    return res(ctx.json({ paymentId: 'mock-payment-123' }))
  }),
  rest.get('https://accounts.google.com/oauth', (req, res, ctx) => {
    return res(ctx.json({ access_token: 'mock-token' }))
  }),
]
```

## 📈 Coverage Goals

### Phase 1 (2주)
- API Routes: 80%
- Business Logic: 90%
- Critical Paths: 100%

### Phase 2 (4주)
- Components: 70%
- E2E Journeys: 100%
- Overall: 75%

### Phase 3 (6주)
- Full Coverage: 85%
- Performance Tests: 완료
- Security Tests: 완료

## 🚀 CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## 📊 보고서 템플릿

### Daily Test Report
```markdown
## Test Execution Report - [Date]

### Summary
- Total Tests: 245
- Passed: 238 ✅
- Failed: 5 ❌
- Skipped: 2 ⏭️
- Coverage: 73.4%

### Failed Tests
1. `POST /api/vouchers/purchase` - Timeout issue
2. `Admin workflow E2E` - Element not found

### New Coverage
- Added: payment confirmation flow
- Improved: +5% API coverage

### Tomorrow's Plan
- Fix failing tests
- Add tournament management tests
```

## 🎯 Success Metrics

1. **Zero Critical Bugs** in production
2. **< 1% Test Flakiness**
3. **< 5min Total Test Runtime**
4. **> 80% Code Coverage**
5. **100% Critical Path Coverage**

## 🔄 Continuous Improvement

1. **Weekly Test Review** - 금요일 오후
2. **Monthly Coverage Analysis** - 월말
3. **Quarterly Security Audit** - 분기별
4. **Performance Baseline Update** - 격월

---

## Quick Start Commands

```bash
# 전체 테스트 실행
npm run test:all

# 특정 파일 테스트
npm test -- src/__tests__/api/points/balance.test.ts

# E2E 테스트 (헤드리스)
npm run test:e2e

# E2E 테스트 (UI 모드)
npm run test:e2e:ui

# Coverage 리포트
npm run test:coverage

# Watch 모드
npm run test:watch
```

이 계획을 따라 체계적으로 테스트를 구현하면 ZentPoker의 안정성과 품질을 보장할 수 있습니다.