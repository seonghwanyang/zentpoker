import { NextRequest, NextResponse } from 'next/server';
import { getApiUser, unauthorizedResponse } from '@/lib/auth/api-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser();
    
    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // 성능 최적화: 필요한 필드만 선택하고 JOIN 대신 별도 쿼리 사용
    let query = supabaseAdmin
      .from('Tournament')
      .select('*')
      .order('startDate', { ascending: false });

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    const { data: tournaments, error } = await query;

    if (error) {
      console.error('Tournament fetch error:', error);
      throw error;
    }

    // 성능 최적화: 필요한 경우에만 참가자 수 조회
    let formattedTournaments = [];
    
    if (tournaments && tournaments.length > 0) {
      // 모든 토너먼트의 참가자 수를 한 번에 조회 (N+1 쿼리 방지)
      const tournamentIds = tournaments.map(t => t.id);
      const { data: entryCounts } = await supabaseAdmin
        .from('TournamentEntry')
        .select('tournamentId')
        .in('tournamentId', tournamentIds);
      
      // 토너먼트별 참가자 수 계산
      const participantCountMap = new Map();
      tournamentIds.forEach(id => participantCountMap.set(id, 0));
      entryCounts?.forEach(entry => {
        const count = participantCountMap.get(entry.tournamentId) || 0;
        participantCountMap.set(entry.tournamentId, count + 1);
      });

      // Format tournaments for response
      formattedTournaments = tournaments.map(tournament => ({
        id: tournament.id,
        name: tournament.name || tournament.title || 'Unnamed Tournament',
        title: tournament.title || tournament.name || 'Unnamed Tournament',
        description: tournament.description || '',
        startDate: tournament.startDate,
        endDate: tournament.endDate || null,
        maxEntries: tournament.maxEntries || null,
        buyinRequired: tournament.buyinRequired || 1,
        rebuyAllowed: tournament.rebuyAllowed !== false,
        status: tournament.status || 'UPCOMING',
        participantCount: participantCountMap.get(tournament.id) || 0,
        location: tournament.location || '신림 잼스 홀덤펍',
        type: tournament.type || 'REGULAR',
        currentPlayers: participantCountMap.get(tournament.id) || 0,
        maxPlayers: tournament.maxEntries || 100
      }));
    }

    return NextResponse.json({
      tournaments: formattedTournaments,
      total: formattedTournaments.length,
    });
  } catch (error) {
    console.error('Tournament list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    );
  }
}