# 📁 프로젝트 폴더 구조

```
poker-membership/
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── (auth)/                   # 인증 그룹
│   │   │   ├── login/                # 로그인 페이지
│   │   │   └── register/             # 회원가입 페이지
│   │   ├── (member)/                 # 회원 전용 페이지
│   │   │   ├── layout.tsx            # 회원 레이아웃
│   │   │   ├── dashboard/            # 회원 대시보드
│   │   │   │   └── page.tsx          # 메인 대시보드
│   │   │   ├── points/               # 포인트 관리
│   │   │   │   ├── page.tsx          # 포인트 내역
│   │   │   │   └── charge/           # 충전 페이지
│   │   │   │       └── page.tsx      # 카카오페이 링크/계좌 안내
│   │   │   ├── vouchers/             # 바인권 관리
│   │   │   │   ├── page.tsx          # 보유 바인권 목록
│   │   │   │   └── purchase/         # 바인권 구매
│   │   │   │       └── page.tsx      # 등급별 가격 표시
│   │   │   ├── tournaments/          # 토너먼트
│   │   │   │   ├── page.tsx          # 토너먼트 목록
│   │   │   │   └── [id]/             # 토너먼트 상세
│   │   │   │       └── page.tsx      
│   │   │   └── profile/              # 프로필 관리
│   │   │       └── page.tsx          # 내 정보 수정
│   │   ├── admin/                    # 관리자 전용
│   │   │   ├── layout.tsx            # 관리자 레이아웃
│   │   │   ├── dashboard/            # 관리자 대시보드
│   │   │   │   └── page.tsx          # 통계 요약
│   │   │   ├── payments/             # 입금 관리
│   │   │   │   ├── page.tsx          # 입금 대기 목록
│   │   │   │   └── confirm/          # 입금 확인 처리
│   │   │   ├── members/              # 회원 관리
│   │   │   │   ├── page.tsx          # 회원 목록
│   │   │   │   └── [id]/             # 회원 상세
│   │   │   │       └── page.tsx      # 등급 변경, 활동 내역
│   │   │   ├── vouchers/             # 바인권 가격 관리
│   │   │   │   └── pricing/          # 가격 설정
│   │   │   │       └── page.tsx      # 정회원/게스트 가격
│   │   │   ├── tournaments/          # 토너먼트 관리
│   │   │   │   ├── page.tsx          # 토너먼트 목록
│   │   │   │   └── create/           # 토너먼트 생성
│   │   │   └── reports/              # 리포트
│   │   │       ├── page.tsx          # 리포트 대시보드
│   │   │       └── export/           # 데이터 추출
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/                 # 인증 API
│   │   │   │   └── [...nextauth]/    # NextAuth 라우트
│   │   │   ├── members/              # 회원 API
│   │   │   │   ├── profile/          # 프로필 조회/수정
│   │   │   │   └── grade/            # 등급 관리
│   │   │   ├── points/               # 포인트 API
│   │   │   │   ├── balance/          # 잔액 조회
│   │   │   │   ├── charge/           # 충전 요청
│   │   │   │   └── transactions/     # 거래 내역
│   │   │   ├── vouchers/             # 바인권 API
│   │   │   │   ├── purchase/         # 구매
│   │   │   │   ├── list/             # 목록 조회
│   │   │   │   └── pricing/          # 가격 조회
│   │   │   └── admin/                # 관리자 API
│   │   │       ├── payments/         # 입금 확인
│   │   │       ├── members/          # 회원 관리
│   │   │       └── settings/         # 시스템 설정
│   │   ├── layout.tsx                # 루트 레이아웃
│   │   ├── page.tsx                  # 랜딩 페이지
│   │   └── globals.css               # 전역 스타일
│   ├── components/                   # 재사용 컴포넌트
│   │   ├── ui/                       # shadcn/ui 컴포넌트
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── layout/                   # 레이아웃 컴포넌트
│   │   │   ├── header.tsx            # 공통 헤더
│   │   │   ├── member-sidebar.tsx    # 회원용 사이드바
│   │   │   ├── admin-sidebar.tsx     # 관리자용 사이드바
│   │   │   └── footer.tsx
│   │   ├── payment/                  # 결제 관련
│   │   │   ├── kakao-pay-link.tsx   # 카카오페이 링크
│   │   │   ├── account-copy.tsx      # 계좌번호 복사
│   │   │   └── payment-status.tsx    # 결제 상태
│   │   ├── points/                   # 포인트 관련
│   │   │   ├── balance-card.tsx      # 잔액 표시 카드
│   │   │   ├── transaction-list.tsx  # 거래 내역 리스트
│   │   │   └── charge-form.tsx       # 충전 신청 폼
│   │   ├── vouchers/                 # 바인권 관련
│   │   │   ├── voucher-card.tsx      # 바인권 카드
│   │   │   ├── price-table.tsx       # 등급별 가격표
│   │   │   └── purchase-dialog.tsx   # 구매 다이얼로그
│   │   ├── members/                  # 회원 관련
│   │   │   ├── member-badge.tsx      # 회원 등급 뱃지
│   │   │   ├── member-table.tsx      # 회원 목록 테이블
│   │   │   └── grade-selector.tsx    # 등급 선택기
│   │   └── shared/                   # 공통 컴포넌트
│   │       ├── data-table.tsx        # 데이터 테이블
│   │       ├── loading.tsx           # 로딩 컴포넌트
│   │       ├── error-boundary.tsx    # 에러 바운더리
│   │       └── confirm-dialog.tsx    # 확인 다이얼로그
│   ├── lib/                          # 라이브러리 & 유틸리티
│   │   ├── db/                       # 데이터베이스
│   │   │   ├── prisma.ts             # Prisma 클라이언트
│   │   │   └── queries/              # DB 쿼리 함수
│   │   │       ├── member.ts         # 회원 쿼리
│   │   │       ├── point.ts          # 포인트 쿼리
│   │   │       └── voucher.ts        # 바인권 쿼리
│   │   ├── auth/                     # 인증 관련
│   │   │   ├── auth-options.ts       # NextAuth 설정
│   │   │   ├── session.ts            # 세션 헬퍼
│   │   │   └── middleware.ts         # 인증 미들웨어
│   │   ├── utils/                    # 유틸리티 함수
│   │   │   ├── format.ts             # 포맷팅 (숫자, 날짜)
│   │   │   ├── validation.ts        # 입력 검증
│   │   │   ├── constants.ts         # 상수 정의
│   │   │   └── payment.ts           # 결제 관련 유틸
│   │   └── hooks/                    # Custom Hooks
│   │       ├── use-auth.ts           # 인증 훅
│   │       ├── use-member.ts         # 회원 정보 훅
│   │       ├── use-points.ts         # 포인트 관련 훅
│   │       └── use-toast.ts          # 토스트 메시지 훅
│   ├── types/                        # TypeScript 타입 정의
│   │   ├── database.ts               # DB 스키마 타입
│   │   ├── api.ts                    # API 요청/응답 타입
│   │   ├── member.ts                 # 회원 관련 타입
│   │   └── payment.ts                # 결제 관련 타입
│   └── styles/                       # 추가 스타일
│       ├── animations.css            # 애니메이션
│       └── overrides.css             # Tailwind 오버라이드
├── prisma/
│   ├── schema.prisma                 # DB 스키마
│   ├── seed.ts                       # 초기 데이터
│   └── migrations/                   # 마이그레이션 파일
├── public/                           # 정적 파일
│   ├── images/
│   │   ├── logo.png
│   │   └── kakao-pay-qr.png
│   └── icons/
├── .env.local                        # 로컬 환경 변수
├── .env.example                      # 환경 변수 예시
├── .eslintrc.json                    # ESLint 설정
├── .prettierrc                       # Prettier 설정
├── next.config.js                    # Next.js 설정
├── tailwind.config.ts                # Tailwind 설정
├── tsconfig.json                     # TypeScript 설정
├── package.json                      # 패키지 정의
└── README.md                         # 프로젝트 문서
