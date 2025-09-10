import { NextResponse } from 'next/server';
import { getApiUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/api-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const grade = searchParams.get('grade');
    const status = searchParams.get('status');

    // Build query based on search params
    let membersQuery = supabaseAdmin.from('User').select(`
      id,
      email,
      name,
      phone,
      role,
      grade,
      status,
      points,
      created_at,
      last_login_at
    `, { count: 'exact' });

    // Apply filters
    if (search) {
      membersQuery = membersQuery.or(`email.ilike.%${search}%,name.ilike.%${search}%,phone.like.%${search}%`);
    }
    if (grade) {
      membersQuery = membersQuery.eq('grade', grade);
    }
    if (status) {
      membersQuery = membersQuery.eq('status', status);
    }

    // Get total count first
    const { count: total, error: countError } = await membersQuery;
    
    if (countError) {
      console.error('Error getting member count:', countError);
      return NextResponse.json({ error: 'Failed to get member count' }, { status: 500 });
    }

    // Get paginated members
    let paginatedQuery = supabaseAdmin.from('User').select(`
      id,
      email,
      name,
      phone,
      role,
      grade,
      status,
      points,
      created_at,
      last_login_at
    `);

    // Apply same filters
    if (search) {
      paginatedQuery = paginatedQuery.or(`email.ilike.%${search}%,name.ilike.%${search}%,phone.like.%${search}%`);
    }
    if (grade) {
      paginatedQuery = paginatedQuery.eq('grade', grade);
    }
    if (status) {
      paginatedQuery = paginatedQuery.eq('status', status);
    }

    const { data: members, error: membersError } = await paginatedQuery
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }

    // Get transaction and voucher counts for each member
    const membersWithCounts = await Promise.all(
      (members || []).map(async (member) => {
        const [transactionResult, voucherResult] = await Promise.all([
          supabaseAdmin.from('Transaction').select('*', { count: 'exact', head: true }).eq('user_id', member.id),
          supabaseAdmin.from('Voucher').select('*', { count: 'exact', head: true }).eq('user_id', member.id)
        ]);
        
        return {
          ...member,
          transactionCount: transactionResult.count || 0,
          voucherCount: voucherResult.count || 0
        };
      })
    );

    // Get grade statistics - manual grouping since Supabase doesn't have groupBy
    const { data: allUsers, error: statsError } = await supabaseAdmin
      .from('User')
      .select('grade');

    const gradeStats = {
      GUEST: 0,
      REGULAR: 0,
      ADMIN: 0,
    };

    if (!statsError && allUsers) {
      allUsers.forEach((user) => {
        if (user.grade in gradeStats) {
          gradeStats[user.grade as keyof typeof gradeStats] += 1;
        }
      });
    }

    return NextResponse.json({
      members: membersWithCounts,
      pagination: {
        total: total || 0,
        page,
        limit,
        totalPages: Math.ceil((total || 0) / limit),
      },
      stats: gradeStats,
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
