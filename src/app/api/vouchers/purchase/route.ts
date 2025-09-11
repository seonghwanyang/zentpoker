import { NextResponse } from 'next/server';
import { getApiUser, unauthorizedResponse } from '@/lib/auth/api-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const user = await getApiUser();
    
    if (!user?.email) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { type, quantity = 1 } = body;

    if (!type || !['BUYIN', 'REBUY'].includes(type)) {
      return NextResponse.json({ error: 'Invalid voucher type' }, { status: 400 });
    }

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    // Note: Supabase doesn't support transactions like Prisma, so we handle this sequentially
    // In production, consider using database-level constraints or stored procedures for data integrity
    
    // 사용자 조회
    const { data: userData, error: userDataError } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('email', user.email!)
      .single();

    if (userDataError || !userData) {
      console.error('Error fetching userData:', userDataError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 가격 정책 조회
    const { data: pricing, error: pricingError } = await supabaseAdmin
      .from('voucher_pricing')
      .select('*')
      .eq('type', type)
      .eq('member_grade', userData.grade)
      .eq('is_active', true)
      .single();

    if (pricingError || !pricing) {
      console.error('Error fetching pricing:', pricingError);
      return NextResponse.json({ error: 'Pricing not found' }, { status: 404 });
    }

    const totalPrice = pricing.price * quantity;

    // 포인트 잔액 확인
    if (userData.points < totalPrice) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
    }

    // 포인트 차감
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('User')
      .update({ points: userData.points - totalPrice })
      .eq('id', userData.id)
      .select('points')
      .single();

    if (updateError || !updatedUser) {
      console.error('Error updating userData points:', updateError);
      return NextResponse.json({ error: 'Failed to update points' }, { status: 500 });
    }

    // 바인권 생성
    const voucherData = Array(quantity).fill(null).map(() => ({
      userData_id: userData.id,
      type: type,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일
    }));

    const { data: vouchers, error: vouchersError } = await supabaseAdmin
      .from('Voucher')
      .insert(voucherData)
      .select();

    if (vouchersError) {
      console.error('Error creating vouchers:', vouchersError);
      // Try to rollback points
      await supabaseAdmin
        .from('User')
        .update({ points: userData.points })
        .eq('id', userData.id);
      return NextResponse.json({ error: 'Failed to create vouchers' }, { status: 500 });
    }

    // 거래 기록 생성
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('Transaction')
      .insert({
        userData_id: userData.id,
        type: 'VOUCHER_PURCHASE',
        amount: -totalPrice,
        status: 'COMPLETED',
        description: `${type === 'BUYIN' ? 'Buy-in' : 'Re-buy'} 바인권 ${quantity}개 구매`,
        metadata: {
          voucherType: type,
          quantity,
          unitPrice: pricing.price,
          totalPrice,
        },
      })
      .select('id')
      .single();

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
    }

    // 포인트 로그 생성
    const { error: pointLogError } = await supabaseAdmin
      .from('point_logs')
      .insert({
        userData_id: userData.id,
        amount: -totalPrice,
        type: '구매',
        description: `${type === 'BUYIN' ? 'Buy-in' : 'Re-buy'} 바인권 ${quantity}개 구매`,
      });

    if (pointLogError) {
      console.error('Error creating point log:', pointLogError);
    }

    const result = {
      success: true,
      vouchers: vouchers?.length || quantity,
      remainingPoints: updatedUser.points,
      transaction: transaction?.id,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error purchasing vouchers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
