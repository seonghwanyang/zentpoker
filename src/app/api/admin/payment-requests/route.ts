import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 모든 입금 확인 요청 조회 (관리자용)
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

    // 모든 입금 확인 요청 조회
    const { data: requests, error } = await supabase
      .from('PaymentRequest')
      .select(`
        *,
        User (
          id,
          name,
          email,
          grade
        )
      `)
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
    console.error('Admin payment requests API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 입금 확인 처리 (관리자용)
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { requestId, action, memo } = body // action: 'CONFIRM' or 'REJECT'

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

    // 입금 확인 요청 조회
    const { data: paymentRequest, error: fetchError } = await supabase
      .from('PaymentRequest')
      .select('*')
      .eq('id', requestId)
      .single()

    if (fetchError || !paymentRequest) {
      return NextResponse.json(
        { error: 'Payment request not found' },
        { status: 404 }
      )
    }

    if (paymentRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Request already processed' },
        { status: 400 }
      )
    }

    if (action === 'CONFIRM') {
      // 바인권 발급
      const voucherId = crypto.randomUUID()
      const { error: voucherError } = await supabase
        .from('Voucher')
        .insert({
          id: voucherId,
          userId: paymentRequest.userId,
          type: paymentRequest.voucherType,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후 만료
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })

      if (voucherError) {
        console.error('Voucher creation error:', voucherError)
        return NextResponse.json(
          { error: 'Failed to create voucher' },
          { status: 500 }
        )
      }

      // 입금 확인 요청 상태 업데이트
      const { error: updateError } = await supabase
        .from('PaymentRequest')
        .update({
          status: 'CONFIRMED',
          confirmedBy: userData.id, // User 테이블의 id 사용
          confirmedAt: new Date().toISOString(),
          voucherId,
          memo,
          updatedAt: new Date().toISOString()
        })
        .eq('id', requestId)

      if (updateError) {
        console.error('Payment request update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update payment request' },
          { status: 500 }
        )
      }

      // 포인트 로그 생성 (선택사항)
      await supabase
        .from('PointLog')
        .insert({
          id: crypto.randomUUID(),
          userId: paymentRequest.userId,
          amount: 0, // 바인권은 포인트와 별개
          type: 'VOUCHER_ISSUED',
          description: `${paymentRequest.voucherType} 바인권 발급 (입금 확인)`,
          createdAt: new Date().toISOString()
        })

      return NextResponse.json({
        success: true,
        message: 'Payment confirmed and voucher issued'
      })
    } else if (action === 'REJECT') {
      // 입금 확인 요청 거절
      const { error: updateError } = await supabase
        .from('PaymentRequest')
        .update({
          status: 'REJECTED',
          confirmedBy: userData.id, // User 테이블의 id 사용
          confirmedAt: new Date().toISOString(),
          memo,
          updatedAt: new Date().toISOString()
        })
        .eq('id', requestId)

      if (updateError) {
        console.error('Payment request update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update payment request' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Payment request rejected'
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Payment confirmation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}