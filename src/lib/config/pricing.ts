// 가격 정책 설정
export const PRICING_POLICIES = {
  // 포인트 충전 가격
  POINT_CHARGE: {
    MEMBER: 25000,      // 정회원: 25,000원
    GUEST: 30000,       // 게스트: 30,000원
  },
  
  // 바우처 가격
  VOUCHERS: {
    REBUY: 15000,       // 리바인권: 15,000원
  },
  
  // 토너먼트 관련 (향후 확장용)
  TOURNAMENTS: {
    // 추후 토너먼트 구조가 결정되면 추가
  },
} as const;

// 타입 추출
export type UserType = keyof typeof PRICING_POLICIES.POINT_CHARGE;
export type VoucherType = keyof typeof PRICING_POLICIES.VOUCHERS;

// 가격 조회 헬퍼 함수들
export function getPointChargePrice(userType: UserType): number {
  return PRICING_POLICIES.POINT_CHARGE[userType];
}

export function getVoucherPrice(voucherType: VoucherType): number {
  return PRICING_POLICIES.VOUCHERS[voucherType];
}

export function getRebuyPrice(): number {
  return PRICING_POLICIES.VOUCHERS.REBUY;
}

// 가격 정책 검증 함수들
export function isValidPointChargeAmount(amount: number, userType: UserType): boolean {
  return amount === getPointChargePrice(userType);
}

export function isValidVoucherPrice(amount: number, voucherType: VoucherType): boolean {
  return amount === getVoucherPrice(voucherType);
}

export function isValidRebuyAmount(amount: number): boolean {
  return amount === getRebuyPrice();
}

// 가격 정책 메시지 생성
export function getPointChargePolicyMessage(userType: UserType): string {
  const price = getPointChargePrice(userType);
  const typeLabel = userType === 'MEMBER' ? '정회원' : '게스트';
  return `${typeLabel}은 ${price.toLocaleString()}원만 충전 가능합니다.`;
}

export function getVoucherPolicyMessage(voucherType: VoucherType): string {
  const price = getVoucherPrice(voucherType);
  const typeLabel = voucherType === 'REBUY' ? '리바인권' : '바우처';
  return `${typeLabel}은 ${price.toLocaleString()}원입니다.`;
}

export function getRebuyPolicyMessage(): string {
  const price = getRebuyPrice();
  return `리바인권은 ${price.toLocaleString()}원입니다.`;
}

// 전체 가격 정책 정보
export function getAllPricingPolicies() {
  return {
    pointCharge: {
      member: {
        amount: PRICING_POLICIES.POINT_CHARGE.MEMBER,
        description: '정회원 포인트 충전',
      },
      guest: {
        amount: PRICING_POLICIES.POINT_CHARGE.GUEST,
        description: '게스트 포인트 충전',
      },
    },
    vouchers: {
      rebuy: {
        amount: PRICING_POLICIES.VOUCHERS.REBUY,
        description: '리바인권',
      },
    },
  };
}