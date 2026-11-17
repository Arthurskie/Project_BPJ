import React from 'react';

export default function Settings() {
  return <div className="max-w-4xl space-y-6 text-slate-900 dark:text-white">
    <header><h1 className="text-2xl font-semibold">Pengaturan</h1><p className="mt-2 text-sm text-slate-600 dark:text-neutral-300">Preferensi tampilan dan ketersediaan konfigurasi layanan.</p></header>
    <section aria-labelledby="theme-heading" className="rounded-xl border border-slate-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 id="theme-heading" className="text-base font-semibold">Tema antarmuka</h2><p className="mt-4 text-sm font-medium">Tema terang</p><p className="mt-1 text-sm text-slate-600">Tampilan tetap menggunakan tema terang, tanpa mengikuti pengaturan perangkat.</p>
    </section>
    <section aria-labelledby="service-heading" className="rounded-xl border border-slate-200 p-6 dark:border-neutral-800"><h2 id="service-heading" className="text-base font-semibold">Konfigurasi layanan</h2><dl className="mt-5 space-y-5"><div><dt className="text-sm font-medium">Penomoran surat</dt><dd className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-neutral-300">Nomor dapat dibuat melalui tombol Generate Nomor pada halaman verifikasi atau loket. Pengaturan penomoran otomatis belum tersedia.</dd></div><div><dt className="text-sm font-medium">Notifikasi email</dt><dd className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-neutral-300">Pengiriman notifikasi email belum terhubung. Tidak ada email yang dikirim melalui pengaturan ini.</dd></div></dl></section>
  </div>;
}
