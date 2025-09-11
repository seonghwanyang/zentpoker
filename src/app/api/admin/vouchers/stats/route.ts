import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // 현재 사용자 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // User 테이블에서 관리자 권한 확인 (email로 매칭)
    const { data: userData } = await supabase
      .from('User')
      .select('id, role')
      .eq('email', user.email)
      .single()

    if (!userData || userData.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // 바우처 통계 조회
    const [
      { count: totalIssued },
      { count: activeVouchers },
      { count: expiredVouchers },
      { count: buyinCount },
      { count: rebuyCount }
    ] = await Promise.all([
      // 총 발급 바우처
      supabase.from('Voucher').select('*', { count: 'exact', head: true }),
      
      // 활성 바우처
      supabase.from('Voucher')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE')
        .gt('expiresAt', new Date().toISOString()),
      
      // 만료된 바우처
      supabase.from('Voucher')
        .select('*', { count: 'exact', head: true })
        .or('status.eq.EXPIRED,status.eq.USED'),
      
      // Buy-in 바우처 수
      supabase.from('Voucher')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'BUYIN'),
      
      // Re-buy 바우처 수
      supabase.from('Voucher')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'REBUY')
    ])

    // 바우처 가격 정보 조회
    const { data: pricingList } = await supabase
      .from('VoucherPricing')
      .select('*')
      .eq('isActive', true)

    // 가격 정보를 구조화 (기본값 설정)
    const pricing = {
      buyInRegular: 50000,
      buyInGuest: 60000,
      reBuyRegular: 30000,
      reBuyGuest: 35000
    }

    if (pricingList && pricingList.length > 0) {
      pricingList.forEach(item => {
        if (item.type === 'BUYIN' && item.memberGrade === 'REGULAR') {
          pricing.buyInRegular = item.price
        } else if (item.type === 'BUYIN' && item.memberGrade === 'GUEST') {
          pricing.buyInGuest = item.price
        } else if (item.type === 'REBUY' && item.memberGrade === 'REGULAR') {
          pricing.reBuyRegular = item.price
        } else if (item.type === 'REBUY' && item.memberGrade === 'GUEST') {
          pricing.reBuyGuest = item.price
        }
      })
    }

    // 총 입금액 계산 (발급된 바인권 수 * 가격)
    const totalDeposit = ((buyinCount || 0) * ((pricing.buyInRegular + pricing.buyInGuest) / 2)) + 
                        ((rebuyCount || 0) * ((pricing.reBuyRegular + pricing.reBuyGuest) / 2))

    // 최근 바우처 발급 내역 (10개)
    const { data: recentVouchers } = await supabase
      .from('Voucher')
      .select(`
        *,
        User!Voucher_userId_fkey (
          id,
          name,
          email,
          grade
        )
      `)
      .order('createdAt', { ascending: false })
      .limit(10)

    // 최근 바우처 발급 내역 포맷
    const formattedRecentVouchers = (recentVouchers || []).map(voucher => {
      // 사용자 등급에 따른 가격 계산
      const isGuest = voucher.User?.grade === 'GUEST'
      const price = voucher.type === 'BUYIN'
        ? (isGuest ? pricing.buyInGuest : pricing.buyInRegular)
        : (isGuest ? pricing.reBuyGuest : pricing.reBuyRegular)

      return {
        id: voucher.id,
        createdAt: voucher.createdAt,
        userName: voucher.User?.name || voucher.User?.email || '알 수 없음',
        userGrade: voucher.User?.grade || 'REGULAR',
        type: voucher.type,
        price,
        status: voucher.status,
        expiresAt: voucher.expiresAt,
        tournamentName: null // Tournament 관계는 나중에 추가
      }
    })

    // 이번 달 신규 바우처 수
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const { count: newVouchersThisMonth } = await supabase
      .from('Voucher')
      .select('*', { count: 'exact', head: true })
      .gte('createdAt', thisMonth.toISOString())

    return NextResponse.json({
      stats: {
        totalIssued: totalIssued || 0,
        activeVouchers: activeVouchers || 0,
        expiredVouchers: expiredVouchers || 0,
        buyinCount: buyinCount || 0,
        rebuyCount: rebuyCount || 0,
        totalDeposit: Math.round(totalDeposit),
        newVouchersThisMonth: newVouchersThisMonth || 0
      },
      pricing: {
        BUYIN: {
          REGULAR: pricing.buyInRegular,
          GUEST: pricing.buyInGuest
        },
        REBUY: {
          REGULAR: pricing.reBuyRegular,
          GUEST: pricing.reBuyGuest
        }
      },
      recentVouchers: formattedRecentVouchers
    })
  } catch (error) {
    console.error('Voucher stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voucher statistics' },
      { status: 500 }
    )
  }
}