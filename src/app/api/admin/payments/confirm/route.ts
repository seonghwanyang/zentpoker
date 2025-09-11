import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  // /api/admin/payments/pending 로 통합됨
  return NextResponse.json({ error: 'Use /api/admin/payments/pending instead' }, { status: 404 });
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    // 현재 사용자 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    const { data: admin, error: adminError } = await supabase
      .from('User')
      .select('id, role, name')
      .eq('email', user.email)
      .single();

    if (adminError || !admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { transactionId, action, note } = body;

    if (!transactionId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // PaymentRequest 조회
    const { data: paymentRequest, error: fetchError } = await supabase
      .from('PaymentRequest')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (fetchError || !paymentRequest) {
      console.error('Error fetching payment request:', fetchError);
      return NextResponse.json({ error: 'Payment request not found' }, { status: 404 });
    }

    if (paymentRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
    }

    if (action === 'approve') {
      // 바인권 발급
      const voucherId = crypto.randomUUID();
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
        });

      if (voucherError) {
        console.error('Voucher creation error:', voucherError);
        return NextResponse.json(
          { error: 'Failed to create voucher' },
          { status: 500 }
        );
      }

      // PaymentRequest 상태 업데이트
      const { error: updateError } = await supabase
        .from('PaymentRequest')
        .update({
          status: 'CONFIRMED',
          confirmedBy: admin.id,
          confirmedAt: new Date().toISOString(),
          voucherId,
          memo: note,
          updatedAt: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (updateError) {
        console.error('Payment request update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update payment request' },
          { status: 500 }
        );
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
        });

      return NextResponse.json({ success: true, action: 'approved' });
    } else {
      // PaymentRequest 거절
      const { error: updateError } = await supabase
        .from('PaymentRequest')
        .update({
          status: 'REJECTED',
          confirmedBy: admin.id,
          confirmedAt: new Date().toISOString(),
          memo: note || '관리자 거절',
          updatedAt: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (updateError) {
        console.error('Payment request update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update payment request' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, action: 'rejected' });
    }
  } catch (error: any) {
    console.error('Error processing charge:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
