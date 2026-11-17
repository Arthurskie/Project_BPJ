import React from 'react';
import { useAuth } from '../../contexts/useAuth';

export default function Profile() {
  const { user } = useAuth();
  const fields = [['Nama pegawai', user?.name], ['NIP', user?.nip], ['Email', user?.email], ['Unit kerja / jabatan', user?.department], ['Peran', user?.role === 'super_admin' ? 'Administrator' : user?.role === 'verifikator' ? 'Verifikator' : user?.role]];
  return <div className="max-w-4xl space-y-6 text-slate-900 dark:text-white">
    <header><h1 className="text-2xl font-semibold">Profil Pegawai</h1><p className="mt-2 text-sm text-slate-600 dark:text-neutral-300">Informasi akun yang sedang digunakan.</p></header>
    <section aria-labelledby="profile-details" className="rounded-xl border border-slate-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 id="profile-details" className="mb-5 text-base font-semibold">Data akun</h2>
      <dl className="grid gap-6 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label}><dt className="text-sm text-slate-600 dark:text-neutral-400">{label}</dt><dd className="mt-1 break-words text-sm font-medium">{value || 'Belum diisi'}</dd></div>)}</dl>
    </section>
    <section aria-labelledby="account-changes" className="rounded-xl border border-slate-200 p-6 dark:border-neutral-800"><h2 id="account-changes" className="text-base font-semibold">Perubahan profil dan kata sandi</h2><p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-neutral-300">Perubahan profil dan kata sandi belum tersedia pada aplikasi ini. Data ditampilkan hanya untuk dibaca. Hubungi pengelola sistem jika informasi akun perlu diperbarui.</p></section>
  </div>;
}
