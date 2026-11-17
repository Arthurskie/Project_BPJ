import demo from './demo/auditLogAPI';
import { getSupabase, isDemoMode } from './supabaseClient';
function mapLog(row) { return { ...row, adminId: row.actor_id, adminName: row.actor_name, targetId: row.target_id, timestamp: row.created_at, details: typeof row.details === 'string' ? row.details : JSON.stringify(row.details) }; }
async function getAuditLogs(filter = {}) {
  if (isDemoMode) return demo.getAuditLogs(filter);
  let query = getSupabase().from('audit_logs').select('*').order('created_at', { ascending: false }).limit(Math.min(Number(filter.limit) || 200, 500));
  if (filter.adminId && filter.adminId !== 'all') query = query.eq('actor_id', filter.adminId);
  if (filter.action && filter.action !== 'all') query = query.eq('action', filter.action);
  if (filter.targetId) query = query.eq('target_id', filter.targetId);
  const { data, error } = await query;
  if (error) throw new Error('Riwayat aktivitas gagal dimuat.');
  let rows = data.map(mapLog);
  if (filter.search) { const term = filter.search.toLowerCase(); rows = rows.filter(row => [row.adminName,row.action,row.targetId,row.details].some(value => value?.toLowerCase().includes(term))); }
  return { success: true, data: rows, total: rows.length };
}
export const auditLogAPI = {
  getAuditLogs,
  getLogsByTarget: targetId => getAuditLogs({ targetId }),
  logAction: async input => {
    if (isDemoMode) return demo.logAction(input);
    throw new Error('Audit hanya dibuat oleh transaksi server.');
  },
};
export default auditLogAPI;
