import { z } from 'zod';
import { 
  getPointChargePrice, 
  getPointChargePolicyMessage, 
  isValidPointChargeAmount,
  getRebuyPrice,
  getRebuyPolicyMessage,
  isValidRebuyAmount
} from '@/lib/config/pricing';

// 공통 검증 스키마
export const emailSchema = z.string().email('올바른 이메일 형식이 아닙니다.');

export const phoneSchema = z
  .string()
  .regex(/^010-\d{4}-\d{4}$/, '전화번호는 010-0000-0000 형식이어야 합니다.')
  .optional();

export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
  .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, '비밀번호는 영문과 숫자를 포함해야 합니다.');

export const nameSchema = z
  .string()
  .min(2, '이름은 최소 2자 이상이어야 합니다.')
  .max(50, '이름은 최대 50자까지 가능합니다.');

// 포인트 충전 검증
export const pointChargeSchema = z.object({
  amount: z.number().refine(
    (amount) => isValidPointChargeAmount(amount, 'MEMBER') || isValidPointChargeAmount(amount, 'GUEST'),
    '충전 금액은 정회원 25,000원 또는 게스트 30,000원만 가능합니다.'
  ),
  method: z.enum(['KAKAO_PAY', 'BANK_TRANSFER'], {
    errorMap: () => ({ message: '지원하지 않는 결제 방법입니다.' }),
  }),
  userType: z.enum(['MEMBER', 'GUEST'], {
    errorMap: () => ({ message: '올바른 회원 유형이 아닙니다.' }),
  }),
});

// 회원 정보 업데이트 검증
export const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema,
  currentPassword: z.string().optional(),
  newPassword: passwordSchema.optional(),
}).refine((data) => {
  // 비밀번호 변경 시 현재 비밀번호 필수
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: '비밀번호 변경 시 현재 비밀번호를 입력해야 합니다.',
  path: ['currentPassword'],
});

// 토너먼트 생성 검증
export const tournamentCreateSchema = z.object({
  title: z.string().min(3, '제목은 최소 3자 이상이어야 합니다.').max(100, '제목은 최대 100자까지 가능합니다.'),
  description: z.string().max(500, '설명은 최대 500자까지 가능합니다.').optional(),
  startDate: z.string().datetime('올바른 날짜 형식이 아닙니다.'),
  endDate: z.string().datetime('올바른 날짜 형식이 아닙니다.'),
  maxParticipants: z.number().min(2, '최소 참가자는 2명 이상이어야 합니다.').max(1000, '최대 참가자는 1000명까지 가능합니다.'),
  entryFee: z.number().min(0, '참가비는 0원 이상이어야 합니다.'),
  prizePool: z.number().min(0, '상금은 0원 이상이어야 합니다.'),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return startDate < endDate;
}, {
  message: '종료일은 시작일보다 늦어야 합니다.',
  path: ['endDate'],
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const now = new Date();
  return startDate > now;
}, {
  message: '시작일은 현재 시간보다 늦어야 합니다.',
  path: ['startDate'],
});

// 바우처 생성 검증
export const voucherCreateSchema = z.object({
  name: z.string().min(3, '바우처명은 최소 3자 이상이어야 합니다.').max(100, '바우처명은 최대 100자까지 가능합니다.'),
  price: z.number().refine(
    (price) => isValidRebuyAmount(price),
    getRebuyPolicyMessage()
  ),
  description: z.string().max(500, '설명은 최대 500자까지 가능합니다.').optional(),
  expiresAt: z.string().datetime('올바른 날짜 형식이 아닙니다.').optional(),
}).refine((data) => {
  if (data.expiresAt) {
    const expiresAt = new Date(data.expiresAt);
    const now = new Date();
    return expiresAt > now;
  }
  return true;
}, {
  message: '만료일은 현재 시간보다 늦어야 합니다.',
  path: ['expiresAt'],
});

// 페이지네이션 검증
export const paginationSchema = z.object({
  page: z.number().min(1, '페이지는 1 이상이어야 합니다.').default(1),
  limit: z.number().min(1, '제한은 1 이상이어야 합니다.').max(100, '제한은 100 이하여야 합니다.').default(10),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// 검색 파라미터 검증
export const searchSchema = paginationSchema.extend({
  search: z.string().max(100, '검색어는 최대 100자까지 가능합니다.').default(''),
  status: z.string().optional(),
  type: z.string().optional(),
  startDate: z.string().datetime('올바른 날짜 형식이 아닙니다.').optional(),
  endDate: z.string().datetime('올바른 날짜 형식이 아닙니다.').optional(),
});

// 결제 확인 검증
export const paymentConfirmSchema = z.object({
  transactionId: z.string().min(1, '트랜잭션 ID가 필요합니다.'),
  paymentId: z.string().min(1, '결제 ID가 필요합니다.'),
  status: z.enum(['APPROVED', 'REJECTED'], {
    errorMap: () => ({ message: '승인 또는 거절만 가능합니다.' }),
  }),
  memo: z.string().max(500, '메모는 최대 500자까지 가능합니다.').optional(),
  rejectReason: z.string().max(200, '거절 사유는 최대 200자까지 가능합니다.').optional(),
}).refine((data) => {
  // 거절 시 사유 필수
  if (data.status === 'REJECTED' && !data.rejectReason) {
    return false;
  }
  return true;
}, {
  message: '거절 시 사유를 입력해야 합니다.',
  path: ['rejectReason'],
});

// 검증 헬퍼 함수들
export function validateEmail(email: string): boolean {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

export function validatePhone(phone: string): boolean {
  try {
    phoneSchema.parse(phone);
    return true;
  } catch {
    return false;
  }
}

export function validatePassword(password: string): boolean {
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
}

// 포인트 충전 정책 검증
export function validateChargeAmount(amount: number, userType: 'MEMBER' | 'GUEST'): {
  isValid: boolean;
  expectedAmount?: number;
  message?: string;
} {
  const expectedAmount = getPointChargePrice(userType);

  if (!isValidPointChargeAmount(amount, userType)) {
    return {
      isValid: false,
      expectedAmount,
      message: getPointChargePolicyMessage(userType),
    };
  }

  return { isValid: true };
}

// 리바인권 가격 검증
export function validateRebuyAmount(amount: number): {
  isValid: boolean;
  expectedAmount?: number;
  message?: string;
} {
  const expectedAmount = getRebuyPrice();

  if (!isValidRebuyAmount(amount)) {
    return {
      isValid: false,
      expectedAmount,
      message: getRebuyPolicyMessage(),
    };
  }

  return { isValid: true };
}

// 데이터 새니타이제이션
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

export function sanitizePhone(phone: string): string {
  // 전화번호에서 숫자만 추출 후 형식 적용
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('010')) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return phone;
}