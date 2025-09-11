import { NextRequest, NextResponse } from 'next/server';
import { getApiUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/api-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get current date for statistics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Build query
    let query = supabaseAdmin
      .from('Tournament')
      .select('*, TournamentEntry(count)', { count: 'exact' });
    
    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    // Fetch tournaments with pagination
    const { data: tournaments, error: tournamentsError, count: totalCount } = await query
      .order('startDate', { ascending: false })
      .range(skip, skip + limit - 1);

    if (tournamentsError) {
      console.error('Error fetching tournaments:', tournamentsError);
      return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 });
    }

    // Get statistics
    const { data: upcomingData } = await supabaseAdmin
      .from('Tournament')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'UPCOMING')
      .gte('startDate', now.toISOString());

    const { data: monthlyData } = await supabaseAdmin
      .from('Tournament')
      .select('*', { count: 'exact', head: true })
      .gte('startDate', startOfMonth.toISOString())
      .lte('startDate', endOfMonth.toISOString());

    const { count: totalParticipants } = await supabaseAdmin
      .from('TournamentEntry')
      .select('*', { count: 'exact', head: true });

    const { data: allTournamentsForAvg } = await supabaseAdmin
      .from('Tournament')
      .select('maxEntries, TournamentEntry(count)')
      .in('status', ['COMPLETED', 'IN_PROGRESS']);

    const upcomingCount = upcomingData?.length || 0;
    const monthlyCount = monthlyData?.length || 0;

    // Calculate average participation rate
    let averageParticipationRate = 0;
    if (allTournamentsForAvg && allTournamentsForAvg.length > 0) {
      const rates = allTournamentsForAvg
        .filter(t => t.maxEntries && t.maxEntries > 0)
        .map(t => {
          const entryCount = t.TournamentEntry?.[0]?.count || 0;
          return (entryCount / t.maxEntries!) * 100;
        });
      
      if (rates.length > 0) {
        averageParticipationRate = rates.reduce((a, b) => a + b, 0) / rates.length;
      }
    }

    // Format tournaments for response
    const formattedTournaments = (tournaments || []).map(tournament => ({
      id: tournament.id,
      title: tournament.title || tournament.name || 'Unnamed Tournament',
      type: tournament.buyinRequired ? 'Buy-in' : 'Freeroll',
      startDate: tournament.startDate,
      endDate: tournament.endDate || null,
      location: tournament.location || '신림 잼스 홀덤펍',
      maxEntries: tournament.maxEntries || null,
      buyinRequired: tournament.buyinRequired,
      rebuyAllowed: tournament.rebuyAllowed,
      status: tournament.status,
      participantCount: tournament.TournamentEntry?.[0]?.count || 0,
    }));

    return NextResponse.json({
      tournaments: formattedTournaments,
      pagination: {
        total: totalCount || 0,
        page,
        limit,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
      statistics: {
        upcoming: upcomingCount,
        monthlyCount,
        totalParticipants: totalParticipants || 0,
        averageParticipationRate: Math.round(averageParticipationRate),
      },
    });
  } catch (error) {
    console.error('Admin tournament list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser();
    
    if (!user?.email) {
      return unauthorizedResponse();
    }

    // 관리자 권한 확인
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('User')
      .select('id, role')
      .eq('email', user.email)
      .single();

    if (adminError || !admin || admin.role !== 'ADMIN') {
      return forbiddenResponse();
    }

    const body = await request.json();
    const {
      title,
      name,
      description,
      type,
      startDate,
      endDate,
      location,
      buyinRequired,
      rebuyAllowed,
      maxEntries,
      status
    } = body;

    // 필수 필드 검증
    if (!title || !startDate) {
      return NextResponse.json(
        { error: 'Title and start date are required' },
        { status: 400 }
      );
    }

    // 토너먼트 생성
    const { data: tournament, error: createError } = await supabaseAdmin
      .from('Tournament')
      .insert({
        id: crypto.randomUUID(),
        title,
        name: name || title,
        description: description || '',
        type: type || 'REGULAR',
        startDate,
        endDate: endDate || null,
        location: location || '신림 잼스 홀덤펍',
        buyinRequired: buyinRequired || 1,
        rebuyAllowed: rebuyAllowed !== false,
        maxEntries: maxEntries || null,
        status: status || 'UPCOMING',
        createdBy: admin.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Tournament creation error:', createError);
      return NextResponse.json(
        { error: 'Failed to create tournament' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tournament
    });
  } catch (error) {
    console.error('Tournament creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create tournament' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    // Delete tournament and related entries
    await prisma.tournament.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: 'Tournament deleted successfully',
    });
  } catch (error) {
    console.error('Tournament deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete tournament' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Tournament ID and status are required' },
        { status: 400 }
      );
    }

    // Update tournament status
    const updatedTournament = await prisma.tournament.update({
      where: { id: parseInt(id) },
      data: {
        status: status.toUpperCase(),
      },
    });

    return NextResponse.json({
      success: true,
      tournament: updatedTournament,
    });
  } catch (error) {
    console.error('Tournament update error:', error);
    return NextResponse.json(
      { error: 'Failed to update tournament' },
      { status: 500 }
    );
  }
}