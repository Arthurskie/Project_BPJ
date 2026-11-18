import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Mohon masukkan email kedinasan Anda.');
      return;
    }

    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setSuccessMsg(res.message || 'Tautan pemulihan kata sandi telah dikirimkan ke email terdaftar.');
      setIsSent(true);
      setResendTimer(60);

      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Permintaan belum dapat diproses. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-sm">
        
        {/* Header Form */}
        <div className="mb-6">
          <span className="inline-block text-[11px] font-semibold tracking-wider uppercase text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800 px-2.5 py-1 rounded">
            Pemulihan Akses
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-2.5">
            Lupa Kata Sandi
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
            Masukkan email kedinasan terdaftar untuk menerima instruksi pengaturan ulang kata sandi.
          </p>
        </div>

        {/* Alert Error */}
        {errorMsg && (
          <div className="mb-5 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-2.5 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {isSent ? (
          /* Tampilan Konfirmasi Sukses */
          <div className="space-y-5">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-lg flex items-start gap-3 text-emerald-800 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Permintaan Diterima</p>
                <p className="mt-1 leading-relaxed text-slate-600 dark:text-neutral-300">{successMsg}</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
              Silakan periksa kotak masuk atau folder spam email kedinasan Anda. Gunakan tautan terbaru sebelum masa berlakunya berakhir.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                disabled={resendTimer > 0 || loading}
                onClick={handleSubmit}
                className="w-full sm:w-auto flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{resendTimer > 0 ? `Kirim Ulang (${resendTimer}d)` : 'Kirim Ulang'}</span>
              </button>

              <Link
                to="/login"
                className="w-full sm:w-auto flex-1 py-2 px-3 bg-red-700 hover:bg-red-800 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Halaman Masuk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* Form Input */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                email Kedinasan
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: nama@kelurahan.go.id"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-medium rounded-lg text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <span>Kirim Tautan Pemulihan</span>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Halaman Masuk</span>
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
