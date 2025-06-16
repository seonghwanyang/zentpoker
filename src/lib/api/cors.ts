import { NextResponse } from 'next/server';

// CORS 설정
interface CorsOptions {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

const defaultCorsOptions: CorsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://zentpoker.com', 'https://www.zentpoker.com'] 
    : true, // 개발 환경에서는 모든 origin 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-HTTP-Method-Override',
    'Accept',
    'Origin',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  credentials: true,
  maxAge: 86400, // 24시간
  optionsSuccessStatus: 200,
};

// Origin 검증 함수
function isOriginAllowed(origin: string | null, allowedOrigin: string | string[] | boolean): boolean {
  if (!origin) return false;
  
  if (typeof allowedOrigin === 'boolean') {
    return allowedOrigin;
  }
  
  if (typeof allowedOrigin === 'string') {
    return origin === allowedOrigin;
  }
  
  if (Array.isArray(allowedOrigin)) {
    return allowedOrigin.includes(origin);
  }
  
  return false;
}

// CORS 헤더 설정 함수
export function setCorsHeaders(
  response: NextResponse, 
  request: Request, 
  options: CorsOptions = {}
): NextResponse {
  const corsOptions = { ...defaultCorsOptions, ...options };
  const origin = request.headers.get('origin');
  
  // Origin 검증 및 설정
  if (corsOptions.origin && isOriginAllowed(origin, corsOptions.origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
  }
  
  // 기본 CORS 헤더 설정
  if (corsOptions.methods) {
    response.headers.set('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
  }
  
  if (corsOptions.allowedHeaders) {
    response.headers.set('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
  }
  
  if (corsOptions.exposedHeaders) {
    response.headers.set('Access-Control-Expose-Headers', corsOptions.exposedHeaders.join(', '));
  }
  
  if (corsOptions.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  if (corsOptions.maxAge) {
    response.headers.set('Access-Control-Max-Age', corsOptions.maxAge.toString());
  }
  
  return response;
}

// CORS 미들웨어
export function withCors(options: CorsOptions = {}) {
  return function corsMiddleware(request: Request): NextResponse | null {
    // Preflight 요청 처리
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: options.optionsSuccessStatus || 200 });
      return setCorsHeaders(response, request, options);
    }
    
    return null; // Preflight가 아니면 null 반환 (다음 미들웨어로)
  };
}

// API 응답에 CORS 헤더 추가하는 헬퍼
export function addCorsHeaders(
  response: NextResponse, 
  request: Request, 
  options: CorsOptions = {}
): NextResponse {
  return setCorsHeaders(response, request, options);
}

// 특정 엔드포인트별 CORS 설정
export const corsConfigs = {
  // 공개 API (엄격한 CORS)
  public: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://zentpoker.com', 'https://www.zentpoker.com']
      : true,
    methods: ['GET', 'POST'],
    credentials: false,
  },
  
  // 인증이 필요한 API
  authenticated: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://zentpoker.com', 'https://www.zentpoker.com']
      : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
  
  // 관리자 API (더 엄격한 CORS)
  admin: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://admin.zentpoker.com', 'https://zentpoker.com']
      : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
  
  // 결제 API (가장 엄격한 CORS)
  payment: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://zentpoker.com']
      : true,
    methods: ['POST'],
    credentials: true,
    maxAge: 0, // 캐시 비활성화
  },
};

// 사전 정의된 CORS 미들웨어들
export const corsMiddlewares = {
  public: withCors(corsConfigs.public),
  authenticated: withCors(corsConfigs.authenticated),
  admin: withCors(corsConfigs.admin),
  payment: withCors(corsConfigs.payment),
};

// 보안 헤더 추가 함수
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // XSS 보호
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // MIME 타입 스니핑 방지
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // 클릭재킹 방지
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Referrer 정책
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // HSTS (HTTPS 강제)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  // 권한 정책
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=self'
  );
  
  return response;
}

// API 응답 래퍼 (CORS + 보안 헤더)
export function createSecureResponse(
  data: unknown,
  request: Request,
  options: {
    status?: number;
    cors?: CorsOptions;
    headers?: Record<string, string>;
  } = {}
): NextResponse {
  const response = NextResponse.json(data, { status: options.status });
  
  // CORS 헤더 추가
  setCorsHeaders(response, request, options.cors);
  
  // 보안 헤더 추가
  addSecurityHeaders(response);
  
  // 사용자 정의 헤더 추가
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  
  return response;
}