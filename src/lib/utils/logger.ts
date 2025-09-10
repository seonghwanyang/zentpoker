// 보안이 강화된 로깅 시스템

interface LogData {
  [key: string]: unknown;
}

// 민감한 필드 목록
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'cookie',
  'session',
  'email', // 부분 마스킹
  'phone', // 부분 마스킹
  'card',
  'account',
  'ssn',
  'metadata', // JSON 필드는 별도 처리
];

// 부분 마스킹이 필요한 필드 목록
const PARTIAL_MASK_FIELDS = ['email', 'phone'];

// 데이터 마스킹 함수
function maskValue(key: string, value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  const lowerKey = key.toLowerCase();
  
  // 완전 마스킹이 필요한 필드
  if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
    if (PARTIAL_MASK_FIELDS.some(field => lowerKey.includes(field))) {
      return maskPartially(String(value));
    }
    return '[REDACTED]';
  }

  // 객체인 경우 재귀적으로 마스킹
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map((item, index) => maskValue(`${key}[${index}]`, item));
    }
    
    const maskedObj: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([k, v]) => {
      maskedObj[k] = maskValue(k, v);
    });
    return maskedObj;
  }

  return value;
}

// 부분 마스킹 함수
function maskPartially(value: string): string {
  if (value.includes('@')) {
    // 이메일 마스킹: user@example.com -> u***@example.com
    const [local, domain] = value.split('@');
    if (local.length <= 1) return '[REDACTED]';
    return `${local[0]}***@${domain}`;
  }
  
  if (value.match(/^\d{3}-\d{4}-\d{4}$/)) {
    // 전화번호 마스킹: 010-1234-5678 -> 010-****-5678
    return value.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3');
  }
  
  // 일반 문자열은 앞 1자리만 보여주고 나머지 마스킹
  if (value.length <= 2) return '[REDACTED]';
  return `${value[0]}***`;
}

// 로그 레벨
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class Logger {
  private level: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.level = process.env.LOG_LEVEL 
      ? parseInt(process.env.LOG_LEVEL) 
      : process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG;
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private formatMessage(level: string, message: string, data?: LogData): string {
    const timestamp = new Date().toISOString();
    const processId = process.pid;
    
    let logMessage = `[${timestamp}] [${processId}] [${level}] ${message}`;
    
    if (data) {
      const maskedData = this.maskSensitiveData(data);
      logMessage += ` ${JSON.stringify(maskedData)}`;
    }
    
    return logMessage;
  }

  private maskSensitiveData(data: LogData): LogData {
    const masked: LogData = {};
    
    Object.entries(data).forEach(([key, value]) => {
      masked[key] = maskValue(key, value);
    });
    
    return masked;
  }

  error(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const logMessage = this.formatMessage('ERROR', message, data);
      console.error(logMessage);
      
      // 프로덕션에서는 외부 로깅 서비스로 전송
      if (this.isProduction) {
        // Sentry, DataDog 등으로 전송
        this.sendToExternalLogger('error', message, data);
      }
    }
  }

  warn(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const logMessage = this.formatMessage('WARN', message, data);
      console.warn(logMessage);
    }
  }

  info(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const logMessage = this.formatMessage('INFO', message, data);
      console.info(logMessage);
    }
  }

  debug(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.DEBUG) && !this.isProduction) {
      const logMessage = this.formatMessage('DEBUG', message, data);
      console.debug(logMessage);
    }
  }

  // 인증 관련 전용 로깅 (더 엄격한 마스킹)
  auth(event: string, data?: LogData): void {
    const maskedData = data ? this.maskSensitiveData(data) : undefined;
    this.info(`Auth: ${event}`, maskedData);
  }

  // API 요청 로깅
  apiRequest(method: string, path: string, data?: LogData): void {
    const requestData = {
      method,
      path,
      ...data,
    };
    this.info('API Request', requestData);
  }

  // API 응답 로깅
  apiResponse(method: string, path: string, status: number, duration: number): void {
    this.info('API Response', {
      method,
      path,
      status,
      duration: `${duration}ms`,
    });
  }

  // 보안 이벤트 로깅
  security(event: string, data?: LogData): void {
    const securityData = {
      event,
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.warn(`Security: ${event}`, securityData);
    
    // 보안 이벤트는 항상 외부 로깅 서비스로 전송
    if (this.isProduction) {
      this.sendToExternalLogger('security', event, securityData);
    }
  }

  private sendToExternalLogger(type: string, message: string, data?: LogData): void {
    // 외부 로깅 서비스 연동 로직
    // 예: Sentry, DataDog, CloudWatch 등
    
    // 현재는 placeholder
    if (process.env.EXTERNAL_LOGGING_ENABLED === 'true') {
      // 실제 외부 서비스 API 호출
      console.log(`[EXTERNAL_LOG] ${type}: ${message}`, data);
    }
  }
}

// 싱글톤 인스턴스
export const logger = new Logger();

// 편의 함수들
export const logError = (message: string, data?: LogData) => logger.error(message, data);
export const logWarn = (message: string, data?: LogData) => logger.warn(message, data);
export const logInfo = (message: string, data?: LogData) => logger.info(message, data);
export const logDebug = (message: string, data?: LogData) => logger.debug(message, data);
export const logAuth = (event: string, data?: LogData) => logger.auth(event, data);
export const logSecurity = (event: string, data?: LogData) => logger.security(event, data);

// API 로깅 미들웨어
export function createApiLogger() {
  return function apiLoggerMiddleware(request: Request): void {
    const startTime = Date.now();
    const method = request.method;
    const path = new URL(request.url).pathname;
    
    logger.apiRequest(method, path, {
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    });
    
    // 응답 시간 측정을 위한 헬퍼 함수 반환
    return {
      logResponse: (status: number) => {
        const duration = Date.now() - startTime;
        logger.apiResponse(method, path, status, duration);
      },
    };
  };
}