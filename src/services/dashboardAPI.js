import { apiRequest, localDB } from './baseAPI';

/**
 * Service API untuk Data Metrik dan Statistik Dashboard Admin.
 */
export const dashboardAPI = {
  /**
   * Mengambil statistik ringkasan permohonan surat
   */
  getStats: async () => {
    try {
      const remoteRes = await apiRequest('/dashboard/stats', { method: 'GET' });
      if (remoteRes) return remoteRes;
    } catch {
      // fallback
    }

    const submissions = localDB.getSubmissions();
    const total = submissions.length;
    const pending = submissions.filter((s) => s.status === 'pending').length;
    const diproses = submissions.filter((s) => s.status === 'diproses').length;
    const selesai = submissions.filter((s) => s.status === 'selesai').length;
    const ditolak = submissions.filter((s) => s.status === 'ditolak').length;

    return {
      success: true,
      data: {
        totalSubmissions: total,
        pendingSubmissions: pending,
        processingSubmissions: diproses,
        completedSubmissions: selesai,
        rejectedSubmissions: ditolak,
        averageProcessHours: (() => { const issued = submissions.filter(row => row.status === 'selesai' && row.verifiedAt && row.createdAt); return issued.length ? Math.round(issued.reduce((sum,row) => sum + Math.max(0,new Date(row.verifiedAt)-new Date(row.createdAt))/3600000,0)/issued.length*10)/10 : null; })(),
        satisfactionRate: 'Belum diukur'
      }
    };
  },

  /**
   * Mengambil log aktivitas terbaru sistem
   */
  getRecentActivity: async () => {
    try {
      const remoteRes = await apiRequest('/dashboard/activity', { method: 'GET' });
      if (remoteRes) return remoteRes;
    } catch {
      // fallback
    }

    const activities = [...localDB.getAuditLogs()].sort((a,b) => b.timestamp.localeCompare(a.timestamp)).slice(0,5).map(item => ({
      id:item.id, title:item.action + ' · ' + item.adminName,
      description:item.details, time:new Date(item.timestamp).toLocaleString('id-ID'), type:item.action
    }));

    return {
      success: true,
      data: activities
    };
  }
};

export default dashboardAPI;

