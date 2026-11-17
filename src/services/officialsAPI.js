import { OFFICIALS } from '../domain/officials';
import { getSupabase, isDemoMode } from './supabaseClient';
export default {
  async getActive() {
    if (isDemoMode) return OFFICIALS;
    const { data, error } = await getSupabase().from('officials').select('id,name,nip,role,active').eq('active', true).order('name');
    if (error) throw new Error('Daftar pejabat gagal dimuat.');
    return data;
  },
};
