import { createBrowserClient } from '@supabase/ssr';

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  browserClient = createBrowserClient(
    `https://${projectId}.supabase.co`,
    anonKey
  );

  return browserClient;
}
