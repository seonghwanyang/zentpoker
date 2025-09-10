// 가격 정책 설정
export const PRICING = {
  // 바우처 가격
  VOUCHER: {
    BUY_IN: {
      REGULAR: 25000,    // 정회원: 25,000원
      GUEST: 30000,      // 게스트: 30,000원
      ADMIN: 25000,      // 관리자: 정회원과 동일
    },
    RE_BUY: {
      REGULAR: 15000,    // 정회원: 15,000원
      GUEST: 20000,      // 게스트: 20,000원
      ADMIN: 15000,      // 관리자: 정회원과 동일
    },
  },
  
  // 포인트 충전 가격 (향후 사용)
  POINT_CHARGE: {
    MINIMUM: 10000,      // 최소 충전 금액
    MAXIMUM: 1000000,    // 최대 충전 금액
  },
  
  // 토너먼트 관련
  TOURNAMENT: {
    REGULAR: {
      BUY_IN: 50000,
      RE_BUY: 30000,
    },
    SPECIAL: {
      BUY_IN: 100000,
      RE_BUY: 50000,
    },
    TURBO: {
      BUY_IN: 30000,
      RE_BUY: 20000,
    },
  },
} as const;

// 타입 정의
export type MemberGrade = 'REGULAR' | 'GUEST' | 'ADMIN';
export type VoucherType = 'BUY_IN' | 'RE_BUY';
export type TournamentType = 'REGULAR' | 'SPECIAL' | 'TURBO';

// 가격 조회 헬퍼 함수들
export function getVoucherPrice(
  voucherType: VoucherType,
  memberGrade: MemberGrade
): number {
  return PRICING.VOUCHER[voucherType][memberGrade];
}

export function getTournamentPrice(
  tournamentType: TournamentType,
  priceType: 'BUY_IN' | 'RE_BUY'
): number {
  return PRICING.TOURNAMENT[tournamentType][priceType];
}

// 가격 포맷팅 함수
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount);
}

// 가격 정책 메시지 생성
export function getVoucherPriceMessage(
  voucherType: VoucherType,
  memberGrade: MemberGrade
): string {
  const price = getVoucherPrice(voucherType, memberGrade);
  const voucherLabel = voucherType === 'BUY_IN' ? 'Buy-in 바우처' : 'Re-buy 바우처';
  const gradeLabel = memberGrade === 'GUEST' ? '게스트' : '정회원';
  return `${gradeLabel} ${voucherLabel}: ${formatPrice(price)}원`;
}

// 전체 가격 정책 정보
export function getAllPricingInfo() {
  return {
    vouchers: {
      buyIn: {
        regular: PRICING.VOUCHER.BUY_IN.REGULAR,
        guest: PRICING.VOUCHER.BUY_IN.GUEST,
      },
      reBuy: {
        regular: PRICING.VOUCHER.RE_BUY.REGULAR,
        guest: PRICING.VOUCHER.RE_BUY.GUEST,
      },
    },
    tournaments: PRICING.TOURNAMENT,
  };
}

// 기존 코드와의 호환성을 위한 export
export const PRICING_POLICIES = {
  POINT_CHARGE: {
    MEMBER: PRICING.VOUCHER.BUY_IN.REGULAR,
    GUEST: PRICING.VOUCHER.BUY_IN.GUEST,
  },
  VOUCHERS: {
    REBUY: PRICING.VOUCHER.RE_BUY.REGULAR,
  },
} as const;

// 기존 함수들과의 호환성
export function getPointChargePrice(userType: 'MEMBER' | 'GUEST'): number {
  return PRICING_POLICIES.POINT_CHARGE[userType];
}

export function getRebuyPrice(): number {
  return PRICING_POLICIES.VOUCHERS.REBUY;
}