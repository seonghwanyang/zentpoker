import { NextResponse } from 'next/server';
import { getApiUser, unauthorizedResponse } from '@/lib/auth/api-auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await getApiUser();
    
    if (!user?.email) {
      return unauthorizedResponse();
    }

    const { data: userData, error } = await supabaseAdmin
      .from('User')
      .select('points')
      .eq('email', user.email)
      .single();

    if (error || !userData) {
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Add cache headers for better performance
    return NextResponse.json(
      { balance: userData.points || 0 },
      {
        headers: {
          'Cache-Control': 'private, s-maxage=10, stale-while-revalidate=59',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add revalidation for Next.js caching
export const revalidate = 10; // Revalidate every 10 seconds
