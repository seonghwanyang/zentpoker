# Vercel 배포용 환경변수 설정 가이드

## 1. Vercel 프로젝트 설정에서 추가해야 할 환경변수

### NextAuth 설정
```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET
```

### Google OAuth
```
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

### Database (Supabase)
```
DATABASE_URL=YOUR_DATABASE_URL
DIRECT_URL=YOUR_DATABASE_URL
```

### Supabase API
```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

### 카카오페이 송금 링크
```
NEXT_PUBLIC_KAKAO_PAY_LINK_REGULAR_BUYIN=YOUR_KAKAO_PAY_LINK_REGULAR_BUYIN
NEXT_PUBLIC_KAKAO_PAY_LINK_REGULAR_REBUY=YOUR_KAKAO_PAY_LINK_REGULAR_REBUY
NEXT_PUBLIC_KAKAO_PAY_LINK_GUEST_BUYIN=YOUR_KAKAO_PAY_LINK_GUEST_BUYIN
NEXT_PUBLIC_KAKAO_PAY_LINK_GUEST_REBUY=YOUR_KAKAO_PAY_LINK_GUEST_REBUY
```

### 계좌 정보
```
NEXT_PUBLIC_BANK_NAME=YOUR_BANK_NAME
NEXT_PUBLIC_BANK_ACCOUNT=YOUR_BANK_ACCOUNT
NEXT_PUBLIC_ACCOUNT_HOLDER=YOUR_ACCOUNT_HOLDER
```

### 관리자 및 앱 설정
```
ADMIN_EMAIL=YOUR_ADMIN_EMAIL
NEXT_PUBLIC_APP_NAME=Zentpoker
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_TOAST_DURATION=3000
```

## 2. Google OAuth 리다이렉트 URI 추가

Google Cloud Console에 가서 다음 URI들을 추가하세요:
- https://your-domain.vercel.app/api/auth/callback/google
- https://your-custom-domain.com/api/auth/callback/google (커스텀 도메인 사용 시)

## 3. 배포 후 확인사항

1. 데이터베이스 연결 테스트
2. Google 로그인 테스트
3. 관리자 계정 설정 (admin@zentpoker.com을 관리자로 변경)

## 주의사항
- NEXTAUTH_URL은 반드시 실제 배포된 도메인으로 설정
- NEXT_PUBLIC_APP_URL도 실제 도메인으로 변경
- 프로덕션에서는 NODE_ENV가 자동으로 'production'으로 설정됨
