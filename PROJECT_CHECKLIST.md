# 🎯 Zentpoker 프로젝트 체크리스트

## 📋 프로젝트 초기 설정
- [x] Next.js 14 프로젝트 초기화
- [x] TypeScript 설정
- [x] Tailwind CSS 설정
- [x] shadcn/ui 설치 및 설정
- [x] 환경 변수 파일 설정 (.env.local)
- [x] ESLint & Prettier 설정
- [x] 프로젝트 README 작성

## 🗄️ 데이터베이스 설정
- [ ] Supabase 프로젝트 생성
- [x] Prisma 설치 및 설정 (package.json에 포함)
- [x] 데이터베이스 스키마 작성
  - [x] User 모델
  - [x] Point 모델 (PointLog로 구현)
  - [x] Transaction 모델
  - [x] Voucher 모델
  - [x] Tournament 모델
- [ ] Prisma 마이그레이션 실행
- [ ] Seed 데이터 작성

## 🔐 인증 시스템
- [x] NextAuth.js 설치 및 설정
- [x] Google OAuth 설정 (환경변수 설정 필요)
- [x] 인증 미들웨어 작성 (auth-options.ts)
- [x] 세션 관리 설정
- [x] 로그인 페이지 UI
- [x] 회원가입 페이지 UI
- [ ] 권한별 라우트 보호 (middleware.ts 필요)

## 🎨 UI/UX 기본 구성
- [x] 전역 스타일 설정 (globals.css)
- [x] 색상 테마 정의 (보라색 기반)
- [x] 폰트 설정 (Inter)
- [x] 기본 UI 컴포넌트
  - [x] Button 컴포넌트
  - [x] Card 컴포넌트
  - [x] Input 컴포넌트
  - [x] Label 컴포넌트
  - [x] Dialog 컴포넌트
  - [x] Toast 컴포넌트
  - [x] Badge 컴포넌트
  - [x] Avatar 컴포넌트
  - [x] Separator 컴포넌트
  - [x] AlertDialog 컴포넌트
- [x] 레이아웃 컴포넌트
  - [x] Header 컴포넌트
  - [x] Sidebar 컴포넌트 (회원용/관리자용)
  - [x] Footer 컴포넌트
- [x] 로딩 컴포넌트
- [x] 확인 다이얼로그 컴포넌트
- [ ] 에러 바운더리 컴포넌트

## 💳 포인트 시스템
- [x] 포인트 잔액 표시 컴포넌트
- [x] 카카오페이 송금 링크 컴포넌트
- [x] 포인트 충전 페이지
  - [x] 충전 금액 입력 폼
  - [x] 참조 코드 생성
- [x] 포인트 거래 내역 페이지
- [ ] 포인트 API 엔드포인트
  - [ ] GET /api/points/balance
  - [ ] POST /api/points/charge
  - [ ] GET /api/points/transactions

## 🎫 바인권 시스템
- [x] 바인권 카드 컴포넌트
- [x] 가격 테이블 컴포넌트
- [x] 바인권 구매 페이지
- [x] 보유 바인권 목록 페이지
- [ ] 바인권 API 엔드포인트
  - [ ] GET /api/vouchers/pricing
  - [ ] POST /api/vouchers/purchase
  - [ ] GET /api/vouchers/list

## 👥 회원 관리
- [x] 회원 등급 배지 컴포넌트
- [x] 회원 대시보드 페이지
- [x] 프로필 수정 페이지
- [ ] 회원 정보 API
  - [ ] GET /api/members/profile
  - [ ] PATCH /api/members/profile

## 🛠️ 관리자 기능
- [x] 관리자 대시보드
  - [x] 주요 통계 위젯
  - [x] 최근 거래 목록
- [ ] 입금 확인 관리
  - [ ] 대기 중인 충전 목록
  - [ ] 입금 확인 처리
- [ ] 회원 관리
  - [ ] 회원 목록 테이블
  - [ ] 회원 등급 변경
  - [ ] 회원 상세 정보
- [ ] 바인권 가격 관리
- [ ] 관리자 API 엔드포인트
  - [ ] POST /api/admin/payments/confirm
  - [ ] GET /api/admin/members
  - [ ] PATCH /api/admin/members/:id

## 🏆 토너먼트 시스템 (Phase 2)
- [ ] 토너먼트 목록 페이지
- [ ] 토너먼트 생성 (관리자)
- [ ] 토너먼트 참가 신청
- [ ] 토너먼트 상세 페이지

## 📊 리포트 & 분석 (Phase 2)
- [ ] 거래 통계 차트
- [ ] 회원 활동 분석
- [ ] 엑셀 다운로드 기능

## 🚀 배포 준비
- [ ] 환경 변수 검증
- [ ] 빌드 최적화
- [ ] 에러 로깅 설정
- [ ] 성능 테스트
- [ ] 보안 점검
- [ ] Vercel 배포 설정
- [ ] 도메인 연결

## 📝 문서화
- [ ] API 문서 작성
- [ ] 사용자 가이드 작성
- [ ] 관리자 매뉴얼 작성
- [ ] 기술 문서 작성

---

### 진행 상황
- 전체 진행률: 50%
- 마지막 업데이트: 2024-12-20

### 최근 완료 작업
- ✅ 레이아웃 컴포넌트 (Header, Sidebar, Footer)
- ✅ NextAuth.js 설정 및 Google OAuth 연동 준비
- ✅ 로그인/회원가입 페이지 UI
- ✅ 회원 대시보드 페이지
- ✅ BalanceCard 컴포넌트 레퍼런스 디자인 적용
- ✅ 포인트 관련 페이지 (거래내역, 충전)
- ✅ 바인권 관련 페이지 (목록, 구매)
- ✅ 프로필 페이지
- ✅ 관리자 대시보드

### 우선순위
1. **P0 (필수)**: 프로젝트 초기 설정, 인증, 포인트 시스템, 관리자 입금 확인
2. **P1 (중요)**: 바인권 시스템, 회원 관리, 관리자 대시보드
3. **P2 (선택)**: 토너먼트, 리포트, 고급 기능
