import demo from './demo/dashboardAPI';
import auditLogAPI from './auditLogAPI';
import { getSupabase, isDemoMode } from './supabaseClient';
export const dashboardAPI = {
  async getStats() {
    if (isDemoMode) return demo.getStats();
    const { data, error } = await getSupabase().rpc('bpj_dashboard');
    if (error) throw new Error('Statistik gagal dimuat.');
    const row = data.data;
    return { success: true, data: { totalSubmissions: row.total, pendingSubmissions: row.pending,
      processingSubmissions: row.diproses, completedSubmissions: row.selesai, rejectedSubmissions: row.ditolak,
      averageProcessHours: null, satisfactionRate: 'Belum diukur' } };
  },
  async getRecentActivity() {
    if (isDemoMode) return demo.getRecentActivity();
    const result = await auditLogAPI.getAuditLogs({ limit: 5 });
    return { success: true, data: result.data.map(row => ({ id: row.id, title: `${row.action} · ${row.adminName}`, description: row.details, time: new Date(row.timestamp).toLocaleString('id-ID'), type: row.action })) };
  },
};
export default dashboardAPI;

