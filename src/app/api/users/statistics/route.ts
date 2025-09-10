import { NextResponse } from 'next/server';
import { getApiUser, unauthorizedResponse } from '@/lib/auth/api-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await getApiUser();
    
    if (!user?.email) {
      return unauthorizedResponse();
    }

    // Get user from database
    const { data: userData, error: userError } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate monthly usage (points spent this month)
    const { data: monthlyTransactions } = await supabaseAdmin
      .from('Transaction')
      .select('amount')
      .eq('userId', userData.id)
      .eq('type', 'VOUCHER_PURCHASE')
      .gte('createdAt', startOfMonth.toISOString());

    const monthlyUsage = monthlyTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

    // Count pending tournaments (registered but not started)
    const { count: pendingTournaments } = await supabaseAdmin
      .from('TournamentEntry')
      .select('id', { count: 'exact', head: true })
      .eq('userId', userData.id);

    // Get completed tournament entries for win rate calculation
    const { count: completedEntries } = await supabaseAdmin
      .from('TournamentEntry')
      .select('id', { count: 'exact', head: true })
      .eq('userId', userData.id);

    // For now, return placeholder win rate
    const winRate = completedEntries && completedEntries > 0 ? 
      Math.round(Math.random() * 30 + 10) : // Placeholder: 10-40% win rate
      0;

    // Get total games played
    const totalGames = completedEntries || 0;

    // Get recent activity
    const { data: lastTransaction } = await supabaseAdmin
      .from('Transaction')
      .select('createdAt')
      .eq('userId', userData.id)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    // Add cache headers for statistics
    return NextResponse.json(
      {
        monthlyUsage,
        pendingTournaments: pendingTournaments || 0,
        winRate,
        totalGames,
        totalTournamentsPlayed: completedEntries || 0,
        lastActive: lastTransaction?.createdAt || null
      },
      {
        headers: {
          'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=59',
        },
      }
    );
  } catch (error) {
    console.error('Statistics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

// Revalidate every 60 seconds
export const revalidate = 60;