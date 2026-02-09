import { createClient } from '@supabase/supabase-js';

let serverClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseServerClient() {
  if (serverClient) return serverClient;

  const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  serverClient = createClient(
    `https://${projectId}.supabase.co`,
    serviceRoleKey
  );

  return serverClient;
}
