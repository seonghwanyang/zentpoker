import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 바인권 수동 발급 API
export async function POST(request: NextRequest) {
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
    const { data: adminData } = await supabase
      .from('User')
      .select('id, role')
      .eq('email', user.email)
      .single()

    if (!adminData || adminData.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      userId, 
      voucherType, // BUYIN or REBUY
      tournamentId, // 토너먼트 ID (선택사항)
      expiresAt // 만료일 (선택사항, 기본값: 30일 후)
    } = body

    // 필수 필드 검증
    if (!userId || !voucherType) {
      return NextResponse.json(
        { error: 'User ID and voucher type are required' },
        { status: 400 }
      )
    }

    // 유효한 바인권 타입인지 확인
    if (!['BUYIN', 'REBUY'].includes(voucherType)) {
      return NextResponse.json(
        { error: 'Invalid voucher type' },
        { status: 400 }
      )
    }

    // 사용자 정보 조회
    const { data: userData, error: userFetchError } = await supabase
      .from('User')
      .select('id, name, email, grade')
      .eq('id', userId)
      .single()

    if (userFetchError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 현재 활성화된 가격 정보 조회
    const { data: pricingList } = await supabase
      .from('VoucherPricing')
      .select('*')
      .eq('isActive', true)
      .eq('type', voucherType)
      .eq('memberGrade', userData.grade || 'GUEST')
      .single()

    // 가격 계산
    let price = 0
    if (pricingList) {
      price = pricingList.price
    } else {
      // 기본 가격 (가격 정보가 없을 경우)
      if (voucherType === 'BUYIN') {
        price = userData.grade === 'REGULAR' ? 50000 : 60000
      } else {
        price = userData.grade === 'REGULAR' ? 30000 : 35000
      }
    }

    // 만료일 설정 (기본값: 30일 후)
    const expiration = expiresAt 
      ? new Date(expiresAt) 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    // 바인권 발급
    const voucherData = {
      id: crypto.randomUUID(),
      userId,
      type: voucherType,
      status: 'ACTIVE',
      expiresAt: expiration.toISOString(),
      tournamentId: tournamentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const { data: voucher, error: voucherError } = await supabase
      .from('Voucher')
      .insert(voucherData)
      .select()
      .single()

    if (voucherError) {
      console.error('Error creating voucher:', voucherError)
      return NextResponse.json(
        { error: 'Failed to create voucher' },
        { status: 500 }
      )
    }

    // 포인트 로그 생성 (선택사항)
    await supabase
      .from('PointLog')
      .insert({
        id: crypto.randomUUID(),
        userId,
        amount: 0,
        type: 'VOUCHER_ISSUED',
        description: `${voucherType} 바인권 수동 발급 (관리자: ${adminData.id})`,
        createdAt: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      voucher: {
        ...voucher,
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          grade: userData.grade
        },
        price
      }
    })
  } catch (error) {
    console.error('Error issuing voucher:', error)
    return NextResponse.json(
      { error: 'Failed to issue voucher' },
      { status: 500 }
    )
  }
}