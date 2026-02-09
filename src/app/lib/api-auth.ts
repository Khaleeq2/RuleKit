import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Verify that the request has a valid Supabase session.
 * Reads the auth token from cookies and validates it server-side.
 * Returns the user object if authenticated, null otherwise.
 */
export async function getAuthenticatedUser(req: NextRequest) {
  const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Find the Supabase auth cookie
  let accessToken: string | null = null;

  for (const [name, cookie] of req.cookies) {
    if (name.startsWith(`sb-${projectId}-auth-token`)) {
      try {
        // The cookie may be a JSON-encoded array: [access_token, refresh_token]
        // or in newer versions a base64 encoded JSON object
        const parsed = JSON.parse(cookie.value);
        if (Array.isArray(parsed)) {
          accessToken = parsed[0];
        } else if (parsed.access_token) {
          accessToken = parsed.access_token;
        }
      } catch {
        // Cookie value might be the raw token itself
        accessToken = cookie.value;
      }
      break;
    }
  }

  if (!accessToken) return null;

  // Validate the token by calling Supabase
  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    anonKey,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  return user;
}
