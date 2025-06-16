// API 공통 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API 에러 응답 타입
export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

// 요청 타입들
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  search?: string;
}

// 인증 관련 타입
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
    memberGrade?: 'REGULAR' | 'GOLD' | 'VIP';
  };
  token?: string;
}

// 포인트 관련 타입
export interface PointChargeRequest {
  amount: number;
  method: 'KAKAO_PAY' | 'BANK_TRANSFER';
  userType: 'MEMBER' | 'GUEST';
}

export interface PointChargeResponse {
  transactionId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paymentUrl?: string;
}

// 토너먼트 관련 타입
export interface TournamentRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  entryFee: number;
  prizePool: number;
}

export interface TournamentResponse {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  entryFee: number;
  prizePool: number;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

// 바우처 관련 타입
export interface VoucherRequest {
  name: string;
  price: number;
  description?: string;
  expiresAt?: string;
}

export interface VoucherResponse {
  id: string;
  name: string;
  price: number;
  description?: string;
  code: string;
  status: 'ACTIVE' | 'USED' | 'EXPIRED';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VoucherPurchaseRequest {
  voucherType: 'REBUY';
  quantity: number;
  amount: number;
}

export interface VoucherPurchaseResponse {
  vouchers: {
    id: string;
    code: string;
    type: string;
    status: string;
    purchasedAt: string;
    expiresAt: string | null;
    price: number;
  }[];
  transactionId: string;
  totalPrice: number;
  remainingBalance: number;
}

// 결제 관련 타입
export interface PaymentRequest {
  amount: number;
  method: 'KAKAO_PAY' | 'BANK_TRANSFER';
  metadata?: Record<string, unknown>;
}

export interface PaymentResponse {
  id: string;
  amount: number;
  method: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  transactionId?: string;
  paymentUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// 유저 관련 타입
export interface UserUpdateRequest {
  name?: string;
  phone?: string;
  password?: string;
  currentPassword?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  memberGrade?: 'REGULAR' | 'GOLD' | 'VIP';
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

// 통계 관련 타입
export interface DashboardStats {
  totalUsers: number;
  totalRevenue: number;
  activeGames: number;
  pendingPayments: number;
  recentTransactions: Transaction[];
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: 'CHARGE' | 'WITHDRAWAL' | 'VOUCHER_PURCHASE' | 'TOURNAMENT_ENTRY';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
}

// 리포트 관련 타입
export interface ReportRequest {
  startDate: string;
  endDate: string;
  type: 'REVENUE' | 'USER' | 'TRANSACTION' | 'TOURNAMENT';
}

export interface ReportResponse {
  id: string;
  type: string;
  data: Record<string, unknown>;
  generatedAt: Date;
}