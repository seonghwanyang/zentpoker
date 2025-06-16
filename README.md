# 🎰 Zentpoker - 홀덤 동호회 포인트/바인권 관리 시스템

<div align="center">
  <img src="public/logo.png" alt="Zentpoker Logo" width="200" />
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-5.9.1-2D3748?logo=prisma)](https://www.prisma.io/)
</div>

<<<<<<< HEAD
> Last Updated: 2024-03-21
> Version: 0.1.0

=======
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
## 📖 소개

Zentpoker는 홀덤 동호회를 위한 종합 관리 플랫폼입니다. 포인트 충전, 바인권 구매, 토너먼트 관리 등 동호회 운영에 필요한 모든 기능을 제공합니다.

## ✨ 주요 기능

### 👤 회원 기능
- **Google OAuth 로그인**: 간편한 소셜 로그인
- **포인트 관리**: 충전, 사용 내역 조회
- **바인권 시스템**: Buy-in/Re-buy 바인권 구매 및 관리
- **토너먼트 참가**: 다양한 토너먼트 참가 신청
- **프로필 관리**: 개인 정보 수정

### 👨‍💼 관리자 기능
- **회원 관리**: 등급 변경, 활동 상태 관리
- **입금 확인**: 포인트 충전 요청 승인/거절
- **가격 설정**: 바인권 가격 및 할증률 관리
- **토너먼트 생성**: 새로운 토너먼트 개설
- **리포트 & 분석**: 수익, 회원 활동 분석

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Data Fetching**: TanStack Query

### Backend
- **API**: Next.js API Routes
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Validation**: Zod

### Database & Infrastructure
- **Database**: PostgreSQL (Supabase)
- **Hosting**: Vercel
- **File Storage**: Vercel Blob

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 pnpm
- PostgreSQL 데이터베이스

### 설치

1. 저장소 클론
```bash
git clone https://github.com/your-username/zentpoker.git
cd zentpoker
```

2. 의존성 설치
```bash
npm install
# 또는
pnpm install
```

3. 환경 변수 설정
```bash
cp .env.example .env.local
```

`.env.local` 파일을 열어 필요한 환경 변수를 설정하세요:
```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# 기타 설정...
```

4. 데이터베이스 마이그레이션
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. 시드 데이터 생성 (선택사항)
```bash
npm run prisma:seed
```

6. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📝 스크립트

```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 실행
npm run lint         # ESLint 실행
npm run prisma:generate  # Prisma 클라이언트 생성
npm run prisma:migrate   # 데이터베이스 마이그레이션
npm run prisma:studio    # Prisma Studio 실행
npm run prisma:seed      # 시드 데이터 생성
```

## 📁 프로젝트 구조

```
zentpoker/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/       # 인증 관련 페이지
│   │   ├── (member)/     # 회원 전용 페이지
│   │   ├── admin/        # 관리자 페이지
│   │   └── api/          # API 라우트
│   ├── components/       # React 컴포넌트
│   │   ├── ui/           # UI 컴포넌트
│   │   └── ...           # 기타 컴포넌트
│   ├── lib/              # 유틸리티 함수
│   └── types/            # TypeScript 타입 정의
├── prisma/
│   ├── schema.prisma     # 데이터베이스 스키마
│   └── seed.ts           # 시드 스크립트
├── public/               # 정적 파일
└── ...
```

## 🔒 보안

- 모든 API 엔드포인트는 인증 미들웨어로 보호됩니다
- 관리자 기능은 권한 검증을 거칩니다
- 민감한 정보는 환경 변수로 관리합니다
- SQL Injection 방지를 위해 Prisma ORM을 사용합니다

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 문의

- Email: admin@zentpoker.com
- GitHub: [@your-username](https://github.com/your-username)

---

<div align="center">
  Made with ❤️ by Zentpoker Team
</div>
