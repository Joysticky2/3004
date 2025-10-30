import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

// Build a Supabase client for route handlers.
// - If a Bearer token is provided, build a plain supabase-js client that uses it.
// - Otherwise, fall back to auth-helpers (reads session cookies).
export function createSupabaseServer(authHeader?: string) {
  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice('bearer '.length);
    // Plain client with Authorization header (works with RLS)
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    );
  }

  // No token? Use cookies via auth-helpers (requires auth cookies to exist)
  return createRouteHandlerClient({ cookies });
}
