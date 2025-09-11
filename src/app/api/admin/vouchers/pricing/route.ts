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

    // 현재 활성화된 가격 정보 조회
    const { data: pricingList } = await supabase
      .from('VoucherPricing')
      .select('*')
      .eq('isActive', true)

    // 가격 정보를 구조화
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

    return NextResponse.json(pricing)
  } catch (error) {
    console.error('Error fetching pricing:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { buyInRegular, buyInGuest, reBuyRegular, reBuyGuest } = body

    // 입력값 검증
    if (!buyInRegular || !buyInGuest || !reBuyRegular || !reBuyGuest) {
      return NextResponse.json(
        { error: 'All price fields are required' },
        { status: 400 }
      )
    }

    // 가격이 0보다 큰지 확인
    if (buyInRegular <= 0 || buyInGuest <= 0 || reBuyRegular <= 0 || reBuyGuest <= 0) {
      return NextResponse.json(
        { error: 'Prices must be greater than 0' },
        { status: 400 }
      )
    }

    // 기존 가격 정보를 모두 비활성화
    const { error: deactivateError } = await supabase
      .from('VoucherPricing')
      .update({ isActive: false })
      .eq('isActive', true)

    if (deactivateError) {
      console.error('Error deactivating old pricing:', deactivateError)
      throw deactivateError
    }

    // 새로운 가격 정보 생성
    const pricingData = [
      {
        id: crypto.randomUUID(),
        type: 'BUYIN',
        memberGrade: 'REGULAR',
        price: Number(buyInRegular),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'BUYIN',
        memberGrade: 'GUEST',
        price: Number(buyInGuest),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'REBUY',
        memberGrade: 'REGULAR',
        price: Number(reBuyRegular),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        type: 'REBUY',
        memberGrade: 'GUEST',
        price: Number(reBuyGuest),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    const { error: insertError } = await supabase
      .from('VoucherPricing')
      .insert(pricingData)

    if (insertError) {
      console.error('Error inserting new pricing:', insertError)
      throw insertError
    }

    return NextResponse.json({
      success: true,
      pricing: {
        buyInRegular: Number(buyInRegular),
        buyInGuest: Number(buyInGuest),
        reBuyRegular: Number(reBuyRegular),
        reBuyGuest: Number(reBuyGuest)
      }
    })
  } catch (error) {
    console.error('Error updating pricing:', error)
    return NextResponse.json(
      { error: 'Failed to update pricing' },
      { status: 500 }
    )
  }
}