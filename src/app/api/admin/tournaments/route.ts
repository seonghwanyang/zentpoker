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

    // Build where clause
    const whereClause: any = {};
    if (status) {
      whereClause.status = status.toUpperCase();
    }

    // Fetch tournaments with pagination
    const [tournaments, totalCount] = await Promise.all([
      prisma.tournament.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              entries: true,
            },
          },
        },
        orderBy: {
          startDate: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.tournament.count({ where: whereClause }),
    ]);

    // Get statistics
    const [upcomingCount, monthlyCount, totalParticipants, allTournamentsForAvg] = await Promise.all([
      // Upcoming tournaments
      prisma.tournament.count({
        where: {
          status: 'UPCOMING',
          startDate: {
            gte: now,
          },
        },
      }),
      // Monthly tournaments
      prisma.tournament.count({
        where: {
          startDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      // Total participants across all tournaments
      prisma.tournamentEntry.count(),
      // Get all tournaments with entry counts for average calculation
      prisma.tournament.findMany({
        select: {
          maxEntries: true,
          _count: {
            select: {
              entries: true,
            },
          },
        },
        where: {
          status: {
            in: ['COMPLETED', 'IN_PROGRESS'],
          },
        },
      }),
    ]);

    // Calculate average participation rate
    let averageParticipationRate = 0;
    if (allTournamentsForAvg.length > 0) {
      const rates = allTournamentsForAvg
        .filter(t => t.maxEntries && t.maxEntries > 0)
        .map(t => (t._count.entries / t.maxEntries!) * 100);
      
      if (rates.length > 0) {
        averageParticipationRate = rates.reduce((a, b) => a + b, 0) / rates.length;
      }
    }

    // Format tournaments for response
    const formattedTournaments = tournaments.map(tournament => ({
      id: tournament.id,
      title: tournament.title || tournament.name || 'Unnamed Tournament',
      type: tournament.buyinRequired ? 'Buy-in' : 'Freeroll',
      startDate: tournament.startDate.toISOString(),
      endDate: tournament.endDate?.toISOString() || null,
      location: (tournament as any).location || '신림 잼스 홀덤펍',
      maxEntries: tournament.maxEntries || null,
      buyinRequired: tournament.buyinRequired,
      rebuyAllowed: tournament.rebuyAllowed,
      status: tournament.status,
      participantCount: tournament._count.entries,
    }));

    return NextResponse.json({
      tournaments: formattedTournaments,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      statistics: {
        upcoming: upcomingCount,
        monthlyCount,
        totalParticipants,
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