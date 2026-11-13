import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowLeft,
  Printer,
  Download,
  Send,
  PlusCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import submissionAPI from '../../services/submissionAPI';
import letterGeneratorAPI from '../../services/letterGeneratorAPI';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../../components/Alert';
import { Spinner } from '../../components/Loading';

const OFFICIALS = [
  { name: 'Budi Santoso, S.STP', nip: '198503152010011002', role: 'Lurah Cikarang' },
  { name: 'Dra. Hj. Maryati, M.Si', nip: '197904122005012003', role: 'Sekretaris Kelurahan' },
  { name: 'Ahmad Zaelani, S.AP', nip: '199002172014031001', role: 'Kepala Seksi Pelayanan Umum' }
];

const SURAT_TYPES = [
  'Surat Keterangan Usaha (SKU)',
  'Surat Keterangan Domisili',
  'Surat Keterangan Tidak Mampu (SKTM)',
  'Surat Keterangan Belum Menikah',
  'Surat Pengantar SKCK',
  'Surat Keterangan Kematian',
  'Surat Keterangan Kelahiran',
  'Surat Keterangan Penghasilan',
  'Surat Rekomendasi Izin Keramaian'
];

export default function WalkInSubmission() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State Form
  const [formData, setFormData] = useState({
    nik: '',
    nama: '',
    alamat: '',
    noHp: '',
    jenisSurat: SURAT_TYPES[0],
    keperluan: '',
    status: 'diproses', // 'diproses' | 'selesai'
    nomorSurat: '',
    pejabatTTD: OFFICIALS[0].name,
    catatanPetugas: ''
  });

  const [loading, setLoading] = useState(false);
  const [generatingNumber, setGeneratingNumber] = useState(false);
  const [isDuplicateNumber, setIsDuplicateNumber] = useState(false);
  const [alert, setAlert] = useState(null);
  const [createdResult, setCreatedResult] = useState(null);

  // Auto check nomor surat duplikasi
  useEffect(() => {
    const checkDuplicate = async () => {
      if (!formData.nomorSurat || !formData.nomorSurat.trim()) {
        setIsDuplicateNumber(false);
        return;
      }
      try {
        const res = await submissionAPI.validateLetterNumber(formData.nomorSurat);
        setIsDuplicateNumber(res.isDuplicate);
      } catch {
        setIsDuplicateNumber(false);
      }
    };
    const t = setTimeout(checkDuplicate, 400);
    return () => clearTimeout(t);
  }, [formData.nomorSurat]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutoGenerateNumber = async () => {
    setGeneratingNumber(true);
    try {
      const res = await submissionAPI.generateLetterNumber('KEL.CKR');
      if (res.success && res.data?.nomorSurat) {
        setFormData((prev) => ({ ...prev, nomorSurat: res.data.nomorSurat }));
        setIsDuplicateNumber(false);
      }
    } catch {
      setAlert({ type: 'error', message: 'Gagal men-generate nomor surat otomatis.' });
    } finally {
      setGeneratingNumber(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    // Validasi dasar
    if (formData.nik.trim().length !== 16 || !/^\d+$/.test(formData.nik.trim())) {
      setAlert({ type: 'error', message: 'NIK wajib terdiri dari 16 digit angka kependudukan.' });
      return;
    }

    if (!formData.nama.trim()) {
      setAlert({ type: 'error', message: 'Nama lengkap pemohon wajib diisi.' });
      return;
    }

    if (!formData.keperluan.trim()) {
      setAlert({ type: 'error', message: 'Keperluan atau perihal pengajuan surat wajib diisi.' });
      return;
    }

    if (formData.status === 'selesai') {
      if (!formData.nomorSurat.trim()) {
        setAlert({ type: 'error', message: 'Nomor Surat Resmi wajib diisi jika status langsung diselesaikan.' });
        return;
      }
      if (isDuplicateNumber) {
        setAlert({ type: 'error', message: 'Nomor Surat tersebut sudah pernah digunakan.' });
        return;
      }
    }

    setLoading(true);
    try {
      const res = await submissionAPI.createWalkInSubmission({
        nik: formData.nik,
        nama: formData.nama,
        alamat: formData.alamat,
        noHp: formData.noHp,
        jenisSurat: formData.jenisSurat,
        keperluan: formData.keperluan,
        status: formData.status,
        nomorSurat: formData.status === 'selesai' ? formData.nomorSurat : null,
        pejabatTTD: formData.status === 'selesai' ? formData.pejabatTTD : null,
        catatanVerifikasi: formData.catatanPetugas || 'Pelayanan tatap muka di loket kelurahan.',
        adminId: user?.id || user?.nip || 'admin-loket',
        adminName: user?.name || 'Petugas Loket'
      });

      if (res.success && res.data) {
        setCreatedResult(res.data);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Gagal menyimpan pengajuan permohonan walk-in.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Cetak Surat Resmi dari Hasil Buat
  const handlePrintLetter = () => {
    if (!createdResult) return;
    const selectedOfficial = OFFICIALS.find((o) => o.name === createdResult.pejabatTTD) || OFFICIALS[0];
    const html = letterGeneratorAPI.generateLetterHTML({
      nomorSurat: createdResult.nomorSurat || '470 / 001 / KEL.CKR / XI / 2026',
      jenisSurat: createdResult.jenisSurat,
      nama: createdResult.nama,
      nik: createdResult.nik,
      alamat: createdResult.alamat,
      keperluan: createdResult.keperluan,
      pejabatTTD: selectedOfficial.name,
      nipPejabat: selectedOfficial.nip,
      jabatanPejabat: selectedOfficial.role,
      tanggalSurat: createdResult.createdAt
    });
    letterGeneratorAPI.printLetter(html);
  };

  // Unduh DOC
  const handleDownloadWord = () => {
    if (!createdResult) return;
    const selectedOfficial = OFFICIALS.find((o) => o.name === createdResult.pejabatTTD) || OFFICIALS[0];
    const html = letterGeneratorAPI.generateLetterHTML({
      nomorSurat: createdResult.nomorSurat || '470 / 001 / KEL.CKR / XI / 2026',
      jenisSurat: createdResult.jenisSurat,
      nama: createdResult.nama,
      nik: createdResult.nik,
      alamat: createdResult.alamat,
      keperluan: createdResult.keperluan,
      pejabatTTD: selectedOfficial.name,
      nipPejabat: selectedOfficial.nip,
      jabatanPejabat: selectedOfficial.role,
      tanggalSurat: createdResult.createdAt
    });
    const filename = `${createdResult.jenisSurat.replace(/[^a-zA-Z0-9]/g, '_')}_${createdResult.nama.replace(/\s+/g, '_')}.doc`;
    letterGeneratorAPI.downloadWordDocument(html, filename);
  };

  // Tampilan Sukses Setelah Submit
  if (createdResult) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-5">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Permohonan Walk-in Berhasil Disimpan!
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-md mx-auto">
              Data permohonan surat masyarakat telah berhasil didaftarkan ke sistem loket pelayanan.
            </p>
          </div>

          {/* Kotak Nomor Tiket */}
          <div className="p-4 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl max-w-md mx-auto text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Nomor Tiket / Kode Pelacakan
            </span>
            <span className="font-mono text-xl font-bold text-red-700 dark:text-red-400 block mt-1">
              {createdResult.trackingCode}
            </span>
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-neutral-800 text-xs text-slate-600 dark:text-neutral-400 flex justify-between">
              <span>Pemohon: <strong>{createdResult.nama}</strong></span>
              <span>Status: <strong className="uppercase text-emerald-600">{createdResult.status}</strong></span>
            </div>
            {createdResult.nomorSurat && (
              <div className="mt-2 text-xs text-slate-600 dark:text-neutral-400 text-left">
                <span>No. Surat Resmi: <strong className="font-mono text-slate-900 dark:text-white">{createdResult.nomorSurat}</strong></span>
              </div>
            )}
          </div>

          {/* Tombol Cetak jika status selesai */}
          {createdResult.status === 'selesai' && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintLetter}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Surat Sekarang (PDF)</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadWord}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Word (.doc)</span>
              </button>
            </div>
          )}

          {/* Navigasi Lanjutan */}
          <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCreatedResult(null);
                setFormData({
                  nik: '',
                  nama: '',
                  alamat: '',
                  noHp: '',
                  jenisSurat: SURAT_TYPES[0],
                  keperluan: '',
                  status: 'diproses',
                  nomorSurat: '',
                  pejabatTTD: OFFICIALS[0].name,
                  catatanPetugas: ''
                });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Input Permohonan Lain</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/submissions')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <span>Lihat Daftar Permohonan</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/submissions"
            className="p-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 rounded-lg transition-colors cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Input Permohonan Walk-in (Offline)
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Pendaftaran langsung oleh petugas loket untuk warga yang hadir tatap muka di kelurahan.
            </p>
          </div>
        </div>
      </div>

      {/* Alert Error */}
      {alert && (
        <Alert type={alert.type} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Section 1: Data Identitas Pemohon */}
        <div className="p-6 border-b border-slate-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-bold text-xs flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Identitas Pemohon
              </h3>
              <p className="text-[11px] text-slate-400">Pastikan NIK dan identitas sesuai KTP asli pemohon</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nik"
                maxLength={16}
                value={formData.nik}
                onChange={handleChange}
                placeholder="16 digit angka KTP"
                required
                className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Nama Lengkap Pemohon <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Nama sesuai KTP"
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Nomor Kontak / WhatsApp
              </label>
              <input
                type="tel"
                name="noHp"
                value={formData.noHp}
                onChange={handleChange}
                placeholder="08123456789"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Alamat Domisili KTP
              </label>
              <input
                type="text"
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                placeholder="Jl. / RT / RW / Kelurahan"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-red-600"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Detail Permohonan Surat */}
        <div className="p-6 border-b border-slate-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-bold text-xs flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Detail Permohonan Surat
              </h3>
              <p className="text-[11px] text-slate-400">Jenis surat dan maksud keperluan pembuatan</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Pilih Jenis Surat <span className="text-red-500">*</span>
              </label>
              <select
                name="jenisSurat"
                value={formData.jenisSurat}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-none focus:border-red-600 cursor-pointer"
              >
                {SURAT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Maksud & Keperluan Pengajuan <span className="text-red-500">*</span>
              </label>
              <textarea
                name="keperluan"
                rows={2}
                value={formData.keperluan}
                onChange={handleChange}
                placeholder="Contoh: Persyaratan pembukaan rekening bank, pengajuan pinjaman usaha, dsb..."
                required
                className="w-full p-2.5 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-red-600"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Data Khusus Internal & Status Pelayanan */}
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-bold text-xs flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Internal Pelayanan Loket
              </h3>
              <p className="text-[11px] text-slate-400">Pengaturan status penyelesaian dan nomor surat dinas</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Status Awal */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                Status Pelayanan Loket <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.status === 'diproses'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300 font-semibold'
                      : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800/40 text-slate-600 dark:text-neutral-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="diproses"
                    checked={formData.status === 'diproses'}
                    onChange={handleChange}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <RefreshCw className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Sedang Diproses (Antrean)</span>
                </label>

                <label
                  className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.status === 'selesai'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 font-semibold'
                      : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800/40 text-slate-600 dark:text-neutral-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="selesai"
                    checked={formData.status === 'selesai'}
                    onChange={handleChange}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Langsung Selesai & Terbitkan</span>
                </label>
              </div>
            </div>

            {/* Nomor Surat & Pejabat (Jika Langsung Selesai) */}
            {formData.status === 'selesai' && (
              <div className="p-4 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">
                      Nomor Surat Resmi <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoGenerateNumber}
                      disabled={generatingNumber}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 dark:text-red-400 hover:underline cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${generatingNumber ? 'animate-spin' : ''}`} />
                      <span>{generatingNumber ? 'Menghasilkan...' : 'Generate Nomor'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    name="nomorSurat"
                    value={formData.nomorSurat}
                    onChange={handleChange}
                    placeholder="Contoh: 470 / 001 / KEL.CKR / XI / 2026"
                    className={`w-full px-3 py-2 font-mono bg-white dark:bg-neutral-900 border rounded-lg text-slate-900 dark:text-white focus:outline-none ${
                      isDuplicateNumber
                        ? 'border-red-500 ring-1 ring-red-500'
                        : 'border-slate-300 dark:border-neutral-700 focus:border-red-600'
                    }`}
                  />
                  {isDuplicateNumber && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Nomor surat sudah terdaftar. Silakan buat nomor urut baru.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                    Pejabat Penanda Tangan (TTD) <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="pejabatTTD"
                    value={formData.pejabatTTD}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-none focus:border-red-600 cursor-pointer"
                  >
                    {OFFICIALS.map((o) => (
                      <option key={o.nip} value={o.name}>
                        {o.name} &mdash; {o.role} (NIP. {o.nip})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Catatan Petugas */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Catatan Loket (Opsional)
              </label>
              <textarea
                name="catatanPetugas"
                rows={2}
                value={formData.catatanPetugas}
                onChange={handleChange}
                placeholder="Catatan tambahan pelayanan loket tatap muka..."
                className="w-full p-2.5 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-red-600"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50/70 dark:bg-neutral-950 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-end gap-3">
          <Link
            to="/admin/submissions"
            className="px-4 py-2 bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 rounded-lg text-xs font-semibold transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading || (formData.status === 'selesai' && isDuplicateNumber)}
            className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Spinner size="xs" color="white" /> : <Send className="w-3.5 h-3.5" />}
            <span>Simpan Permohonan Walk-in</span>
          </button>
        </div>
      </form>
    </div>
  );
}

