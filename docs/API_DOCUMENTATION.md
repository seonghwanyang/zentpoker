# Zentpoker API Documentation

## 기본 정보

- **Base URL**: `https://api.zentpoker.com` (Production) / `http://localhost:3000` (Development)
- **인증 방식**: NextAuth.js Session Cookie
- **응답 형식**: JSON

## 인증

모든 API 요청은 유효한 세션 쿠키가 필요합니다. 로그인하지 않은 사용자는 401 Unauthorized 응답을 받습니다.

## API 엔드포인트

### 1. 포인트 관련

#### 포인트 잔액 조회
```http
GET /api/points/balance
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "userId": "1",
    "balance": 150000,
    "lastUpdated": "2024-12-20T10:30:00Z"
  }
}
```

#### 포인트 충전 신청
```http
POST /api/points/charge
```

**요청 본문:**
```json
{
  "amount": 100000,
  "paymentMethod": "KAKAO" // KAKAO | BANK
}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": "1703058000000",
    "userId": "1",
    "amount": 100000,
    "paymentMethod": "KAKAO",
    "referenceCode": "ZP-2024-1220-001",
    "status": "PENDING",
    "createdAt": "2024-12-20T10:00:00Z"
  }
}
```

#### 포인트 거래 내역
```http
GET /api/points/transactions?page=1&limit=10&type=ALL
```

**쿼리 파라미터:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)
- `type`: 거래 유형 필터 (ALL | DEPOSIT | PURCHASE | ADMIN_ADJUST)

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "1",
        "type": "DEPOSIT",
        "amount": 100000,
        "balance": 250000,
        "description": "포인트 충전",
        "referenceCode": "ZP-2024-1220-001",
        "createdAt": "2024-12-20T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### 2. 바인권 관련

#### 바인권 목록 조회
```http
GET /api/vouchers/list
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "vouchers": [
      {
        "id": "1",
        "type": "BUY_IN",
        "status": "ACTIVE",
        "purchasedAt": "2024-12-20T10:30:00Z",
        "expiresAt": "2025-01-20T23:59:59Z",
        "price": 50000,
        "isUsed": false
      }
    ],
    "stats": {
      "totalActive": 2,
      "buyInCount": 1,
      "reBuyCount": 1
    }
  }
}
```

#### 바인권 가격 조회
```http
GET /api/vouchers/pricing
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "buyIn": {
      "regular": 50000,
      "guest": 60000
    },
    "reBuy": {
      "regular": 30000,
      "guest": 36000
    },
    "guestPremium": 20
  }
}
```

#### 바인권 구매
```http
POST /api/vouchers/purchase
```

**요청 본문:**
```json
{
  "voucherType": "BUY_IN", // BUY_IN | RE_BUY
  "quantity": 1
}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "vouchers": [
      {
        "id": "1703058000000-0",
        "type": "BUY_IN",
        "status": "ACTIVE",
        "purchasedAt": "2024-12-20T10:00:00Z",
        "expiresAt": "2025-01-20T23:59:59Z",
        "price": 50000
      }
    ],
    "totalPrice": 50000,
    "remainingBalance": 100000
  }
}
```

### 3. 회원 정보

#### 프로필 조회
```http
GET /api/members/profile
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "김철수",
    "email": "kim@example.com",
    "phone": "010-1234-5678",
    "grade": "REGULAR",
    "status": "ACTIVE",
    "joinedAt": "2024-01-15",
    "lastLogin": "2024-12-20T10:30:00Z",
    "stats": {
      "totalDeposit": 500000,
      "totalUsed": 350000,
      "tournamentsPlayed": 12,
      "averageBuyIn": 45000
    }
  }
}
```

#### 프로필 수정
```http
PATCH /api/members/profile
```

**요청 본문:**
```json
{
  "name": "김철수",
  "phone": "010-1234-5678"
}
```

### 4. 관리자 API

#### 회원 목록 조회 (관리자 전용)
```http
GET /api/admin/members?search=&grade=ALL&status=ALL
```

**쿼리 파라미터:**
- `search`: 검색어 (이름, 이메일, 전화번호)
- `grade`: 등급 필터 (ALL | GUEST | REGULAR | ADMIN)
- `status`: 상태 필터 (ALL | ACTIVE | INACTIVE)

#### 회원 정보 수정 (관리자 전용)
```http
PATCH /api/admin/members/:id
```

**요청 본문:**
```json
{
  "grade": "REGULAR", // GUEST | REGULAR | ADMIN
  "status": "ACTIVE"  // ACTIVE | INACTIVE
}
```

#### 입금 확인 목록 (관리자 전용)
```http
GET /api/admin/payments/confirm
```

#### 입금 처리 (관리자 전용)
```http
POST /api/admin/payments/confirm
```

**요청 본문:**
```json
{
  "transactionId": "1",
  "action": "CONFIRM", // CONFIRM | REJECT
  "memo": "입금 확인 완료"
}
```

## 에러 응답

모든 에러 응답은 다음과 같은 형식을 따릅니다:

```json
{
  "success": false,
  "error": "에러 메시지"
}
```

### HTTP 상태 코드

- `200 OK`: 요청 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 필요
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

## Rate Limiting

- 모든 API는 IP당 분당 60회로 제한됩니다.
- 제한을 초과하면 `429 Too Many Requests` 응답을 받습니다.
