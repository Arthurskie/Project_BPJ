import { apiRequest, localDB } from './baseAPI';

/**
 * Service API untuk Pencatatan dan Penelusuran Jejak Audit (Audit Trail / Activity Log).
 * Menyimpan riwayat setiap tindakan admin/petugas untuk akuntabilitas sistem.
 */
export const auditLogAPI = {
  /**
   * Mencatat aksi admin/petugas ke dalam audit log
   * @param {Object} param0 
   * @param {string} param0.adminId - ID unik admin pelaksana
   * @param {string} param0.adminName - Nama lengkap admin
   * @param {string} param0.action - Kode aksi (verify_submission, reject_submission, create_walkin, update_status, generate_letter)
   * @param {string} param0.targetId - ID target (misal id permohonan atau kode tracking)
   * @param {string} [param0.targetType='submission'] - Tipe entitas target ('submission', 'letter', 'user')
   * @param {string} param0.details - Keterangan rinci tindakan
   */
  logAction: async ({ adminId, adminName, action, targetId, targetType = 'submission', details }) => {
    const entry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      adminId: adminId || 'sys-admin',
      adminName: adminName || 'Petugas Sistem',
      action,
      targetId,
      targetType,
      details: details || '-',
      timestamp: new Date().toISOString()
    };

    try {
      const remoteRes = await apiRequest('/audit-logs', {
        method: 'POST',
        body: JSON.stringify(entry)
      });
      if (remoteRes) return remoteRes;
    } catch {
      // fallback ke lokal
    }

    const logs = localDB.getAuditLogs();
    logs.unshift(entry);
    localDB.saveAuditLogs(logs);

    return {
      success: true,
      message: 'Aktivitas berhasil dicatat dalam audit trail.',
      data: entry
    };
  },

  /**
   * Mengambil riwayat audit log dengan opsi filter dan pencarian
   * @param {Object} filter 
   * @param {string} [filter.adminId]
   * @param {string} [filter.action]
   * @param {string} [filter.search]
   * @param {number} [filter.limit]
   */
  getAuditLogs: async (filter = {}) => {
    try {
      const query = new URLSearchParams(filter).toString();
      const remoteRes = await apiRequest(`/audit-logs${query ? `?${query}` : ''}`, { method: 'GET' });
      if (remoteRes) return remoteRes;
    } catch {
      // fallback ke lokal
    }

    let logs = localDB.getAuditLogs();

    if (filter.adminId && filter.adminId !== 'all') {
      logs = logs.filter((l) => l.adminId === filter.adminId);
    }

    if (filter.action && filter.action !== 'all') {
      logs = logs.filter((l) => l.action === filter.action);
    }

    if (filter.search) {
      const q = filter.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.adminName?.toLowerCase().includes(q) ||
          l.details?.toLowerCase().includes(q) ||
          l.targetId?.toLowerCase().includes(q) ||
          l.action?.toLowerCase().includes(q)
      );
    }

    if (filter.limit && filter.limit > 0) {
      logs = logs.slice(0, filter.limit);
    }

    return {
      success: true,
      data: logs,
      total: logs.length
    };
  },

  /**
   * Mengambil riwayat log spesifik untuk satu target (misal satu permohonan surat)
   * @param {string} targetId 
   */
  getLogsByTarget: async (targetId) => {
    try {
      const remoteRes = await apiRequest(`/audit-logs/target/${encodeURIComponent(targetId)}`, { method: 'GET' });
      if (remoteRes) return remoteRes;
    } catch {
      // fallback ke lokal
    }

    const logs = localDB.getAuditLogs();
    const filtered = logs.filter((l) => l.targetId === targetId);

    return {
      success: true,
      data: filtered,
      total: filtered.length
    };
  }
};

export default auditLogAPI;
