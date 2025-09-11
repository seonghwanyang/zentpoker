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

    // 관리자 권한 확인
    const { data: userData } = await supabase
      .from('User')
      .select('role')
      .eq('email', user.email)
      .single()

    if (userData?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // PaymentRequest 테이블에서 PENDING 상태의 요청 조회
    const { data: pendingPayments, error: paymentsError } = await supabase
      .from('PaymentRequest')
      .select(`
        *,
        User!PaymentRequest_userId_fkey (
          id,
          name,
          email,
          grade
        )
      `)
      .eq('status', 'PENDING')
      .order('requestDate', { ascending: true })

    if (paymentsError) {
      console.error('Error fetching pending payments:', paymentsError)
      return NextResponse.json({ error: 'Failed to fetch pending payments' }, { status: 500 })
    }

    // Format the response
    const formattedPayments = (pendingPayments || []).map(payment => {
      return {
        id: payment.id,
        userId: payment.userId,
        userName: payment['User!PaymentRequest_userId_fkey']?.name || '알 수 없음',
        userEmail: payment['User!PaymentRequest_userId_fkey']?.email,
        userGrade: payment['User!PaymentRequest_userId_fkey']?.grade || 'GUEST',
        amount: payment.amount,
        voucherType: payment.voucherType,
        depositorName: payment.depositorName,
        bankName: payment.bankName || '',
        referenceCode: `ZP-${payment.id.slice(0, 8).toUpperCase()}`,
        paymentMethod: 'BANK',
        requestedAt: payment.requestDate,
        status: payment.status,
        memo: payment.memo || ''
      }
    })

    // Calculate statistics
    const stats = {
      totalCount: formattedPayments.length,
      totalAmount: formattedPayments.reduce((sum, p) => sum + p.amount, 0),
      averageWaitTime: calculateAverageWaitTime(pendingPayments)
    }

    return NextResponse.json({
      payments: formattedPayments,
      stats
    })
  } catch (error) {
    console.error('Error fetching pending payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending payments' },
      { status: 500 }
    )
  }
}

function calculateAverageWaitTime(payments: any[]): number {
  if (payments.length === 0) return 0
  
  const now = new Date()
  const totalMinutes = payments.reduce((sum, payment) => {
    const requestTime = new Date(payment.requestDate || payment.createdAt)
    const diff = now.getTime() - requestTime.getTime()
    return sum + Math.floor(diff / 60000)
  }, 0)
  
  return Math.floor(totalMinutes / payments.length)
}