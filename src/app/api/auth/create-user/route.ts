import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, name, image } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'yangseonghwan119@gmail.com';
    const newRole = email === adminEmail ? 'ADMIN' : 'USER';

    // First check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('User')
      .select('id, role')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ 
        user: existingUser,
        created: false 
      });
    }

    // Create new user with service role
    const { data: newUser, error } = await supabaseAdmin
      .from('User')
      .insert({
        id: userId,
        email: email,
        name: name || email.split('@')[0] || 'User',
        role: newRole,
        grade: newRole === 'ADMIN' ? 'ADMIN' : 'GUEST',
        status: 'ACTIVE',
        points: 0,
        image: image || null,
        lastLoginAt: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error creating user:', error);
      return NextResponse.json(
        { error: 'Failed to create user', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      user: newUser,
      created: true 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}