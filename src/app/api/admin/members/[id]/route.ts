import { NextResponse } from 'next/server';
import { getApiUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/api-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // 멤버 정보 조회
    const { data: member, error: memberError } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('id', params.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // 최근 거래 내역 조회
    const { data: transactions } = await supabaseAdmin
      .from('Transaction')
      .select('*')
      .eq('user_id', params.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // 최근 바인권 내역 조회
    const { data: vouchers } = await supabaseAdmin
      .from('Voucher')
      .select('*')
      .eq('user_id', params.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // 거래 및 바인권 갯수 조회
    const [transactionResult, voucherResult] = await Promise.all([
      supabaseAdmin.from('Transaction').select('*', { count: 'exact', head: true }).eq('user_id', params.id),
      supabaseAdmin.from('Voucher').select('*', { count: 'exact', head: true }).eq('user_id', params.id)
    ]);

    return NextResponse.json({
      ...member,
      transactions: transactions || [],
      vouchers: vouchers || [],
      _count: {
        transactions: transactionResult.count || 0,
        vouchers: voucherResult.count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json();
    const { name, phone, grade, status, role } = body;

    // 입력값 검증
    const validGrades = ['GUEST', 'REGULAR', 'VIP'];
    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
    const validRoles = ['USER', 'ADMIN'];

    if (grade && !validGrades.includes(grade)) {
      return NextResponse.json({ error: 'Invalid grade' }, { status: 400 });
    }

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (grade) updateData.grade = grade;
    if (status) updateData.status = status;
    if (role) updateData.role = role;

    const { data: updatedMember, error: updateError } = await supabaseAdmin
      .from('User')
      .update(updateData)
      .eq('id', params.id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating member:', updateError);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
