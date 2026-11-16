import React from 'react';
import { useTheme } from '../../contexts/useTheme';

export default function Settings() {
  const { darkMode, toggleDarkMode } = useTheme();
  return <div className="max-w-4xl space-y-6 text-slate-900 dark:text-white">
    <header><h1 className="text-2xl font-semibold">Pengaturan</h1><p className="mt-2 text-sm text-slate-600 dark:text-neutral-300">Preferensi tampilan dan ketersediaan konfigurasi layanan.</p></header>
    <section aria-labelledby="theme-heading" className="rounded-xl border border-slate-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 id="theme-heading" className="text-base font-semibold">Tema antarmuka</h2><div className="mt-4 flex items-center justify-between gap-6"><div><p id="theme-label" className="text-sm font-medium">Mode gelap</p><p id="theme-help" className="mt-1 text-sm text-slate-600 dark:text-neutral-300">Perubahan diterapkan langsung dan disimpan pada browser ini.</p></div><button type="button" role="switch" aria-checked={darkMode} aria-labelledby="theme-label" aria-describedby="theme-help" onClick={toggleDarkMode} className={`relative h-7 w-12 shrink-0 rounded-full ${darkMode ? 'bg-red-700' : 'bg-slate-400'}`}><span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-5' : ''}`} /></button></div>
    </section>
    <section aria-labelledby="service-heading" className="rounded-xl border border-slate-200 p-6 dark:border-neutral-800"><h2 id="service-heading" className="text-base font-semibold">Konfigurasi layanan</h2><dl className="mt-5 space-y-5"><div><dt className="text-sm font-medium">Penomoran surat</dt><dd className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-neutral-300">Nomor dapat dibuat melalui tombol Generate Nomor pada halaman verifikasi atau loket. Pengaturan penomoran otomatis belum tersedia.</dd></div><div><dt className="text-sm font-medium">Notifikasi email</dt><dd className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-neutral-300">Pengiriman notifikasi email belum terhubung. Tidak ada email yang dikirim melalui pengaturan ini.</dd></div></dl></section>
  </div>;
}
