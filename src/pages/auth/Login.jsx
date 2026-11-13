import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Jika ada path asal dari ProtectedRoute (misal /admin/submissions), gunakan itu.
  // Jika tidak ada atau berasal dari root/guest, arahkan langsung ke Dashboard Admin (/admin).
  const fromPath = location.state?.from?.pathname;
  const redirectTarget = fromPath && fromPath !== '/' && fromPath !== '/guest' ? fromPath : '/admin';

  // Jika user sudah memiliki sesi login aktif, langsung arahkan ke Dashboard Admin
  useEffect(() => {
    if (user) {
      navigate(redirectTarget, { replace: true });
    }
  }, [user, navigate, redirectTarget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Mohon lengkapi NIP/email dan kata sandi Anda.');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Kredensial yang dimasukkan tidak cocok. Silakan periksa kembali.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredential = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-sm">
        
        {/* Header Form */}
        <div className="mb-6">
          <span className="inline-block text-[11px] font-semibold tracking-wider uppercase text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800 px-2.5 py-1 rounded">
            Akses Petugas & Administrator
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-2.5">
            Masuk ke Sistem
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
            Gunakan NIP atau email kedinasan terdaftar untuk mengelola permohonan surat warga.
          </p>
        </div>

        {/* Alert Error */}
        {errorMsg && (
          <div className="mb-5 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-2.5 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
              NIP atau Email Kedinasan
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Contoh: 19850315... atau nama@kelurahan.go.id"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300">
                Kata Sandi
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:underline font-medium"
              >
                Lupa sandi?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 pr-10 py-2.5 bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-neutral-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-red-700 focus:ring-red-600 dark:border-neutral-700 dark:bg-neutral-800"
              />
              <span>Ingat saya di perangkat ini</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-medium rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigasi Form */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-neutral-800 text-center text-xs text-slate-600 dark:text-neutral-400">
          Belum memiliki akun petugas?{' '}
          <Link
            to="/register"
            className="font-semibold text-red-700 dark:text-red-400 hover:underline"
          >
            Daftar Petugas Baru
          </Link>
        </div>

        {/* Bantuan Pengujian Cepat (Minimalist & Discreet) */}
        <div className="mt-4 pt-3 border-t border-dashed border-slate-200 dark:border-neutral-800 text-[11px] text-slate-500 dark:text-neutral-500 flex items-center justify-between">
          <span>Akun Uji Coba:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fillCredential('admin@kelurahan.go.id', 'password123')}
              className="text-slate-600 dark:text-neutral-400 hover:text-red-700 dark:hover:text-red-400 font-medium underline"
            >
              Admin
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => fillCredential('verifikator@kelurahan.go.id', 'password123')}
              className="text-slate-600 dark:text-neutral-400 hover:text-red-700 dark:hover:text-red-400 font-medium underline"
            >
              Verifikator
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
