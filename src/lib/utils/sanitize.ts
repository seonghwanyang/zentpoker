// 입력 데이터 새니타이제이션 유틸리티

// XSS 방지를 위한 HTML 새니타이제이션
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/&/g, '&amp;')
    .trim();
}

// SQL Injection 방지를 위한 문자열 이스케이프
export function escapeSql(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z');
}

// NoSQL Injection 방지 (MongoDB 등)
export function sanitizeNoSql(input: unknown): unknown {
  if (typeof input === 'string') {
    // $ 기호로 시작하는 연산자 제거
    return input.replace(/^\$.*/, '');
  }
  
  if (typeof input === 'object' && input !== null) {
    if (Array.isArray(input)) {
      return input.map(sanitizeNoSql);
    }
    
    const sanitized: Record<string, unknown> = {};
    Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
      // $ 기호로 시작하는 키 제거
      if (!key.startsWith('$')) {
        sanitized[key] = sanitizeNoSql(value);
      }
    });
    return sanitized;
  }
  
  return input;
}

// Path Traversal 방지
export function sanitizePath(input: string): string {
  return input
    .replace(/\.\./g, '') // 상위 디렉토리 접근 제거
    .replace(/[<>:"|?*]/g, '') // 위험한 파일명 문자 제거
    .replace(/^\.+/, '') // 시작 부분의 점 제거
    .trim();
}

// 파일명 새니타이제이션
export function sanitizeFilename(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9\-_\.]/g, '_') // 안전한 문자만 허용
    .replace(/\.{2,}/g, '.') // 연속된 점 제거
    .replace(/^\.+/, '') // 시작 부분의 점 제거
    .replace(/\.+$/, '') // 끝 부분의 점 제거
    .slice(0, 255); // 최대 길이 제한
}

// 이메일 새니타이제이션
export function sanitizeEmail(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\-\.@]/g, ''); // 이메일에 허용된 문자만 유지
}

// 전화번호 새니타이제이션
export function sanitizePhone(input: string): string {
  const digits = input.replace(/\D/g, ''); // 숫자만 추출
  
  // 한국 전화번호 형식으로 변환
  if (digits.length === 11 && digits.startsWith('010')) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  
  return digits;
}

// URL 새니타이제이션
export function sanitizeUrl(input: string): string {
  try {
    const url = new URL(input);
    
    // 허용된 프로토콜만 허용
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(url.protocol)) {
      return '';
    }
    
    // 위험한 URL 패턴 차단
    const dangerousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /file:/i,
      /ftp:/i,
    ];
    
    if (dangerousPatterns.some(pattern => pattern.test(input))) {
      return '';
    }
    
    return url.toString();
  } catch {
    return '';
  }
}

// 숫자 새니타이제이션
export function sanitizeNumber(input: unknown, options: {
  min?: number;
  max?: number;
  allowFloat?: boolean;
} = {}): number | null {
  const { min = -Infinity, max = Infinity, allowFloat = true } = options;
  
  let num: number;
  
  if (typeof input === 'number') {
    num = input;
  } else if (typeof input === 'string') {
    num = allowFloat ? parseFloat(input) : parseInt(input, 10);
  } else {
    return null;
  }
  
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  
  // 범위 검증
  if (num < min || num > max) {
    return null;
  }
  
  return num;
}

// JSON 데이터 새니타이제이션
export function sanitizeJson(input: string, maxDepth: number = 5): unknown {
  try {
    const parsed = JSON.parse(input);
    return sanitizeObject(parsed, maxDepth);
  } catch {
    return null;
  }
}

// 객체 깊이 제한 및 새니타이제이션
function sanitizeObject(obj: unknown, maxDepth: number, currentDepth: number = 0): unknown {
  if (currentDepth >= maxDepth) {
    return '[MAX_DEPTH_EXCEEDED]';
  }
  
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return sanitizeHtml(obj);
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj
      .slice(0, 1000) // 배열 크기 제한
      .map(item => sanitizeObject(item, maxDepth, currentDepth + 1));
  }
  
  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    const entries = Object.entries(obj as Record<string, unknown>);
    
    // 객체 속성 개수 제한
    entries.slice(0, 100).forEach(([key, value]) => {
      const sanitizedKey = sanitizeHtml(key);
      if (sanitizedKey && sanitizedKey.length <= 100) {
        sanitized[sanitizedKey] = sanitizeObject(value, maxDepth, currentDepth + 1);
      }
    });
    
    return sanitized;
  }
  
  return '[UNKNOWN_TYPE]';
}

// 사용자 입력 데이터 종합 새니타이제이션
export function sanitizeUserInput(input: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  Object.entries(input).forEach(([key, value]) => {
    const sanitizedKey = sanitizeHtml(key);
    
    if (typeof value === 'string') {
      // 특정 필드에 따른 새니타이제이션
      if (key.toLowerCase().includes('email')) {
        sanitized[sanitizedKey] = sanitizeEmail(value);
      } else if (key.toLowerCase().includes('phone')) {
        sanitized[sanitizedKey] = sanitizePhone(value);
      } else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
        sanitized[sanitizedKey] = sanitizeUrl(value);
      } else if (key.toLowerCase().includes('filename')) {
        sanitized[sanitizedKey] = sanitizeFilename(value);
      } else {
        sanitized[sanitizedKey] = sanitizeHtml(value);
      }
    } else if (typeof value === 'number') {
      sanitized[sanitizedKey] = sanitizeNumber(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[sanitizedKey] = sanitizeObject(value, 3);
    } else {
      sanitized[sanitizedKey] = value;
    }
  });
  
  return sanitized;
}

// Content Security Policy 위반 문자열 검증
export function validateCspSafe(input: string): boolean {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onload 등
    /expression\s*\(/i,
    /url\s*\(/i,
    /import\s*\(/i,
    /eval\s*\(/i,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
}

// 비즈니스 로직용 새니타이제이션
export const businessSanitizers = {
  // 금액 새니타이제이션
  amount: (input: unknown): number | null => {
    return sanitizeNumber(input, { min: 0, max: 10000000, allowFloat: false });
  },
  
  // 포인트 새니타이제이션  
  points: (input: unknown): number | null => {
    return sanitizeNumber(input, { min: 0, max: 1000000000, allowFloat: false });
  },
  
  // 페이지네이션
  page: (input: unknown): number => {
    const page = sanitizeNumber(input, { min: 1, max: 10000, allowFloat: false });
    return page || 1;
  },
  
  limit: (input: unknown): number => {
    const limit = sanitizeNumber(input, { min: 1, max: 100, allowFloat: false });
    return limit || 10;
  },
  
  // 검색어
  search: (input: unknown): string => {
    if (typeof input !== 'string') return '';
    return sanitizeHtml(input).slice(0, 100);
  },
  
  // 정렬
  sortOrder: (input: unknown): 'asc' | 'desc' => {
    return input === 'asc' ? 'asc' : 'desc';
  },
};