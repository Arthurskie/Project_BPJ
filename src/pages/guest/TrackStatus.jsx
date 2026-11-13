import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import GuestNavbar from '../../components/GuestNavbar';
import heroBg from '../../assets/hero-bg.jpg';
import submissionAPI from '../../services/submissionAPI';

export default function TrackStatus() {
  const [nik, setNik] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setResult(null);

    // Validasi NIK 16 digit
    if (!/^[0-9]{16}$/.test(nik.trim())) {
      setErrorMsg('NIK harus terdiri dari 16 digit angka.');
      return;
    }

    if (!trackingCode.trim()) {
      setErrorMsg('Kode tracking surat wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const res = await submissionAPI.trackStatus(nik, trackingCode);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setErrorMsg(res.message || 'Data permohonan tidak ditemukan.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal melacak permohonan surat. Pastikan NIK dan Kode Tracking sesuai.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">Menunggu Verifikasi</span>;
      case 'diproses':
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">Sedang Diproses</span>;
      case 'selesai':
        return <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold">Selesai / Terbit</span>;
      case 'ditolak':
        return <span className="bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 px-3 py-1 rounded-full text-xs font-semibold">Ditolak</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 font-sans flex flex-col">
      <GuestNavbar />

      {/* Header Banner */}
      <section className="relative overflow-hidden bg-slate-900 py-12 sm:py-16 text-center text-white">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900/95" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Lacak Status Permohonan Surat
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Pantau perkembangan proses naskah dinas Anda secara transparan dan real-time menggunakan kombinasi NIK dan Kode Tracking.
          </p>
        </div>
      </section>

      {/* Content Form & Result */}
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 pb-16 w-full">
        {/* Form Box */}
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-7 shadow-lg mb-6">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                  Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="16 digit NIK pemohon"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1.5">
                  Kode Tracking Surat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: SRT-20261112-001"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 animate-fade-in">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Search size={15} />
              <span>{loading ? 'Mencari data...' : 'Lacak Status Sekarang'}</span>
            </button>
          </form>
        </div>

        {/* Result Card */}
        {result && (
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-lg animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-neutral-800 mb-6">
              <div>
                <span className="text-[11px] font-mono font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2.5 py-1 rounded-md">
                  {result.trackingCode}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-2">
                  {result.perihal}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pemohon: <strong>{result.nama}</strong> &bull; {new Date(result.tanggal).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                </p>
              </div>

              <div>{getStatusBadge(result.status)}</div>
            </div>

            {/* Stepper Progress */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-3">
                Perjalanan Dokumen:
              </p>
              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] sm:text-xs font-semibold">
                <div className={`py-2 px-1 rounded-lg ${result.tahap >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-neutral-800 text-slate-400'}`}>
                  1. Registrasi
                </div>
                <div className={`py-2 px-1 rounded-lg ${result.tahap >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-neutral-800 text-slate-400'}`}>
                  2. Verifikasi
                </div>
                <div className={`py-2 px-1 rounded-lg ${result.tahap >= 3 ? (result.status === 'ditolak' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white') : 'bg-slate-100 dark:bg-neutral-800 text-slate-400'}`}>
                  3. Disposisi
                </div>
                <div className={`py-2 px-1 rounded-lg ${result.tahap >= 4 ? (result.status === 'ditolak' ? 'bg-red-700 text-white' : 'bg-emerald-700 text-white') : 'bg-slate-100 dark:bg-neutral-800 text-slate-400'}`}>
                  4. Selesai
                </div>
              </div>
            </div>

            {/* Catatan Admin jika ada */}
            {result.catatanAdmin && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-xs">
                <p className="font-semibold text-slate-800 dark:text-white mb-1">Catatan Petugas:</p>
                <p className="text-slate-600 dark:text-neutral-300 leading-relaxed">{result.catatanAdmin}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-between items-center text-xs text-slate-500">
          <Link to="/guest" className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors">
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>
          <Link to="/guest/submit" className="text-red-700 dark:text-red-400 hover:underline font-semibold flex items-center gap-1">
            Ajukan Surat Baru <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    </div>
  );
}
