// Prisma JSON 필드 타입 정의

// Transaction 메타데이터 타입
export interface TransactionMetadata {
  referenceCode?: string;
  paymentMethod?: string;
  externalTransactionId?: string;
  description?: string;
  refundReason?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectReason?: string;
  memo?: string;
  additionalInfo?: Record<string, unknown>;
}

// Payment 메타데이터 타입
export interface PaymentMetadata {
  referenceCode?: string;
  paymentMethod?: string;
  kakaoPayTid?: string;
  bankAccount?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  additionalInfo?: Record<string, unknown>;
}

// Tournament 메타데이터 타입
export interface TournamentMetadata {
  rules?: string[];
  prizeStructure?: Array<{
    position: number;
    amount: number;
    percentage: number;
  }>;
  settings?: {
    blindStructure?: Array<{
      level: number;
      smallBlind: number;
      bigBlind: number;
      ante?: number;
    }>;
    startingChips?: number;
    levelDuration?: number;
  };
  additionalInfo?: Record<string, unknown>;
}

// Voucher 메타데이터 타입
export interface VoucherMetadata {
  terms?: string[];
  restrictions?: string[];
  category?: string;
  applicableGames?: string[];
  minimumSpend?: number;
  maximumDiscount?: number;
  additionalInfo?: Record<string, unknown>;
}

// 동적 쿼리 타입들
export interface UserWhereInput {
  id?: string;
  email?: string | { contains: string; mode: 'insensitive' };
  name?: { contains: string; mode: 'insensitive' };
  phone?: { contains: string; mode?: 'insensitive' };
  role?: 'USER' | 'ADMIN';
  tier?: 'GUEST' | 'REGULAR';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  memberGrade?: 'REGULAR' | 'GOLD' | 'VIP';
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
  OR?: Array<{
    name?: { contains: string; mode: 'insensitive' };
    email?: { contains: string; mode: 'insensitive' };
    phone?: { contains: string };
  }>;
}

export interface TransactionWhereInput {
  id?: string;
  userId?: string;
  type?: 'CHARGE' | 'WITHDRAWAL' | 'VOUCHER_PURCHASE' | 'TOURNAMENT_ENTRY';
  status?: 'PENDING' | 'COMPLETED' | 'FAILED';
  amount?: {
    gte?: number;
    lte?: number;
  };
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
}

export interface PaymentWhereInput {
  id?: string;
  userId?: string;
  method?: string;
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  amount?: {
    gte?: number;
    lte?: number;
  };
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
}

// 업데이트 데이터 타입들
export interface UserUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'USER' | 'ADMIN';
  tier?: 'GUEST' | 'REGULAR';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  memberGrade?: 'REGULAR' | 'GOLD' | 'VIP';
  points?: number;
  password?: string;
}

export interface TransactionUpdateData {
  status?: 'PENDING' | 'COMPLETED' | 'FAILED';
  metadata?: TransactionMetadata;
}

export interface PaymentUpdateData {
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  metadata?: PaymentMetadata;
}

// 차트 컴포넌트 타입들
export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

export interface ChartDataEntry {
  [key: string]: string | number | undefined;
}

// React Hook Form 타입들
export interface FormSelectValue {
  value: string;
  label: string;
}

// Tournament 관련 타입들
export type TournamentType = 'REGULAR' | 'SPECIAL' | 'TURBO';

// Member 관련 타입들
export type MemberGrade = 'GUEST' | 'REGULAR' | 'ADMIN';