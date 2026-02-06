import { createClient } from '@supabase/supabase-js';

const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || '';
const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || ''}`,
  };
}
