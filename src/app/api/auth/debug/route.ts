import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test with service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Test table access
    const { data: testSelect, error: selectError } = await supabaseAdmin
      .from('User')
      .select('id, email, role')
      .limit(1);

    // Test insert capability
    const testId = `test-${Date.now()}`;
    const { data: testInsert, error: insertError } = await supabaseAdmin
      .from('User')
      .insert({
        id: testId,
        email: `test-${Date.now()}@example.com`,
        role: 'USER',
        grade: 'GUEST',
        status: 'ACTIVE',
        points: 0
      })
      .select();

    // Clean up test user if created
    if (testInsert) {
      await supabaseAdmin
        .from('User')
        .delete()
        .eq('id', testId);
    }

    return NextResponse.json({
      success: true,
      canRead: !selectError,
      canWrite: !insertError,
      readError: selectError?.message,
      writeError: insertError?.message,
      tableExists: !!testSelect || !!selectError,
      env: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}