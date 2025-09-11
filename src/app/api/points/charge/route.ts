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
    const { amount, method } = body;

    if (!amount || amount < 10000) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // 사용자 조회
    const { data: userData, error: userError } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('email', user.email)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'User lookup failed' }, { status: 500 });
    }

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 참조 코드 생성
    const referenceCode = `${method === 'KAKAO_PAY' ? 'KP' : 'BT'}-${Date.now().toString().slice(-8)}`;

    // 충전 트랜잭션 생성
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('Transaction')
      .insert({
        user_id: userData.id,
        type: 'CHARGE',
        amount: amount,
        status: 'PENDING',
        description: `${method === 'KAKAO_PAY' ? '카카오페이' : '계좌이체'} 충전 신청`,
        metadata: {
          method,
          referenceCode,
          requestedAt: new Date().toISOString(),
        },
      })
      .select('id')
      .single();

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      return NextResponse.json({ error: 'Failed to create charge request' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      referenceCode,
      transactionId: transaction.id,
    });
  } catch (error) {
    console.error('Error creating charge request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
