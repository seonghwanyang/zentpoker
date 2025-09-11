# 🔄 NextAuth/Prisma → Supabase Auth 마이그레이션 가이드

## 현재 상황

### 발견된 문제
1. **NextAuth 흔적**: 42개 파일
2. **Prisma 사용**: 66개 파일
3. **Multiple Supabase 클라이언트 인스턴스**
4. **쿠키 파싱 에러** (base64-eyJ...)
5. **리다이렉트 루프** (미들웨어 ↔ AuthProvider)

### 데이터베이스 스키마
- NextAuth 테이블: `User`, `Session`, `Account`, `VerificationToken`
- Supabase Auth 사용 시 `auth.users` 테이블 사용
- 현재 혼재된 상태

## 즉시 해결 방법

### 1. 쿠키 완전 초기화
```bash
# 브라우저에서 실행
http://localhost:3001/force-clear-auth.html
```

### 2. 임시 미들웨어 비활성화
`src/middleware.ts`에서 인증 체크 임시 비활성화:
```typescript
export async function middleware(request: NextRequest) {
  // 임시로 인증 체크 비활성화
  return NextResponse.next();
}
```

## 단계별 마이그레이션

### Phase 1: 클라이언트 통합 ✅
- [x] 통합 Supabase 클라이언트 생성 (`src/lib/supabase/client.ts`)
- [ ] 모든 페이지에서 통합 클라이언트 사용

### Phase 2: API Routes 정리
- [ ] Prisma 제거하고 Supabase 클라이언트 사용
- [ ] NextAuth 관련 API 제거

### Phase 3: 미들웨어 개선
- [ ] 쿠키 파싱 에러 처리
- [ ] 리다이렉트 로직 정리

### Phase 4: 데이터베이스 정리
- [ ] NextAuth 테이블 제거
- [ ] User 테이블을 Supabase auth.users와 통합

## 코드 변경 예시

### Before (NextAuth + Prisma)
```typescript
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const session = await getServerSession(authOptions);
const user = await prisma.user.findUnique({
  where: { id: session.user.id }
});
```

### After (Supabase)
```typescript
import { createServerComponentClient } from "@/lib/supabase/client";

const supabase = await createServerComponentClient();
const { data: { user } } = await supabase.auth.getUser();
```

## 파일별 수정 필요 사항

### 1. 페이지 컴포넌트
- `/src/app/(member)/vouchers/page.tsx`
- `/src/app/(member)/points/page.tsx`
- `/src/app/(member)/tournaments/page.tsx`
- `/src/app/(member)/profile/page.tsx`

**변경 내용**:
```typescript
// Before
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
const supabase = createClientComponentClient();

// After
import { useAuth } from '@/lib/auth/supabase-auth';
const { user, loading } = useAuth();
```

### 2. API Routes
모든 `/src/app/api/**/*.ts` 파일:

**변경 내용**:
```typescript
// Before
import { prisma } from '@/lib/prisma';
await prisma.user.findUnique(...);

// After
import { createApiClient } from '@/lib/supabase/client';
const supabase = await createApiClient();
const { data } = await supabase.from('User').select().single();
```

### 3. 미들웨어
`/src/middleware.ts`:

**변경 내용**:
- 쿠키 파싱 에러 처리 추가
- 리다이렉트 로직 단순화

## 테스트 체크리스트

- [ ] 로그인 가능
- [ ] 로그아웃 가능
- [ ] 보호된 페이지 접근 시 로그인 페이지로 리다이렉트
- [ ] 로그인 후 원래 페이지로 리다이렉트
- [ ] 쿠키 파싱 에러 없음
- [ ] 무한 리다이렉트 없음

## 롤백 계획

문제 발생 시:
1. Git으로 이전 버전 복구
2. 쿠키 초기화
3. 미들웨어 비활성화
4. 단계별로 다시 진행