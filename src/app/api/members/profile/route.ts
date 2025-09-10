import { NextResponse } from 'next/server';
import { getApiUser, unauthorizedResponse } from '@/lib/auth/api-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await getApiUser();
    
    if (!user?.email) {
      return unauthorizedResponse();
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .select(`
        id,
        email,
        name,
        phone,
        image,
        role,
        grade,
        status,
        points,
        created_at,
        last_login_at
      `)
      .eq('email', user.email)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'User lookup failed' }, { status: 500 });
    }

    // Get transaction count
    const { count: transactionCount, error: transactionError } = await supabaseAdmin
      .from('Transaction')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get voucher count
    const { count: voucherCount, error: voucherError } = await supabaseAdmin
      .from('Voucher')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...user,
      transactionCount: transactionCount || 0,
      voucherCount: voucherCount || 0,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getApiUser();
    
    if (!user?.email) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { name, phone } = body;

    // 입력값 검증
    if (name && (name.length < 2 || name.length > 50)) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    if (phone && !/^010-\d{4}-\d{4}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('User')
      .update(updateData)
      .eq('email', user.email)
      .select(`
        id,
        email,
        name,
        phone,
        image,
        role,
        grade,
        status,
        points
      `)
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
