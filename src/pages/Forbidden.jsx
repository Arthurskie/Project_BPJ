import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GarudaLogo, RedWhiteRibbon } from '../components/IndonesiaSeal';
import { ShieldAlert, ArrowLeft, Home, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Forbidden() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 font-sans selection:bg-red-600 selection:text-white">
      <RedWhiteRibbon />

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

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 text-center shadow-sm">
          
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="inline-block text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded mb-2">
            Akses Dibatasi (403)
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Wewenang Tidak Memadai
          </h2>

          <p className="text-xs text-slate-600 dark:text-neutral-400 mt-2 mb-6 leading-relaxed">
            {user ? (
              <>
                Akun Anda saat ini terdaftar dengan hak akses <strong className="font-semibold text-slate-800 dark:text-neutral-200">{user.role}</strong>. Halaman ini memerlukan wewenang lebih tinggi atau izin otorisasi khusus.
              </>
            ) : (
              'Halaman ini diproteksi oleh sistem Role-Based Access Control (RBAC). Anda harus masuk sebagai petugas berwenang untuk mengaksesnya.'
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-800 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>

            {user ? (
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Dashboard Saya</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Petugas</span>
              </Link>
            )}
          </div>

        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-4 text-xs text-slate-500 dark:text-neutral-400 text-center">
        <p className="text-[11px]">Sistem Informasi Pelayanan Surat Terpadu Republik Indonesia</p>
      </footer>
    </div>
  );
}

