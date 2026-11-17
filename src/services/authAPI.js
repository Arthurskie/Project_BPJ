import { apiRequest, localDB } from './baseAPI';

/**
 * Service API Autentikasi untuk Petugas & Admin.
 * Bekerja dengan server backend jika VITE_API_BASE_URL diset,
 * atau langsung dengan data store lokal jika berjalan mandiri tanpa server terpisah.
 */
export const authAPI = {
  /**
   * Login Petugas / Verifikator / Administrator
   * @param {string} email 
   * @param {string} password 
   */
  login: async (email, password) => {
    try {
      // 1. Coba via HTTP request jika backend API dikonfigurasi
      const remoteRes = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (remoteRes) {
        localDB.setSession(remoteRes.user);
        return remoteRes;
      }
    } catch (err) {
      // Jika remote gagal karena error kredensial spesifik (401), lempar error
      if (err.status && err.status !== 0) throw err;
    }

    // 2. Fallback ke database lokal
    const users = localDB.getUsers();
    const cleanEmail = email?.trim().toLowerCase();
    const user = users.find(
      (u) => u.email.toLowerCase() === cleanEmail || u.nip === cleanEmail
    );

    if (!user) {
      throw new Error('Akun petugas dengan email atau NIP tersebut tidak ditemukan.');
    }

    if (user.password !== password) {
      throw new Error('Kata sandi yang Anda masukkan salah. Silakan coba lagi.');
    }

    const { password: _, ...safeUser } = user;
    localDB.setSession(safeUser);

    return {
      success: true,
      message: 'Login berhasil.',
      user: safeUser
    };
  },

  /**
   * Registrasi Akun Petugas / Verifikator Baru
   * @param {Object} data 
   */
  register: async ({ name, nip, email, password, role = 'verifikator', department = 'Petugas Loket Pelayanan' }) => {
    try {
      const remoteRes = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, nip, email, password, role, department })
      });
      if (remoteRes) return remoteRes;
    } catch (err) {
      if (err.status && err.status !== 0) throw err;
    }

    // Fallback lokal
    const users = localDB.getUsers();
    const cleanEmail = email?.trim().toLowerCase();
    const cleanNip = nip?.trim();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('Email kedinasan ini sudah terdaftar dalam sistem.');
    }

    if (users.some((u) => u.nip === cleanNip)) {
      throw new Error('NIP pegawai ini sudah terdaftar dalam sistem.');
    }

    const newUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      nip: cleanNip,
      email: cleanEmail,
      password,
      role,
      department: department.trim(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localDB.saveUsers(users);

    return {
      success: true,
      message: 'Pendaftaran akun petugas berhasil. Silakan masuk menggunakan kredensial Anda.'
    };
  },

  /**
   * Permohonan Reset Kata Sandi (Lupa Sandi)
   * @param {string} email 
   */
  forgotPassword: async (email) => {
    try {
      const remoteRes = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      if (remoteRes) return remoteRes;
    } catch (err) {
      if (err.status && err.status !== 0) throw err;
    }

    const users = localDB.getUsers();
    const cleanEmail = email?.trim().toLowerCase();
    const user = users.find(
      (u) => u.email.toLowerCase() === cleanEmail || u.nip === cleanEmail
    );

    if (!user) {
      throw new Error('Email atau NIP kedinasan tidak terdaftar.');
    }

    throw new Error('Demo tidak mengirim email reset. Gunakan akun demo atau hubungi pengelola presentasi.');
  },

  /**
   * Mengambil sesi login petugas saat ini
   */
  getMe: async () => {
    try {
      const remoteRes = await apiRequest('/auth/me', { method: 'GET' });
      if (remoteRes) return remoteRes;
    } catch {
      // Abaikan error jaringan
    }

    const sessionUser = localDB.getSession();
    if (!sessionUser) {
      throw new Error('Sesi tidak ditemukan atau telah berakhir.');
    }

    return {
      success: true,
      user: sessionUser
    };
  },

  /**
   * Keluar dari sesi login (Logout)
   */
  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Lanjutkan logout lokal
    }
    localDB.setSession(null);
    return { success: true, message: 'Berhasil keluar.' };
  }
};

export default authAPI;

