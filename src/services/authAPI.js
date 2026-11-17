import demoAuthAPI from './demo/authAPI';
import { getSupabase, isDemoMode } from './supabaseClient';

async function staffUser(session) {
  if (!session?.user) throw new Error('Sesi tidak ditemukan atau telah berakhir.');
  const { data, error } = await getSupabase().rpc('bpj_my_profile');
  if (error) throw error;
  const profile = Array.isArray(data) ? data[0] : data;
  if (!profile?.is_active || !['super_admin', 'verifikator', 'petugas'].includes(profile.role)) {
    throw new Error('Akun petugas tidak aktif atau belum diberi akses oleh administrator.');
  }
  return { ...profile, email: session.user.email };
}

const liveAuthAPI = {
  async login(email, password) {
    const client = getSupabase();
    const { data, error } = await client.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) throw error;
    try { return { success: true, user: await staffUser(data.session) }; }
    catch (error) { await client.auth.signOut(); throw error; }
  },
  async register() { throw new Error('Pendaftaran mandiri tidak tersedia. Hubungi administrator untuk undangan akun petugas.'); },
  async forgotPassword(email) {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/forgot-password?mode=recovery`
    });
    if (error) throw error;
    return { success: true, message: 'Jika email terdaftar, tautan pemulihan akan dikirim. Periksa kotak masuk dan spam.' };
  },
  async updatePassword(password) {
    const { data: sessionData, error: sessionError } = await getSupabase().auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData.session) throw new Error('Tautan tidak valid atau sudah kedaluwarsa. Minta tautan baru.');
    const { error } = await getSupabase().auth.updateUser({ password });
    if (error) throw error;
    return { success: true };
  },
  async getMe() {
    const { data, error } = await getSupabase().auth.getSession();
    if (error) throw error;
    return { success: true, user: await staffUser(data.session) };
  },
  async logout() {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
    return { success: true };
  },
  onAuthStateChange(callback) {
    const { data } = getSupabase().auth.onAuthStateChange((event) => callback(event));
    return () => data.subscription.unsubscribe();
  }
};

export const authAPI = isDemoMode ? {
  ...demoAuthAPI,
  updatePassword: async () => { throw new Error('Pemulihan kata sandi tidak tersedia dalam mode demo.'); },
  onAuthStateChange: () => () => {}
} : liveAuthAPI;
export default authAPI;


