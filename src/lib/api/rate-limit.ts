import { NextResponse } from 'next/server';
import { ApiError } from './middleware';

// Rate limit 저장소 (인메모리, 프로덕션에서는 Redis 사용 권장)
interface RateLimitData {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitData>();

// Rate limit 설정
interface RateLimitConfig {
  windowMs: number; // 시간 윈도우 (밀리초)
  maxRequests: number; // 최대 요청 수
  keyGenerator?: (request: Request) => string; // 키 생성 함수
  skipSuccessfulRequests?: boolean; // 성공한 요청은 카운트에서 제외
  skipFailedRequests?: boolean; // 실패한 요청은 카운트에서 제외
}

// IP 주소 추출 함수
function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-forwarded-for')?.split(',')[0];
  
  return forwarded || realIP || remoteAddr || 'unknown';
}

// 기본 키 생성 함수 (IP 기반)
function defaultKeyGenerator(request: Request): string {
  return `rate_limit:${getClientIP(request)}`;
}

// Rate limit 체크 함수
export function createRateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = defaultKeyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = config;

  return {
    check: (request: Request): { allowed: boolean; remaining: number; resetTime: number } => {
      const key = keyGenerator(request);
      const now = Date.now();
      
      // 기존 데이터 조회
      let data = rateLimitStore.get(key);
      
      // 윈도우가 지났으면 리셋
      if (!data || now > data.resetTime) {
        data = {
          count: 0,
          resetTime: now + windowMs,
        };
      }
      
      // 요청 허용 여부 확인
      const allowed = data.count < maxRequests;
      const remaining = Math.max(0, maxRequests - data.count - 1);
      
      if (allowed) {
        data.count++;
        rateLimitStore.set(key, data);
      }
      
      return {
        allowed,
        remaining,
        resetTime: data.resetTime,
      };
    },
    
    increment: (request: Request): void => {
      const key = keyGenerator(request);
      const data = rateLimitStore.get(key);
      
      if (data) {
        data.count++;
        rateLimitStore.set(key, data);
      }
    },
    
    reset: (request: Request): void => {
      const key = keyGenerator(request);
      rateLimitStore.delete(key);
    },
  };
}

// 사전 정의된 Rate Limit 설정들
export const rateLimitConfigs = {
  // 일반 API - 분당 60회
  default: {
    windowMs: 60 * 1000, // 1분
    maxRequests: 60,
  },
  
  // 인증 API - 분당 10회
  auth: {
    windowMs: 60 * 1000, // 1분
    maxRequests: 10,
  },
  
  // 결제 API - 분당 5회
  payment: {
    windowMs: 60 * 1000, // 1분
    maxRequests: 5,
  },
  
  // 관리자 API - 분당 100회
  admin: {
    windowMs: 60 * 1000, // 1분
    maxRequests: 100,
  },
  
  // 업로드 API - 시간당 20회
  upload: {
    windowMs: 60 * 60 * 1000, // 1시간
    maxRequests: 20,
  },
};

// Rate limit 미들웨어 생성기
export function withRateLimit(config: RateLimitConfig) {
  const rateLimit = createRateLimit(config);
  
  return function rateLimitMiddleware(request: Request): void {
    const result = rateLimit.check(request);
    
    if (!result.allowed) {
      const resetDate = new Date(result.resetTime);
      throw new ApiError(
        `Too many requests. Try again after ${resetDate.toISOString()}`,
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }
  };
}

// 특정 사용자별 Rate Limit (로그인 후)
export function createUserRateLimit(config: RateLimitConfig) {
  return createRateLimit({
    ...config,
    keyGenerator: (request: Request) => {
      // Authorization 헤더에서 사용자 정보 추출
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        // JWT나 세션에서 사용자 ID 추출 로직
        return `user_rate_limit:${authHeader}`;
      }
      return defaultKeyGenerator(request);
    },
  });
}

// 엔드포인트별 Rate Limit
export function createEndpointRateLimit(endpoint: string, config: RateLimitConfig) {
  return createRateLimit({
    ...config,
    keyGenerator: (request: Request) => {
      const ip = getClientIP(request);
      return `endpoint_rate_limit:${endpoint}:${ip}`;
    },
  });
}

// Rate limit 정리 작업 (메모리 누수 방지)
export function cleanupRateLimit(): void {
  const now = Date.now();
  
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// 주기적으로 정리 작업 실행 (5분마다)
if (typeof window === 'undefined') { // 서버 사이드에서만 실행
  setInterval(cleanupRateLimit, 5 * 60 * 1000);
}

// 사전 정의된 Rate Limit 미들웨어들
export const rateLimitMiddlewares = {
  default: withRateLimit(rateLimitConfigs.default),
  auth: withRateLimit(rateLimitConfigs.auth),
  payment: withRateLimit(rateLimitConfigs.payment),
  admin: withRateLimit(rateLimitConfigs.admin),
  upload: withRateLimit(rateLimitConfigs.upload),
};

// Rate limit 상태 조회 함수 (디버깅용)
export function getRateLimitStatus(request: Request, config: RateLimitConfig): RateLimitData | null {
  const keyGenerator = config.keyGenerator || defaultKeyGenerator;
  const key = keyGenerator(request);
  return rateLimitStore.get(key) || null;
}

// Rate limit 헤더 추가 헬퍼
export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  resetTime: number,
  limit: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
  
  return response;
}