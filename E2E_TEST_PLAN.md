# 🎭 ZentPoker E2E Test Plan with Playwright MCP

## 🚀 Playwright MCP 통합 전략

### MCP Server 설정
```json
// claude_desktop_config.json에 추가
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp-server"],
      "env": {
        "PLAYWRIGHT_HEADLESS": "false",
        "PLAYWRIGHT_BASE_URL": "http://localhost:3001"
      }
    }
  }
}
```

## 📝 E2E 테스트 시나리오 (우선순위별)

### 🔴 Critical Priority (즉시 구현)

#### 1. 완전한 결제 플로우 테스트
```typescript
// e2e/critical/payment-complete-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 데이터베이스 초기화
    await page.request.post('/api/test/reset-db');
  });

  test('신규 유저: 가입 → 충전 → 바우처 구매 → 잔액 확인', async ({ page }) => {
    // Step 1: 구글 OAuth 로그인
    await page.goto('/login');
    await page.click('[data-testid="google-login-btn"]');
    
    // OAuth Mock 처리
    await page.waitForURL('**/dashboard');
    
    // Step 2: 대시보드에서 포인트 확인 (0원)
    const initialBalance = await page.locator('[data-testid="point-balance"]').textContent();
    expect(initialBalance).toBe('0');
    
    // Step 3: 포인트 충전 페이지로 이동
    await page.click('[data-testid="charge-points-btn"]');
    await page.waitForURL('**/points/charge');
    
    // Step 4: 30,000원 충전 (게스트 가격)
    await page.fill('[data-testid="charge-amount"]', '30000');
    await page.click('[data-testid="charge-submit"]');
    
    // Step 5: KakaoPay 결제 링크 확인
    const paymentModal = page.locator('[data-testid="payment-modal"]');
    await expect(paymentModal).toBeVisible();
    
    // Step 6: 관리자 승인 시뮬레이션
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await adminLogin(adminPage);
    await adminPage.goto('/admin/payments/confirm');
    await adminPage.click(`[data-testid="approve-payment-${transactionId}"]`);
    await adminContext.close();
    
    // Step 7: 포인트 업데이트 확인
    await page.reload();
    const newBalance = await page.locator('[data-testid="point-balance"]').textContent();
    expect(newBalance).toBe('30,000');
    
    // Step 8: 바우처 구매
    await page.goto('/vouchers/purchase');
    await page.selectOption('[data-testid="voucher-type"]', 'BUYIN');
    await page.fill('[data-testid="voucher-quantity"]', '2');
    await page.click('[data-testid="purchase-voucher"]');
    
    // Step 9: 구매 확인 모달
    await page.click('[data-testid="confirm-purchase"]');
    
    // Step 10: 최종 잔액 확인 (30,000 - 20,000 = 10,000)
    await page.waitForURL('**/vouchers');
    const finalBalance = await page.locator('[data-testid="point-balance"]').textContent();
    expect(finalBalance).toBe('10,000');
    
    // Step 11: 바우처 목록 확인
    const voucherCount = await page.locator('[data-testid="voucher-item"]').count();
    expect(voucherCount).toBe(2);
  });

  test('포인트 부족시 바우처 구매 실패', async ({ page }) => {
    await loginAsUser(page, { points: 5000 });
    
    await page.goto('/vouchers/purchase');
    await page.selectOption('[data-testid="voucher-type"]', 'BUYIN');
    await page.fill('[data-testid="voucher-quantity"]', '1'); // 10,000원 필요
    await page.click('[data-testid="purchase-voucher"]');
    
    // 에러 메시지 확인
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toContainText('포인트가 부족합니다');
  });
});
```

#### 2. 토너먼트 참가 플로우
```typescript
// e2e/critical/tournament-entry-flow.spec.ts
test.describe('Tournament Entry Flow', () => {
  test('바우처로 토너먼트 참가', async ({ page }) => {
    // 사전 조건: 활성 바우처 보유
    await loginAsUser(page, { 
      points: 0,
      vouchers: [{ type: 'BUYIN', status: 'ACTIVE' }]
    });
    
    // Step 1: 토너먼트 목록
    await page.goto('/tournaments');
    
    // Step 2: 진행 예정 토너먼트 선택
    await page.click('[data-testid="tournament-status-UPCOMING"]:first-child');
    
    // Step 3: 참가 신청
    await page.click('[data-testid="join-tournament"]');
    
    // Step 4: 바우처 선택
    const voucherSelect = page.locator('[data-testid="select-voucher"]');
    await expect(voucherSelect).toBeVisible();
    await voucherSelect.selectOption({ label: 'Buy-in 바우처' });
    
    // Step 5: 참가 확인
    await page.click('[data-testid="confirm-entry"]');
    
    // Step 6: 성공 메시지
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('토너먼트 참가 완료');
    
    // Step 7: 바우처 상태 변경 확인
    await page.goto('/vouchers');
    const usedVoucher = page.locator('[data-testid="voucher-status-USED"]');
    await expect(usedVoucher).toBeVisible();
  });

  test('리바이 구매 및 사용', async ({ page }) => {
    // 토너먼트 참가 중 리바이
    await loginAsUser(page, { 
      tournamentEntry: true,
      points: 15000 
    });
    
    await page.goto('/tournaments/current');
    await page.click('[data-testid="rebuy-button"]');
    
    // 리바이 옵션 선택
    await page.click('[data-testid="use-points"]');
    await page.click('[data-testid="confirm-rebuy"]');
    
    // 포인트 차감 확인
    await expect(page.locator('[data-testid="point-balance"]')).toContainText('0');
  });
});
```

#### 3. 관리자 핵심 기능
```typescript
// e2e/critical/admin-core-functions.spec.ts
test.describe('Admin Core Functions', () => {
  test('결제 승인 프로세스', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Step 1: 대기중인 결제 목록
    await page.goto('/admin/payments/confirm');
    
    // Step 2: 필터링 - PENDING 상태만
    await page.selectOption('[data-testid="status-filter"]', 'PENDING');
    
    // Step 3: 결제 상세 보기
    await page.click('[data-testid="payment-row"]:first-child');
    
    // Step 4: 검증 정보 확인
    await expect(page.locator('[data-testid="user-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="amount"]')).toContainText('30,000');
    
    // Step 5: 승인 처리
    await page.click('[data-testid="approve-payment"]');
    await page.fill('[data-testid="admin-note"]', '입금 확인 완료');
    await page.click('[data-testid="confirm-approve"]');
    
    // Step 6: 상태 변경 확인
    await expect(page.locator('[data-testid="payment-status"]')).toContainText('COMPLETED');
  });

  test('회원 등급 변경', async ({ page }) => {
    await loginAsAdmin(page);
    
    await page.goto('/admin/members');
    await page.fill('[data-testid="search-member"]', 'test@example.com');
    await page.click('[data-testid="search-submit"]');
    
    await page.click('[data-testid="member-row"]:first-child');
    await page.selectOption('[data-testid="member-grade"]', 'REGULAR');
    await page.click('[data-testid="save-changes"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toContainText('등급 변경 완료');
  });
});
```

### 🟡 High Priority (1주 내 구현)

#### 4. 회원 프로필 관리
```typescript
// e2e/high/member-profile.spec.ts
test.describe('Member Profile Management', () => {
  test('프로필 정보 수정', async ({ page }) => {
    await loginAsUser(page);
    
    await page.goto('/profile');
    await page.fill('[data-testid="phone-input"]', '010-1234-5678');
    await page.click('[data-testid="save-profile"]');
    
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('포인트 거래 내역 조회', async ({ page }) => {
    await loginAsUser(page, { hasTransactions: true });
    
    await page.goto('/points');
    await page.click('[data-testid="view-transactions"]');
    
    const transactions = page.locator('[data-testid="transaction-row"]');
    await expect(transactions).toHaveCount(10); // 페이지네이션 기본값
    
    // 필터링 테스트
    await page.selectOption('[data-testid="type-filter"]', 'CHARGE');
    await expect(transactions.first()).toContainText('충전');
  });
});
```

#### 5. 검색 및 페이지네이션
```typescript
// e2e/high/search-pagination.spec.ts
test.describe('Search and Pagination', () => {
  test('토너먼트 검색', async ({ page }) => {
    await page.goto('/tournaments');
    
    await page.fill('[data-testid="search-tournament"]', 'Sunday');
    await page.press('[data-testid="search-tournament"]', 'Enter');
    
    const results = page.locator('[data-testid="tournament-card"]');
    const count = await results.count();
    
    for (let i = 0; i < count; i++) {
      await expect(results.nth(i)).toContainText(/Sunday/i);
    }
  });

  test('회원 목록 페이지네이션', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/members');
    
    // 첫 페이지
    await expect(page.locator('[data-testid="page-info"]')).toContainText('1 / ');
    
    // 다음 페이지
    await page.click('[data-testid="next-page"]');
    await expect(page.locator('[data-testid="page-info"]')).toContainText('2 / ');
    
    // 이전 페이지
    await page.click('[data-testid="prev-page"]');
    await expect(page.locator('[data-testid="page-info"]')).toContainText('1 / ');
  });
});
```

### 🟢 Medium Priority (2주 내 구현)

#### 6. 반응형 디자인 테스트
```typescript
// e2e/medium/responsive-design.spec.ts
test.describe('Responsive Design', () => {
  ['iPhone 12', 'iPad', 'Desktop Chrome'].forEach(device => {
    test(`${device} - 네비게이션 메뉴`, async ({ page, browserName }) => {
      await page.setViewportSize(devices[device].viewport);
      await page.goto('/');
      
      if (device.includes('iPhone')) {
        // 모바일: 햄버거 메뉴
        await page.click('[data-testid="mobile-menu-toggle"]');
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      } else {
        // 데스크톱: 일반 메뉴
        await expect(page.locator('[data-testid="desktop-menu"]')).toBeVisible();
      }
    });
  });
});
```

#### 7. 에러 처리 및 복구
```typescript
// e2e/medium/error-handling.spec.ts
test.describe('Error Handling', () => {
  test('네트워크 오류 처리', async ({ page, context }) => {
    // 네트워크 차단
    await context.route('**/api/**', route => route.abort());
    
    await loginAsUser(page);
    await page.goto('/points/charge');
    await page.fill('[data-testid="charge-amount"]', '10000');
    await page.click('[data-testid="charge-submit"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('네트워크 오류');
    
    // 재시도 버튼
    await context.unroute('**/api/**');
    await page.click('[data-testid="retry-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('세션 만료 처리', async ({ page }) => {
    await loginAsUser(page);
    
    // 세션 만료 시뮬레이션
    await page.evaluate(() => {
      localStorage.removeItem('session-token');
    });
    
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('[data-testid="session-expired-message"]')).toBeVisible();
  });
});
```

### 🔵 Low Priority (필요시 구현)

#### 8. 접근성 테스트
```typescript
// e2e/low/accessibility.spec.ts
test.describe('Accessibility', () => {
  test('키보드 네비게이션', async ({ page }) => {
    await page.goto('/');
    
    // Tab 키로 네비게이션
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'first-link');
    
    // Enter로 선택
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/expected-url');
  });

  test('스크린 리더 호환성', async ({ page }) => {
    await page.goto('/login');
    
    const loginButton = page.locator('[data-testid="google-login-btn"]');
    await expect(loginButton).toHaveAttribute('aria-label', 'Google로 로그인');
  });
});
```

## 🏃 Performance Testing

### 부하 테스트
```typescript
// e2e/performance/load-testing.spec.ts
test.describe('Load Testing', () => {
  test('동시 사용자 100명 시뮬레이션', async ({ browser }) => {
    const contexts = [];
    const results = [];
    
    // 100명 동시 접속
    for (let i = 0; i < 100; i++) {
      const context = await browser.newContext();
      contexts.push(context);
      
      const page = await context.newPage();
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      results.push(loadTime);
    }
    
    // 평균 로딩 시간
    const avgLoadTime = results.reduce((a, b) => a + b, 0) / results.length;
    expect(avgLoadTime).toBeLessThan(3000); // 3초 이내
    
    // 95 퍼센타일
    results.sort((a, b) => a - b);
    const p95 = results[Math.floor(results.length * 0.95)];
    expect(p95).toBeLessThan(5000); // 5초 이내
    
    // 정리
    for (const context of contexts) {
      await context.close();
    }
  });

  test('대용량 데이터 렌더링', async ({ page }) => {
    await loginAsAdmin(page);
    
    // 1000개 회원 목록
    await page.goto('/admin/members?limit=1000');
    
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="member-row"]:nth-child(100)');
    const renderTime = Date.now() - startTime;
    
    expect(renderTime).toBeLessThan(2000);
    
    // 스크롤 성능
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('[data-testid="member-row"]:last-child')).toBeVisible();
  });
});
```

## 🔧 테스트 유틸리티

### Helper Functions
```typescript
// e2e/helpers/auth.ts
export async function loginAsUser(page, options = {}) {
  const { points = 0, vouchers = [], grade = 'GUEST' } = options;
  
  // Mock 세션 설정
  await page.goto('/api/test/setup-user', {
    method: 'POST',
    data: { points, vouchers, grade }
  });
  
  await page.goto('/dashboard');
  await page.waitForSelector('[data-testid="user-menu"]');
}

export async function loginAsAdmin(page) {
  await page.goto('/api/test/setup-admin', { method: 'POST' });
  await page.goto('/admin/dashboard');
  await page.waitForSelector('[data-testid="admin-menu"]');
}

// e2e/helpers/database.ts
export async function resetDatabase(page) {
  await page.request.post('/api/test/reset-db');
}

export async function seedTestData(page, scenario) {
  await page.request.post('/api/test/seed', {
    data: { scenario }
  });
}
```

## 📊 실행 및 모니터링

### 실행 스크립트
```json
// package.json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:critical": "playwright test e2e/critical",
    "test:e2e:smoke": "playwright test --grep @smoke",
    "test:e2e:mobile": "playwright test --project=mobile",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report"
  }
}
```

### CI/CD 통합
```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Start application
        run: |
          npm run build
          npm run start &
          npx wait-on http://localhost:3001
          
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## 📈 Success Metrics

### Coverage Goals
- **Critical Paths**: 100% coverage
- **User Journeys**: 90% coverage
- **Edge Cases**: 80% coverage
- **Performance**: All metrics within SLA

### Performance SLA
- Page Load: < 2s (P50), < 5s (P95)
- API Response: < 500ms (P50), < 1s (P95)
- Database Query: < 100ms (P50), < 300ms (P95)

### Reliability
- Test Flakiness: < 1%
- False Positives: < 0.5%
- Test Runtime: < 10 minutes

## 🚦 테스트 실행 체크리스트

### Daily
- [ ] Critical path smoke tests
- [ ] Payment flow validation
- [ ] Admin function checks

### Per PR
- [ ] Affected feature tests
- [ ] Regression suite
- [ ] Performance baseline

### Weekly
- [ ] Full E2E suite
- [ ] Cross-browser testing
- [ ] Mobile responsiveness

### Monthly
- [ ] Load testing
- [ ] Security testing
- [ ] Accessibility audit

---

이 계획에 따라 Playwright MCP를 활용한 포괄적인 E2E 테스트를 구현하면 ZentPoker의 모든 핵심 기능을 안정적으로 검증할 수 있습니다.