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

    // 사용자의 활성 바인권 조회
    const { data: vouchers, error } = await supabase
      .from('Voucher')
      .select('*')
      .eq('userId', user.id)
      .eq('status', 'ACTIVE')
      .or('expiresAt.is.null,expiresAt.gte.' + new Date().toISOString())
      .order('expiresAt', { ascending: true })

    if (error) {
      console.error('Vouchers fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch vouchers' },
        { status: 500 }
      )
    }

    // 바인권 타입별로 분류하여 반환
    const formattedVouchers = vouchers.map(v => ({
      id: v.id,
      type: v.type === 'BUYIN' ? 'BUY_IN' : v.type === 'REBUY' ? 'RE_BUY' : v.type,
      status: v.status,
      purchasedAt: v.createdAt,
      expiresAt: v.expiresAt,
      price: v.type === 'BUYIN' ? 50000 : v.type === 'REBUY' ? 30000 : 50000,
      tournamentId: v.tournamentId
    }))

    return NextResponse.json(formattedVouchers)
  } catch (error) {
    console.error('Vouchers API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}