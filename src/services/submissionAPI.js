import { apiRequest, localDB } from './baseAPI';
import { auditLogAPI } from './auditLogAPI';

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
      source: 'guest',
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
   * Mengambil satu permohonan spesifik berdasarkan ID atau Tracking Code
   * @param {string} id 
   */
  getSubmissionById: async (id) => {
    try {
      const remoteRes = await apiRequest(`/submissions/${encodeURIComponent(id)}`, { method: 'GET' });
      if (remoteRes) return remoteRes;
    } catch (err) {
      if (err.status && err.status !== 0) throw err;
    }

    const submissions = localDB.getSubmissions();
    const found = submissions.find((s) => s.id === id || s.trackingCode.toUpperCase() === id.toUpperCase());

    if (!found) {
      throw new Error(`Permohonan dengan ID atau nomor tiket "${id}" tidak ditemukan.`);
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
          s.jenisSurat.toLowerCase().includes(q) ||
          (s.nomorSurat && s.nomorSurat.toLowerCase().includes(q))
      );
    }

    return {
      success: true,
      data: items,
      total: items.length
    };
  },

  /**
   * Memperbarui status permohonan surat secara cepat (Approve, Reject, Proses)
   */
  updateStatus: async (id, status, notes = '', adminInfo = {}) => {
    try {
      const remoteRes = await apiRequest(`/submissions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes, ...adminInfo })
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

    if (adminInfo.adminName) {
      submissions[index].verifiedBy = adminInfo.adminName;
      submissions[index].verifiedAt = new Date().toISOString();
    }

    localDB.saveSubmissions(submissions);

    // Catat ke audit log
    await auditLogAPI.logAction({
      adminId: adminInfo.adminId || 'admin',
      adminName: adminInfo.adminName || 'Petugas Loket',
      action: 'update_status',
      targetId: submissions[index].trackingCode,
      targetType: 'submission',
      details: `Mengubah status surat menjadi ${status.toUpperCase()}. Catatan: ${notes || '-'}`
    });

    return {
      success: true,
      message: `Status berhasil diubah menjadi ${status}.`,
      data: submissions[index]
    };
  },

  /**
   * Mode 1: Verifikasi & Penyelesaian Pengajuan Guest oleh Admin
   * Melengkapi data khusus internal (Nomor Surat, Pejabat TTD, Catatan Verifikasi)
   * lalu men-submit status "selesai" atau "ditolak"
   * @param {string} id 
   * @param {Object} data 
   * @param {string} data.status - 'selesai' | 'ditolak'
   * @param {string} [data.nomorSurat]
   * @param {string} [data.pejabatTTD]
   * @param {string} [data.catatanVerifikasi]
   * @param {string} [data.adminId]
   * @param {string} [data.adminName]
   */
  verifyAndComplete: async (id, { nomorSurat, pejabatTTD, catatanVerifikasi, status, adminId, adminName }) => {
    if (status !== 'selesai' && status !== 'ditolak') {
      throw new Error('Status verifikasi hanya boleh "selesai" (disetujui) atau "ditolak".');
    }

    if (status === 'ditolak') {
      if (!catatanVerifikasi || !catatanVerifikasi.trim()) {
        throw new Error('Alasan penolakan wajib diisi untuk permohonan yang ditolak.');
      }
    }

    if (status === 'selesai') {
      if (!nomorSurat || !nomorSurat.trim()) {
        throw new Error('Nomor Surat Resmi wajib diisi sebelum permohonan disetujui / diselesaikan.');
      }
      if (!pejabatTTD || !pejabatTTD.trim()) {
        throw new Error('Pejabat penanda tangan wajib dipilih.');
      }
    }

    try {
      const remoteRes = await apiRequest(`/submissions/${id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ nomorSurat, pejabatTTD, catatanVerifikasi, status, adminId, adminName })
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

    const current = submissions[index];
    const nowIso = new Date().toISOString();

    submissions[index] = {
      ...current,
      status,
      nomorSurat: status === 'selesai' ? nomorSurat.trim() : current.nomorSurat || null,
      pejabatTTD: status === 'selesai' ? pejabatTTD.trim() : current.pejabatTTD || null,
      catatanVerifikasi: catatanVerifikasi?.trim() || '',
      notes: catatanVerifikasi?.trim() || (status === 'selesai' ? 'Permohonan telah disetujui dan surat resmi telah diterbitkan.' : 'Permohonan ditolak oleh petugas verifikator.'),
      verifiedBy: adminName || adminId || 'Admin Verifikator',
      verifiedAt: nowIso,
      updatedAt: nowIso
    };

    localDB.saveSubmissions(submissions);

    // Catat ke Audit Log
    const actionLabel = status === 'selesai' ? 'verify_submission' : 'reject_submission';
    const detailMsg = status === 'selesai'
      ? `Menyetujui permohonan ${current.trackingCode} (${current.jenisSurat}) dengan Nomor Surat: ${nomorSurat}`
      : `Menolak permohonan ${current.trackingCode} (${current.jenisSurat}). Alasan: ${catatanVerifikasi}`;

    await auditLogAPI.logAction({
      adminId: adminId || 'admin-verif',
      adminName: adminName || 'Admin Verifikator',
      action: actionLabel,
      targetId: current.trackingCode,
      targetType: 'submission',
      details: detailMsg
    });

    return {
      success: true,
      message: status === 'selesai' ? 'Permohonan berhasil disetujui dan diterbitkan!' : 'Permohonan berhasil ditolak.',
      data: submissions[index]
    };
  },

  /**
   * Mode 2: Input Langsung (Walk-in / Offline) oleh Admin
   * Admin membuat permohonan surat baru dari dashboard untuk warga yang datang langsung.
   * Otomatis generate Nomor Tiket dan status langsung "diproses" atau "selesai".
   * @param {Object} data 
   */
  createWalkInSubmission: async (data) => {
    // Validasi field wajib
    if (!data.nik || data.nik.trim().length !== 16) {
      throw new Error('NIK pemohon wajib 16 digit angka.');
    }
    if (!data.nama || !data.nama.trim()) {
      throw new Error('Nama lengkap pemohon wajib diisi.');
    }
    if (!data.jenisSurat || !data.jenisSurat.trim()) {
      throw new Error('Jenis surat permohonan wajib dipilih.');
    }

    const status = data.status || 'diproses'; // default walk-in: 'diproses' atau 'selesai'

    if (status === 'selesai') {
      if (!data.nomorSurat || !data.nomorSurat.trim()) {
        throw new Error('Untuk status langsung "Selesai", Nomor Surat Resmi wajib diisi.');
      }
      if (!data.pejabatTTD || !data.pejabatTTD.trim()) {
        throw new Error('Pejabat penanda tangan wajib dipilih.');
      }
    }

    try {
      const remoteRes = await apiRequest('/submissions/walk-in', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (remoteRes) return remoteRes;
    } catch (err) {
      if (err.status && err.status !== 0) throw err;
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const trackingCode = `SRT-${dateStr}-${randomSeq}`;

    const newSubmission = {
      id: `sub-${Date.now()}`,
      trackingCode,
      nik: data.nik.trim(),
      nama: data.nama.trim(),
      jenisSurat: data.jenisSurat.trim(),
      keperluan: data.keperluan?.trim() || '-',
      alamat: data.alamat?.trim() || '-',
      noHp: data.noHp?.trim() || '-',
      source: 'walk-in',
      status,
      nomorSurat: data.nomorSurat?.trim() || null,
      pejabatTTD: data.pejabatTTD?.trim() || null,
      catatanVerifikasi: data.catatanVerifikasi?.trim() || 'Permohonan diterima langsung di loket pelayanan kelurahan (Pelayanan Offline).',
      notes: data.notes?.trim() || (status === 'selesai' ? 'Surat permohonan telah selesai diterbitkan di loket.' : 'Permohonan walk-in sedang diproses petugas loket.'),
      verifiedBy: data.adminName || data.adminId || 'Petugas Loket',
      verifiedAt: now.toISOString(),
      files: data.files || [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const submissions = localDB.getSubmissions();
    submissions.unshift(newSubmission);
    localDB.saveSubmissions(submissions);

    // Catat ke Audit Trail
    await auditLogAPI.logAction({
      adminId: data.adminId || 'admin-loket',
      adminName: data.adminName || 'Petugas Loket',
      action: 'create_walkin',
      targetId: trackingCode,
      targetType: 'submission',
      details: `Membuat pengajuan walk-in langsung: ${newSubmission.jenisSurat} untuk ${newSubmission.nama} (${newSubmission.nik}) dengan status ${status.toUpperCase()}`
    });

    return {
      success: true,
      message: `Permohonan walk-in berhasil dibuat dengan Nomor Tiket ${trackingCode}!`,
      data: newSubmission
    };
  },

  /**
   * Auto-generate Nomor Surat Resmi sesuai format instansi:
   * Format: 470 / [Nomor Urut 3 digit] / [Kode Instansi] / [Bulan Romawi] / [Tahun]
   * Contoh: 470 / 005 / KEL.CKR / XI / 2026
   * @param {string} kodeInstansi 
   */
  generateLetterNumber: async (kodeInstansi = 'KEL.CKR') => {
    try {
      const remoteRes = await apiRequest(`/letters/generate-number?kode=${encodeURIComponent(kodeInstansi)}`, { method: 'GET' });
      if (remoteRes) return remoteRes;
    } catch {
      // fallback lokal
    }

    const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const now = new Date();
    const year = now.getFullYear();
    const month = ROMAN_MONTHS[now.getMonth()];

    const numbers = localDB.getLetterNumbers();
    const thisYearNums = numbers.filter((n) => n.year === year);
    const nextSeq = thisYearNums.length + 1;
    const nomorSurat = `470 / ${String(nextSeq).padStart(3, '0')} / ${kodeInstansi} / ${month} / ${year}`;

    // Simpan ke daftar nomor yang sudah digenerate
    numbers.push({
      id: `ln-${Date.now()}`,
      nomorSurat,
      year,
      seq: nextSeq,
      createdAt: now.toISOString()
    });
    localDB.saveLetterNumbers(numbers);

    return {
      success: true,
      data: {
        nomorSurat,
        seq: nextSeq,
        year,
        month,
        kodeInstansi
      }
    };
  },

  /**
   * Validasi apakah nomor surat sudah pernah dipakai (duplikasi)
   * @param {string} nomorSurat 
   * @param {string} [currentSubmissionId] - abaikan jika nomor dimiliki submission saat ini
   */
  validateLetterNumber: async (nomorSurat, currentSubmissionId = null) => {
    const cleanNomor = nomorSurat?.trim().toLowerCase();
    if (!cleanNomor) return { success: true, isDuplicate: false };

    try {
      const remoteRes = await apiRequest(`/letters/check-number?nomor=${encodeURIComponent(nomorSurat)}`, { method: 'GET' });
      if (remoteRes) return remoteRes;
    } catch {
      // fallback lokal
    }

    const submissions = localDB.getSubmissions();
    const isDuplicate = submissions.some(
      (s) =>
        s.id !== currentSubmissionId &&
        s.nomorSurat &&
        s.nomorSurat.trim().toLowerCase() === cleanNomor
    );

    return {
      success: true,
      isDuplicate
    };
  }
};

// Aliaskan untuk kemudahan backwards-compatibility
export const submissionService = submissionAPI;
export default submissionAPI;
