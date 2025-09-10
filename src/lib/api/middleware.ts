import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types/api';
import { UserRole } from '@/types/next-auth';
import { addCorsHeaders, addSecurityHeaders } from './cors';
import { logError, logSecurity, createApiLogger } from '@/lib/utils/logger';
import { sanitizeUserInput } from '@/lib/utils/sanitize';

// API 에러 타입
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 공통 에러 핸들러
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  if (error instanceof ApiError) {
    logError('API Error', { 
      message: error.message, 
      statusCode: error.statusCode,
      code: error.code 
    });

    // 보안 관련 에러는 별도 로깅
    if (error.statusCode === 401 || error.statusCode === 403) {
      logSecurity('Authentication/Authorization failure', {
        message: error.message,
        code: error.code,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: error.message,
      },
      { status: error.statusCode },
    );
  }

  if (error instanceof Error) {
    logError('Unexpected error', { message: error.message, stack: error.stack });
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred',
      },
      { status: 500 },
    );
  }

  logError('Unknown error', { error });
  return NextResponse.json(
    {
      success: false,
      error: 'Unknown error occurred',
      message: 'An unexpected error occurred',
    },
    { status: 500 },
  );
}

// 성공 응답 헬퍼
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  status: number = 200,
  request?: Request,
): NextResponse<ApiResponse<T>> {
  const response = NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status },
  );

  // 보안 헤더 추가
  addSecurityHeaders(response);
  
  // CORS 헤더 추가 (요청이 있는 경우)
  if (request) {
    addCorsHeaders(response, request);
  }

  return response;
}

// 에러 응답 헬퍼
export function createErrorResponse(
  error: string,
  message?: string,
  status: number = 400,
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      message: message || error,
    },
    { status },
  );
}

// 세션 확인 미들웨어
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new ApiError('Unauthorized - Please login', 401, 'UNAUTHORIZED');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      tier: true,
      status: true,
      points: true,
      memberGrade: true,
      phone: true,
    },
  });

  if (!user) {
    throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (user.status !== 'ACTIVE') {
    throw new ApiError('Account is not active', 403, 'ACCOUNT_INACTIVE');
  }

  return user;
}

// 관리자 권한 확인 미들웨어
export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== 'ADMIN') {
    throw new ApiError('Admin privileges required', 403, 'INSUFFICIENT_PRIVILEGES');
  }

  return user;
}

// 특정 역할 확인 미들웨어
export async function requireRole(roles: UserRole[]) {
  const user = await requireAuth();

  if (!roles.includes(user.role)) {
    throw new ApiError(
      `Required roles: ${roles.join(', ')}`,
      403,
      'INSUFFICIENT_ROLE',
    );
  }

  return user;
}

// 요청 본문 파싱 및 검증
export async function parseAndValidateBody<T>(
  request: Request,
  validator?: (data: unknown) => T,
): Promise<T> {
  try {
    const body = await request.json();

    // 입력 데이터 새니타이제이션
    const sanitizedBody = sanitizeUserInput(body);

    if (validator) {
      return validator(sanitizedBody);
    }

    return sanitizedBody as T;
  } catch (error) {
    logSecurity('Invalid request body', { 
      url: request.url,
      method: request.method,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new ApiError('Invalid request body', 400, 'INVALID_BODY');
  }
}

// 페이지네이션 파라미터 파싱
export function parsePaginationParams(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
}

// 검색 파라미터 파싱
export function parseSearchParams(request: Request) {
  const { searchParams } = new URL(request.url);
  const pagination = parsePaginationParams(request);

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  return {
    ...pagination,
    search,
    status,
    type,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  };
}

// API 핸들러 래퍼 - 공통 에러 처리 및 로깅
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>,
) {
  return async (...args: T): Promise<NextResponse> => {
    const request = args[0] as Request;
    const logger = createApiLogger();
    const startTime = Date.now();
    
    try {
      logger.apiRequest(request.method, new URL(request.url).pathname, {
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      });

      const response = await handler(...args);
      
      // 응답 로깅
      const duration = Date.now() - startTime;
      logger.apiResponse(
        request.method, 
        new URL(request.url).pathname, 
        response.status, 
        duration
      );

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const status = error instanceof ApiError ? error.statusCode : 500;
      
      logger.apiResponse(
        request.method, 
        new URL(request.url).pathname, 
        status, 
        duration
      );

      return handleApiError(error);
    }
  };
}

// 비동기 작업을 위한 지연 함수
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 재시도 로직
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      await delay(delayMs * attempt);
    }
  }

  throw lastError!;
}