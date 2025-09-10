import { NextResponse } from 'next/server';
import { getApiUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/api-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await getApiUser();
    
    if (!user?.email) {
      return unauthorizedResponse();
    }

    // 관리자 권한 확인
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('email', user.email)
      .single();

    if (adminError || !admin || admin.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    // 대기 중인 충전 요청 조회
    const { data: pendingCharges, error: chargesError } = await supabaseAdmin
      .from('Transaction')
      .select(`
        *,
        user:users(
          id,
          email,
          name,
          phone,
          grade
        )
      `)
      .eq('type', 'CHARGE')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true });

    if (chargesError) {
      console.error('Error fetching pending charges:', chargesError);
      return NextResponse.json({ error: 'Failed to fetch pending charges' }, { status: 500 });
    }

    // 통계 정보
    const stats = {
      totalPending: pendingCharges.length,
      totalAmount: pendingCharges.reduce((sum, charge) => sum + charge.amount, 0),
      oldestRequest: pendingCharges[0]?.createdAt || null,
    };

    return NextResponse.json({
      charges: pendingCharges,
      stats,
    });
  } catch (error) {
    console.error('Error fetching pending charges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getApiUser();
    
    if (!user?.email) {
      return unauthorizedResponse();
    }

    // 관리자 권한 확인
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('User')
      .select('id, role, name')
      .eq('email', user.email)
      .single();

    if (adminError || !admin || admin.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    const body = await request.json();
    const { transactionId, action, note } = body;

    if (!transactionId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Note: Supabase doesn't support transactions like Prisma, so we handle this sequentially
    // In production, consider using database-level constraints or stored procedures for data integrity

    // 거래 조회
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('Transaction')
      .select(`
        *,
        user:users(*)
      `)
      .eq('id', transactionId)
      .single();

    if (transactionError || !transaction) {
      console.error('Error fetching transaction:', transactionError);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.type !== 'CHARGE' || transaction.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invalid transaction status' }, { status: 400 });
    }

    if (action === 'approve') {
      // Get current user points
      const { data: currentUser, error: userError } = await supabaseAdmin
        .from('User')
        .select('points')
        .eq('id', transaction.user_id)
        .single();

      if (userError || !currentUser) {
        console.error('Error fetching user:', userError);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // 포인트 증가
      const { error: updatePointsError } = await supabaseAdmin
        .from('User')
        .update({ points: currentUser.points + transaction.amount })
        .eq('id', transaction.user_id);

      if (updatePointsError) {
        console.error('Error updating points:', updatePointsError);
        return NextResponse.json({ error: 'Failed to update points' }, { status: 500 });
      }

      // 거래 상태 업데이트
      const { error: updateTransactionError } = await supabaseAdmin
        .from('Transaction')
        .update({
          status: 'COMPLETED',
          metadata: {
            ...(transaction.metadata as any),
            approvedBy: admin.name,
            approvedAt: new Date().toISOString(),
            note,
          },
        })
        .eq('id', transactionId);

      if (updateTransactionError) {
        console.error('Error updating transaction:', updateTransactionError);
      }

      // 포인트 로그 생성
      const { error: pointLogError } = await supabaseAdmin
        .from('point_logs')
        .insert({
          user_id: transaction.user_id,
          amount: transaction.amount,
          type: '충전',
          description: `포인트 충전 승인 - ${transaction.amount.toLocaleString()}원`,
        });

      if (pointLogError) {
        console.error('Error creating point log:', pointLogError);
      }

      return NextResponse.json({ success: true, action: 'approved' });
    } else {
      // 거래 거절
      const { error: rejectError } = await supabaseAdmin
        .from('Transaction')
        .update({
          status: 'CANCELLED',
          metadata: {
            ...(transaction.metadata as any),
            rejectedBy: admin.name,
            rejectedAt: new Date().toISOString(),
            rejectReason: note || '관리자 거절',
          },
        })
        .eq('id', transactionId);

      if (rejectError) {
        console.error('Error rejecting transaction:', rejectError);
      }

      return NextResponse.json({ success: true, action: 'rejected' });
    }
  } catch (error: any) {
    console.error('Error processing charge:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
