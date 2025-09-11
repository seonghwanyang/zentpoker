import { createBrowserClient } from '@supabase/ssr';

// Singleton pattern to ensure same client instance
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient;
  }

  // Only create client on browser
  if (typeof window === 'undefined') {
    // Return a mock during SSR
    return null as any;
  }

  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return supabaseClient;
}