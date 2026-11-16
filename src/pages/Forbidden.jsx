import React from 'react';
import { Link } from 'react-router-dom';
export default function Forbidden() {
  return <main className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 px-6 text-slate-900 dark:text-white">
    <div className="w-full max-w-md">
      <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">403</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Akses tidak diizinkan</h1>
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-neutral-400">Akun Anda tidak memiliki izin untuk membuka halaman ini.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/guest" className="inline-flex min-h-11 items-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white dark:bg-white dark:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-4">Ke beranda</Link>
        <Link to="/login" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 dark:border-neutral-700 px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4">Ganti akun</Link>
      </div>
    </div>
  </main>;
}
