import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Verify that the request has a valid Supabase session.
 * Uses @supabase/ssr createServerClient which correctly handles
 * chunked auth cookies (sb-<id>-auth-token.0, .1, …).
 * Returns the user object if authenticated, null otherwise.
 */
export async function getAuthenticatedUser(req: NextRequest) {
  const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const supabase = createServerClient(
    `https://${projectId}.supabase.co`,
    anonKey,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll() {
          // No-op: API routes only need to read cookies for auth validation
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  return user;
}
