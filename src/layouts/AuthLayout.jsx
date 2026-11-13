import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { GarudaLogo, RedWhiteRibbon } from '../components/IndonesiaSeal';
import { ArrowLeft, Lock } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 font-sans selection:bg-red-600 selection:text-white">
      {/* Pita Kenegaraan */}
      <RedWhiteRibbon />

      {/* Header Resmi Instansi */}
      <header className="border-b border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/guest" className="flex items-center gap-3 group">
            <GarudaLogo className="w-8 h-8 sm:w-9 sm:h-9" />
            <div className="border-l border-slate-200 dark:border-neutral-700 pl-3">
              <p className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-neutral-400 uppercase leading-none">
                Republik Indonesia
              </p>
              <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white tracking-tight mt-0.5">
                Sistem Administrasi Pelayanan Surat
              </h1>
            </div>
          </Link>

          <Link
            to="/guest"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white px-3 py-1.5 rounded-md border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Portal Warga</span>
          </Link>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          <Outlet />
        </div>
      </main>

      {/* Footer Resmi */}
      <footer className="border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-6 text-xs text-slate-500 dark:text-neutral-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Koneksi Aman Terenkripsi TLS 1.3 & Proteksi Data Pegawai</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 dark:text-neutral-400 text-[11px]">
            <span>Pemerintah Republik Indonesia</span>
            <span>•</span>
            <span>Kementerian Dalam Negeri</span>
            <span>•</span>
            <span>Bantuan IT: helpdesk@kemendagri.go.id</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
