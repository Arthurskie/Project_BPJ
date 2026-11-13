/**
 * Base API Client & Persistent Data Layer
 * 
 * Modul ini menangani komunikasi data ke Backend/Database eksternal.
 * Ketika URL backend (VITE_API_BASE_URL) belum dihubungkan, modul ini menyediakan
 * mock engine terintegrasi berbasis LocalStorage sehingga aplikasi dapat berjalan
 * 100% mandiri (Full Client-Side / Standalone) tanpa perlu menjalankan folder server terpisah.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || null;

// Initial Seeds untuk LocalStorage jika belum ada data
const STORAGE_KEYS = {
  USERS: 'bpj_db_users',
  SUBMISSIONS: 'bpj_db_submissions',
  SESSION: 'bpj_auth_session',
  STATS: 'bpj_db_stats'
};

const DEFAULT_USERS = [
  {
    id: 'usr-001',
    name: 'Budi Santoso, S.STP',
    nip: '198503152010011002',
    email: 'admin@kelurahan.go.id',
    password: 'password123', // Demo plaintext for client storage fallback
    role: 'super_admin',
    department: 'Kepala Seksi Pelayanan Umum',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'usr-002',
    name: 'Siti Rahmawati, S.Sos',
    nip: '199208242015022001',
    email: 'verifikator@kelurahan.go.id',
    password: 'password123',
    role: 'verifikator',
    department: 'Petugas Verifikasi Dokumen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    createdAt: '2026-02-15T09:30:00.000Z'
  }
];

const DEFAULT_SUBMISSIONS = [
  {
    id: 'sub-001',
    trackingCode: 'SRT-20261112-001',
    nik: '3201012304950001',
    nama: 'Ahmad Fauzi',
    jenisSurat: 'Surat Keterangan Usaha (SKU)',
    keperluan: 'Pengajuan kredit permodalan usaha mikro BRI',
    alamat: 'Jl. Melati No. 12 RT 03/RW 02',
    noHp: '081234567890',
    status: 'pending', // pending, diproses, selesai, ditolak
    notes: 'Menunggu kelengkapan foto tempat usaha.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'sub-002',
    trackingCode: 'SRT-20261111-042',
    nik: '3201015609880003',
    nama: 'Dewi Lestari',
    jenisSurat: 'Surat Keterangan Domisili',
    keperluan: 'Persyaratan pembukaan rekening bank baru',
    alamat: 'Jl. Mawar No. 45 RT 01/RW 04',
    noHp: '081987654321',
    status: 'diproses',
    notes: 'Dokumen sedang ditandatangani Lurah.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: 'sub-003',
    trackingCode: 'SRT-20261110-019',
    nik: '3201011102900005',
    nama: 'Hendra Gunawan',
    jenisSurat: 'Surat Keterangan Tidak Mampu (SKTM)',
    keperluan: 'Pengajuan beasiswa kuliah perguruan tinggi negeri',
    alamat: 'Kp. Sukamaju RT 04/RW 01',
    noHp: '085211223344',
    status: 'selesai',
    notes: 'Surat telah diterbitkan. Silakan unduh dokumen resmi atau ambil di loket kelurahan.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// Helper database lokal
export const localDB = {
  getUsers: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
        return DEFAULT_USERS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_USERS;
    }
  },

  saveUsers: (users) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getSubmissions: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(DEFAULT_SUBMISSIONS));
        return DEFAULT_SUBMISSIONS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_SUBMISSIONS;
    }
  },

  saveSubmissions: (submissions) => {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  },

  getSession: () => {
    try {
      const session = localStorage.getItem(STORAGE_KEYS.SESSION);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  },

  setSession: (user) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  }
};

/**
 * Universal Request Handler:
 * Jika VITE_API_BASE_URL aktif, kirim request fetch ke API Server/DB.
 * Jika tidak, fallback ke handler lokal.
 */
export async function apiRequest(endpoint, options = {}) {
  if (API_BASE_URL) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { ...(options.headers || {}) };

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      credentials: 'include',
      ...options,
      headers
    };

    const res = await fetch(url, config);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const err = new Error(data?.message || `Permintaan gagal (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  return null;
}

export default apiRequest;

