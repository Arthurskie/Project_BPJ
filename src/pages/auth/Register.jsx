import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    nip: '',
    email: '',
    department: 'Seksi Pelayanan Umum',
    role: 'verifikator',
    password: '',
    confirmPassword: '',
    termsAgreed: false
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validasi NIP (18 digit angka)
    if (!/^[0-9]{18}$/.test(formData.nip.trim())) {
      setErrorMsg('NIP wajib terdiri dari 18 digit angka sesuai data BKN.');
      return;
    }

    // Validasi Kata Sandi
    if (formData.password.length < 8) {
      setErrorMsg('Kata sandi minimal 8 karakter.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (!formData.termsAgreed) {
      setErrorMsg('Anda wajib menyetujui Pakta Integritas & Kerahasiaan Data.');
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        name: formData.name,
        nip: formData.nip,
        email: formData.email,
        department: formData.department,
        role: formData.role,
        password: formData.password
      });

      setSuccessMsg(res.message || 'Pendaftaran berhasil. Mengalihkan ke halaman masuk...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memproses pendaftaran. Silakan periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-sm">
        
        {/* Header Form */}
        <div className="mb-6">
          <span className="inline-block text-[11px] font-semibold tracking-wider uppercase text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800 px-2.5 py-1 rounded">
            Registrasi Aparatur
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-2.5">
            Pendaftaran Akun Petugas
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
            Formulir pendaftaran untuk petugas verifikasi dan administrator pelayanan surat kelurahan/desa.
          </p>
        </div>

        {/* Alert Error */}
        {errorMsg && (
          <div className="mb-5 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-2.5 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Alert Success */}
        {successMsg && (
          <div className="mb-5 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-lg flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section: Identitas Kepegawaian */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 pb-1 border-b border-slate-100 dark:border-neutral-800">
              1. Identitas Kepegawaian
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Contoh: Rahmat Hidayat, S.STP"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                  Nomor Induk Pegawai (NIP 18 Digit)
                </label>
                <input
                  type="text"
                  name="nip"
                  required
                  maxLength={18}
                  value={formData.nip}
                  onChange={handleChange}
                  placeholder="198503152010011002"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-lg text-sm font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                  Email Kedinasan Resmi
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama.pegawai@kelurahan.go.id"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                  Unit Kerja / Seksi
                </label>
                <input
                  type="text"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Contoh: Seksi Pelayanan Umum"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section: Wewenang & Keamanan */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 pb-1 border-b border-slate-100 dark:border-neutral-800">
              2. Wewenang & Kredensial
            </h3>
            
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                Peran Pengguna (Role RBAC)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-start gap-3 ${
                  formData.role === 'verifikator'
                    ? 'border-red-600 bg-red-50/50 dark:bg-red-950/20'
                    : 'border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="verifikator"
                    checked={formData.role === 'verifikator'}
                    onChange={handleChange}
                    className="mt-0.5 text-red-700 focus:ring-red-600"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Verifikator Berkas</p>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">Memeriksa kelengkapan syarat administrasi dan validasi permohonan warga.</p>
                  </div>
                </label>

                <label className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-start gap-3 ${
                  formData.role === 'super_admin'
                    ? 'border-red-600 bg-red-50/50 dark:bg-red-950/20'
                    : 'border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="super_admin"
                    checked={formData.role === 'super_admin'}
                    onChange={handleChange}
                    className="mt-0.5 text-red-700 focus:ring-red-600"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Administrator</p>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">Persetujuan akhir, penomoran resmi surat, dan pengelolaan akun.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                  Kata Sandi (Min. 8 Karakter)
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                  Konfirmasi Kata Sandi
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Persetujuan Integritas */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-neutral-400">
              <input
                type="checkbox"
                name="termsAgreed"
                checked={formData.termsAgreed}
                onChange={handleChange}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-red-700 focus:ring-red-600 dark:border-neutral-700 dark:bg-neutral-800"
              />
              <span className="leading-relaxed">
                Saya menyatakan bahwa data yang diisikan adalah benar dan sah sesuai identitas resmi kepegawaian, serta bersedia mematuhi Pakta Integritas dan menjaga kerahasiaan data pribadi pemohon.
              </span>
            </label>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-medium rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Mendaftarkan...</span>
              </>
            ) : (
              <>
                <span>Kirim Permohonan Pendaftaran</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigasi Form */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-neutral-800 text-center text-xs text-slate-600 dark:text-neutral-400">
          Sudah memiliki akun resmi?{' '}
          <Link
            to="/login"
            className="font-semibold text-red-700 dark:text-red-400 hover:underline"
          >
            Masuk ke Akun
          </Link>
        </div>

      </div>
    </div>
  );
}
