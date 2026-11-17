import { createClient } from '@supabase/supabase-js';
export const isDemoMode = import.meta.env.VITE_APP_MODE === 'demo';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = !isDemoMode && url && key ? createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
}) : null;
export function getSupabase() {
  if (!supabase) throw new Error('Konfigurasi Supabase belum tersedia. Hubungi administrator.');
  return supabase;
}
export async function staffAction(action, payload = {}) {
  const { data, error } = await getSupabase().rpc('bpj_staff_action', { p_action: action, p_payload: payload });
  if (error) throw new Error('Operasi tidak dapat diselesaikan. Periksa akses dan konfigurasi server.');
  if (data?.success === false) throw new Error(data.message || 'Operasi ditolak server.');
  return data?.success === true ? data : { success: true, data };
}
export async function guestAction(action, payload) {
  const { data, error } = await getSupabase().functions.invoke('bpj-guest', { body: { action, payload } });
  if (error || data?.success === false) throw new Error('Permintaan tidak dapat diselesaikan. Periksa data atau coba kembali nanti.');
  return data?.success === true ? data : { success: true, data };
}
