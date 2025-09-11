import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 입금 확인 요청 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { voucherType, amount, depositorName, bankName, memo } = body

    // 현재 사용자 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // User 테이블에서 사용자 정보 확인 (email로 매칭)
    const { data: userData, error: userDataError } = await supabase
      .from('User')
      .select('id')
      .eq('email', user.email)
      .single()

    if (userDataError || !userData) {
      console.error('User not found in database:', user.email)
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    // 입금 확인 요청 생성 (User 테이블의 id 사용)
    const { data: paymentRequest, error } = await supabase
      .from('PaymentRequest')
      .insert({
        id: crypto.randomUUID(),
        userId: userData.id, // User 테이블의 id 사용
        voucherType,
        amount,
        depositorName,
        bankName,
        status: 'PENDING',
        memo,
        requestDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Payment request creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create payment request' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      paymentRequest
    })
  } catch (error) {
    console.error('Payment request API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 사용자의 입금 확인 요청 목록 조회
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

    // User 테이블에서 사용자 정보 확인
    const { data: userData, error: userDataError } = await supabase
      .from('User')
      .select('id')
      .eq('email', user.email)
      .single()

    if (userDataError || !userData) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    // 사용자의 입금 확인 요청 조회
    const { data: requests, error } = await supabase
      .from('PaymentRequest')
      .select('*')
      .eq('userId', userData.id) // User 테이블의 id 사용
      .order('requestDate', { ascending: false })

    if (error) {
      console.error('Payment requests fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch payment requests' },
        { status: 500 }
      )
    }

    return NextResponse.json(requests || [])
  } catch (error) {
    console.error('Payment requests API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}