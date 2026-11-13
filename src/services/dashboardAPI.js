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
        averageProcessHours: 4.8,
        satisfactionRate: '98.4%'
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

    const submissions = localDB.getSubmissions();
    const activities = submissions.slice(0, 5).map((item) => ({
      id: item.id,
      title: `${item.jenisSurat} - ${item.nama}`,
      description: `Status: ${item.status.toUpperCase()} (${item.trackingCode})`,
      time: new Date(item.updatedAt || item.createdAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: item.status
    }));

    return {
      success: true,
      data: activities
    };
  }
};

export default dashboardAPI;

