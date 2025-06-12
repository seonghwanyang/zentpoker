// 카카오페이 링크 선택 유틸리티

export type MemberGrade = 'REGULAR' | 'GUEST'
export type VoucherType = 'BUY_IN' | 'RE_BUY'

/**
 * 회원 등급과 바인권 종류에 따라 적절한 카카오페이 링크를 반환
 */
export function getKakaoPayLink(memberGrade: MemberGrade, voucherType: VoucherType): string {
  const links = {
    REGULAR: {
      BUY_IN: process.env.NEXT_PUBLIC_KAKAO_PAY_LINK_REGULAR_BUYIN || '',
      RE_BUY: process.env.NEXT_PUBLIC_KAKAO_PAY_LINK_REGULAR_REBUY || '',
    },
    GUEST: {
      BUY_IN: process.env.NEXT_PUBLIC_KAKAO_PAY_LINK_GUEST_BUYIN || '',
      RE_BUY: process.env.NEXT_PUBLIC_KAKAO_PAY_LINK_GUEST_REBUY || '',
    },
  }

  return links[memberGrade]?.[voucherType] || ''
}

/**
 * 회원 등급과 바인권 종류에 따른 가격 정보
 */
export const VOUCHER_PRICES = {
  REGULAR: {
    BUY_IN: 25000,
    RE_BUY: 15000,
  },
  GUEST: {
    BUY_IN: 30000,
    RE_BUY: 20000,
  },
} as const

/**
 * 회원 등급과 바인권 종류에 따른 가격 반환
 */
export function getVoucherPrice(memberGrade: MemberGrade, voucherType: VoucherType): number {
  return VOUCHER_PRICES[memberGrade]?.[voucherType] || 0
}
