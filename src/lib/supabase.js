import { createClient } from '@supabase/supabase-js';
const env = import.meta.env || {};
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
export const supabaseConfigured = Boolean(url && key);
export const supabase = supabaseConfigured ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
export function getSupabase() {
  if (!supabase) throw Object.assign(new Error('Layanan belum dikonfigurasi. Hubungi administrator.'), {code:'NOT_CONFIGURED'});
  return supabase;
}
