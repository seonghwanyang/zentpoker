import { createClient } from '@supabase/supabase-js'

// Service role client - RLS를 우회하여 모든 데이터에 접근 가능
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// 주의: 이 클라이언트는 서버 사이드에서만 사용해야 함
// 절대 클라이언트 사이드에 노출하지 말 것