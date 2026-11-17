import React from 'react';

export default function Settings() {
  return <div className="max-w-4xl space-y-6 text-[#292524] ">
    <header><h1 className="text-2xl font-semibold">Informasi layanan</h1><p className="mt-2 text-sm text-[#57534e] ">Ketersediaan fitur penomoran surat dan notifikasi.</p></header>
    <section aria-labelledby="service-heading" className="rounded-2xl border border-[#e7e4dc] bg-white p-6 "><h2 id="service-heading" className="text-base font-semibold">Ketersediaan layanan</h2><dl className="mt-5 space-y-5"><div><dt className="text-sm font-medium">Penomoran surat</dt><dd className="mt-1 text-sm leading-relaxed text-[#57534e] ">Nomor dapat dibuat melalui tombol Generate Nomor pada halaman verifikasi atau loket. Pengaturan penomoran otomatis belum tersedia.</dd></div><div><dt className="text-sm font-medium">Notifikasi email</dt><dd className="mt-1 text-sm leading-relaxed text-[#57534e] ">Pengiriman notifikasi email belum terhubung. Tidak ada email yang dikirim oleh sistem.</dd></div></dl></section>
  </div>;
}
