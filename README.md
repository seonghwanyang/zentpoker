# Zentpoker - 포인트 & 바인권 관리 시스템

홀덤 동호회를 위한 스마트한 포인트 관리 플랫폼

## 🚀 주요 기능

- **포인트 관리**: 카카오페이 연동으로 간편한 충전 및 관리
- **바인권 시스템**: 회원 등급별 차등 가격의 바인권/리바인권 구매
- **투명한 거래**: 모든 거래 내역 실시간 추적 및 감사 로그
- **관리자 대시보드**: 입금 확인, 회원 관리, 통계 분석
- **토너먼트 관리**: 토너먼트 생성 및 참가자 관리

## 🛠️ 기술 스택

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: NextAuth.js with Google OAuth
- **Hosting**: Vercel

## 📦 설치 방법

### 1. 저장소 클론
```bash
git clone https://github.com/yourusername/zentpoker.git
cd zentpoker
```

### 2. 패키지 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 `.env.example`을 참고하여 설정합니다.

### 4. 데이터베이스 설정
```bash
# Prisma 클라이언트 생성
npm run prisma:generate

# 데이터베이스 마이그레이션
npm run prisma:migrate

# (선택) Seed 데이터 생성
npm run prisma:seed
```

### 5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (member)/          # 회원 전용 페이지
│   ├── admin/             # 관리자 페이지
│   └── api/               # API 라우트
├── components/            # 재사용 컴포넌트
├── lib/                   # 유틸리티 및 라이브러리
├── types/                 # TypeScript 타입 정의
└── styles/               # 스타일 파일
```

## 🔑 주요 환경 변수

- `DATABASE_URL`: PostgreSQL 연결 문자열
- `NEXTAUTH_URL`: NextAuth 콜백 URL
- `GOOGLE_CLIENT_ID/SECRET`: Google OAuth 인증 정보
- `NEXT_PUBLIC_KAKAO_PAY_LINK`: 카카오페이 송금 링크

## 📝 라이선스

MIT License

## 👥 기여

기여를 환영합니다! Pull Request를 보내주세요.

## 📞 문의

문제가 있거나 질문이 있으시면 이슈를 생성해주세요.
