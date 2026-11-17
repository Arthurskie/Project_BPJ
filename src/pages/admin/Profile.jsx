import React from 'react';
import { useAuth } from '../../contexts/useAuth';

export default function Profile() {
  const { user } = useAuth();
  const fields = [['Nama pegawai', user?.name], ['NIP', user?.nip], ['Email', user?.email], ['Unit kerja / jabatan', user?.department], ['Peran', user?.role === 'super_admin' ? 'Administrator' : user?.role === 'verifikator' ? 'Verifikator' : user?.role]];
  return <div className="max-w-4xl space-y-6 text-[#292524] ">
    <header><h1 className="text-2xl font-semibold">Profil Pegawai</h1><p className="mt-2 text-sm text-[#57534e] ">Informasi akun yang sedang digunakan.</p></header>
    <section aria-labelledby="profile-details" className="rounded-2xl border border-[#e7e4dc] bg-white p-6  ">
      <h2 id="profile-details" className="mb-5 text-base font-semibold">Data akun</h2>
      <dl className="grid gap-6 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label}><dt className="text-sm text-[#57534e] ">{label}</dt><dd className="mt-1 break-words text-sm font-medium">{value || 'Belum diisi'}</dd></div>)}</dl>
    </section>
    <section aria-labelledby="account-changes" className="rounded-2xl border border-[#e7e4dc] bg-white p-6 "><h2 id="account-changes" className="text-base font-semibold">Perubahan profil dan kata sandi</h2><p className="mt-2 text-sm leading-relaxed text-[#57534e] ">Perubahan profil dan kata sandi belum tersedia pada aplikasi ini. Data ditampilkan hanya untuk dibaca. Hubungi pengelola sistem jika informasi akun perlu diperbarui.</p></section>
  </div>;
}
