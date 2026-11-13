import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GarudaLogo, RedWhiteRibbon } from '../components/IndonesiaSeal';
import { ArrowLeft, Home, Search, FileText, Lock, LifeBuoy } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 font-sans selection:bg-red-600 selection:text-white">
      {/* Pita Kenegaraan */}
      <RedWhiteRibbon />

      {/* Header Sederhana */}
      <header className="border-b border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/guest" className="flex items-center gap-3">
            <GarudaLogo className="w-8 h-8" />
            <div className="border-l border-slate-200 dark:border-neutral-700 pl-3">
              <p className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-neutral-400 uppercase leading-none">
                Republik Indonesia
              </p>
              <h1 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight mt-0.5">
                Portal Pelayanan Surat Terpadu
              </h1>
            </div>
          </Link>

          <Link
            to="/guest"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white px-3 py-1.5 rounded-md border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Beranda Warga
          </Link>
        </div>
      </header>

      {/* Konten Utama 404 */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-xl w-full text-center">
          
          {/* Badge & Kode Status */}
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-3 py-1 rounded-full mb-4">
            KESALAHAN 404
          </div>

          <h1 className="text-6xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
            404
          </h1>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-2 mb-3">
            Halaman Tidak Ditemukan
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed mb-8">
            Alamat tautan yang Anda tuju mungkin telah dipindahkan, tidak lagi tersedia, atau terdapat kesalahan pengetikan pada URL peramban Anda.
          </p>

          {/* Tombol Aksi Utama */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-800 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Sebelumnya</span>
            </button>

            <Link
              to="/guest"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Buka Beranda Warga</span>
            </Link>
          </div>

          {/* Pilihan Navigasi Cepat */}
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-5 text-left shadow-xs">
            <p className="text-[11px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
              Tautan Layanan yang Sering Dikunjungi:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                to="/guest/track"
                className="p-3 rounded-lg border border-slate-100 dark:border-neutral-800 hover:border-red-600 dark:hover:border-red-500/50 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors group"
              >
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-xs mb-1">
                  <Search className="w-3.5 h-3.5 text-red-700 dark:text-red-400" />
                  <span>Cek Status Surat</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-tight">
                  Lacak permohonan dengan NIK & kode tracking.
                </p>
              </Link>

              <Link
                to="/guest/submit"
                className="p-3 rounded-lg border border-slate-100 dark:border-neutral-800 hover:border-red-600 dark:hover:border-red-500/50 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors group"
              >
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-xs mb-1">
                  <FileText className="w-3.5 h-3.5 text-red-700 dark:text-red-400" />
                  <span>Pengajuan Surat</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-tight">
                  Formulir permohonan surat online warga.
                </p>
              </Link>

              <Link
                to="/login"
                className="p-3 rounded-lg border border-slate-100 dark:border-neutral-800 hover:border-red-600 dark:hover:border-red-500/50 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors group"
              >
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-xs mb-1">
                  <Lock className="w-3.5 h-3.5 text-red-700 dark:text-red-400" />
                  <span>Portal Petugas</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-tight">
                  Masuk ke dashboard verifikasi data.
                </p>
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Resmi */}
      <footer className="border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-4 text-xs text-slate-500 dark:text-neutral-400 text-center">
        <div className="flex items-center justify-center gap-2 text-[11px]">
          <LifeBuoy className="w-3.5 h-3.5 text-slate-400" />
          <span>Butuh bantuan lebih lanjut? Hubungi Pusat Pengaduan Warga di (021) 1500-xxx</span>
        </div>
      </footer>
    </div>
  );
}

