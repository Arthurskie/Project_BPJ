import { apiRequest, localDB } from './baseAPI';

/**
 * Service API untuk Pengajuan & Pelacakan Surat Permohonan.
 * Mendukung mode terhubung ke backend API maupun mode mandiri lokal.
 */
export const submissionAPI = {
  /**
   * Mengirim permohonan surat baru oleh Warga (Guest)
   * @param {Object} data 
   */
  submitLetter: async (data) => {
    try {
      const remoteRes = await apiRequest('/submissions', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (remoteRes) return remoteRes;
    } catch (err) {
      if (err.status && err.status !== 0) throw err;
    }

    // Generator Kode Tracking Unik: SRT-YYYYMMDD-XXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const trackingCode = `SRT-${dateStr}-${randomSeq}`;

    const newSubmission = {
      id: `sub-${Date.now()}`,
      trackingCode,
      nik: data.nik?.trim(),
      nama: data.nama?.trim(),
      jenisSurat: data.jenisSurat || 'Surat Permohonan',
      keperluan: data.keperluan?.trim() || '-',
      alamat: data.alamat?.trim() || '-',
      noHp: data.noHp?.trim() || '-',
      files: data.files || [],
      status: 'pending', // pending, diproses, selesai, ditolak
      notes: 'Permohonan baru diterima di sistem loket online.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const submissions = localDB.getSubmissions();
    submissions.unshift(newSubmission);
    localDB.saveSubmissions(submissions);

    return {
      success: true,
      message: 'Permohonan surat berhasil dikirim!',
      data: {
        id: newSubmission.id,
        trackingCode: newSubmission.trackingCode,
        status: newSubmission.status,
        createdAt: newSubmission.createdAt
      }
    };
  },

  /**
   * Melacak status surat oleh Warga menggunakan kombinasi NIK & Kode Tracking
   * @param {string} nik 
   * @param {string} trackingCode 
   */
  trackStatus: async (nik, trackingCode) => {
    try {
      const query = new URLSearchParams({ nik: nik.trim(), trackingCode: trackingCode.trim() }).toString();
      const remoteRes = await apiRequest(`/submissions/track?${query}`, { method: 'GET' });
      if (remoteRes) return remoteRes;
    } catch (err) {
      if (err.status && err.status !== 0) throw err;
    }

    const submissions = localDB.getSubmissions();
    const cleanNik = nik?.trim();
    const cleanCode = trackingCode?.trim().toUpperCase();

    const found = submissions.find(
      (s) => s.nik === cleanNik && s.trackingCode.toUpperCase() === cleanCode
    );

    if (!found) {
      throw new Error('Permohonan tidak ditemukan. Pastikan 16 digit NIK dan Kode Tracking sudah sesuai.');
    }

    return {
      success: true,
      data: found
    };
  },

  /**
   * Mengambil semua permohonan surat (untuk Dashboard Petugas/Admin)
   */
  getAllSubmissions: async (filter = {}) => {
    try {
      const query = new URLSearchParams(filter).toString();
      const remoteRes = await apiRequest(`/submissions${query ? `?${query}` : ''}`, { method: 'GET' });
      if (remoteRes) return remoteRes;
    } catch {
      // fallback lokal
    }

    let items = localDB.getSubmissions();
    if (filter.status && filter.status !== 'all') {
      items = items.filter((s) => s.status === filter.status);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      items = items.filter(
        (s) =>
          s.nama.toLowerCase().includes(q) ||
          s.nik.includes(q) ||
          s.trackingCode.toLowerCase().includes(q) ||
          s.jenisSurat.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      data: items,
      total: items.length
    };
  },

  /**
   * Memperbarui status permohonan surat (Approve, Reject, Proses)
   */
  updateStatus: async (id, status, notes = '') => {
    try {
      const remoteRes = await apiRequest(`/submissions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes })
      });
      if (remoteRes) return remoteRes;
    } catch (err) {
      if (err.status && err.status !== 0) throw err;
    }

    const submissions = localDB.getSubmissions();
    const index = submissions.findIndex((s) => s.id === id || s.trackingCode === id);

    if (index === -1) {
      throw new Error('Data permohonan tidak ditemukan.');
    }

    submissions[index].status = status;
    if (notes) submissions[index].notes = notes;
    submissions[index].updatedAt = new Date().toISOString();

    localDB.saveSubmissions(submissions);

    return {
      success: true,
      message: `Status berhasil diubah menjadi ${status}.`,
      data: submissions[index]
    };
  }
};

// Aliaskan untuk kemudahan backwards-compatibility
export const submissionService = submissionAPI;
export default submissionAPI;

