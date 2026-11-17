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
import letterTypeAPI from '../../services/letterTypeAPI';
import letterGeneratorAPI from '../../services/letterGeneratorAPI';
import { useAuth } from '../../contexts/useAuth';
import Alert from '../../components/Alert';
import { Spinner } from '../../components/Loading';

import officialsAPI from '../../services/officialsAPI';



export default function WalkInSubmission() {
  const navigate = useNavigate();
  const [letterTypes, setLetterTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [typesError, setTypesError] = useState('');
  const [officials, setOfficials] = useState([]);
  const [officialsLoading, setOfficialsLoading] = useState(true);
  const [officialsError, setOfficialsError] = useState('');
  const SURAT_TYPES = letterTypes.map(item => item.name);
  const { user } = useAuth();

  // State Form
  const [formData, setFormData] = useState({
    nik: '',
    nama: '',
    alamat: '',
    noHp: '',
    jenisSurat: SURAT_TYPES[0] || '',
    keperluan: '',
    status: 'diproses', // 'diproses' | 'selesai'
    nomorSurat: '',
    pejabatTTD: officials[0]?.name || '',
    catatanPetugas: ''
  });

  const [loading, setLoading] = useState(false);
  const [generatingNumber, setGeneratingNumber] = useState(false);
  const [isDuplicateNumber, setIsDuplicateNumber] = useState(false);
  const [alert, setAlert] = useState(null);
  const [createdResult, setCreatedResult] = useState(null);

  useEffect(() => {
    let active = true;
    letterTypeAPI.getActive().then(items => {
      if (!active) return;
      setLetterTypes(items);
      setFormData(prev => ({ ...prev, jenisSurat: prev.jenisSurat || items[0]?.name || '' }));
    }).catch(err => { if (active) setTypesError(err.message); }).finally(() => { if (active) setTypesLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    officialsAPI.getActive().then(items => {
      if (!active) return;
      setOfficials(items);
      setFormData(prev => ({ ...prev, pejabatTTD: prev.pejabatTTD || items[0]?.name || '' }));
    }).catch(err => { if (active) setOfficialsError(err.message); }).finally(() => { if (active) setOfficialsLoading(false); });
    return () => { active = false; };
  }, []);

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
    if (typesLoading || typesError) return;
    setAlert(null);

    if (!letterTypes.some(item => item.name === formData.jenisSurat)) {
      setAlert({ type: 'error', message: 'Pilih jenis surat aktif terlebih dahulu.' });
      return;
    }
    if (formData.status === 'selesai' && !officials.some(item => item.name === formData.pejabatTTD)) {
      setAlert({ type: 'error', message: officialsError || 'Pilih pejabat penanda tangan aktif.' }); return;
    }
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
    const selectedOfficial = officials.find((o) => o.name === createdResult.pejabatTTD);
    if (!selectedOfficial) { setAlert({ type: 'error', message: 'Pejabat penanda tangan tidak tersedia. Muat ulang daftar pejabat.' }); return; }
    const html = letterGeneratorAPI.generateLetterHTML({
      nomorSurat: createdResult.nomorSurat || '',
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
    const selectedOfficial = officials.find((o) => o.name === createdResult.pejabatTTD);
    if (!selectedOfficial) { setAlert({ type: 'error', message: 'Pejabat penanda tangan tidak tersedia. Muat ulang daftar pejabat.' }); return; }
    const html = letterGeneratorAPI.generateLetterHTML({
      nomorSurat: createdResult.nomorSurat || '',
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
        <div className="bg-white  border border-[#e7e4dc] bg-white rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-5">
          <div className="w-14 h-14 bg-emerald-50  border border-emerald-200  rounded-2xl flex items-center justify-center mx-auto text-emerald-600 ">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[#292524]  tracking-tight">
              Permohonan Walk-in Berhasil Disimpan!
            </h2>
            <p className="text-xs text-[#78716c]  mt-1 max-w-md mx-auto">
              Data permohonan surat masyarakat telah berhasil didaftarkan ke sistem loket pelayanan.
            </p>
          </div>

          {/* Kotak Nomor Tiket */}
          <div className="p-4 bg-[#f8f7f3]  border border-[#e7e4dc] bg-white rounded-2xl max-w-md mx-auto text-center">
            <span className="text-xs font-semibold text-[#78716c] uppercase tracking-wider block">
              Nomor Tiket / Kode Pelacakan
            </span>
            <span className="font-mono text-2xl font-semibold text-red-700  block mt-1">
              {createdResult.trackingCode}
            </span>
            <div className="mt-3 pt-3 border-t border-[#e7e4dc]  text-xs text-[#57534e]  flex justify-between">
              <span>Pemohon: <strong>{createdResult.nama}</strong></span>
              <span>Status: <strong className="uppercase text-emerald-600">{createdResult.status}</strong></span>
            </div>
            {createdResult.nomorSurat && (
              <div className="mt-2 text-xs text-[#57534e]  text-left">
                <span>No. Surat Resmi: <strong className="font-mono text-[#292524] ">{createdResult.nomorSurat}</strong></span>
              </div>
            )}
          </div>

          {/* Tombol Cetak jika status selesai */}
          {createdResult.status === 'selesai' && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintLetter}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#b32d32] hover:bg-[#92252a] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Surat Sekarang (PDF)</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadWord}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white  border border-[#d9d5cb]  text-[#44403c]  hover:bg-[#f8f7f3]  rounded-2xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Word (.doc)</span>
              </button>
            </div>
          )}

          {/* Navigasi Lanjutan */}
          <div className="pt-4 border-t border-[#e7e4dc]  flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCreatedResult(null);
                setFormData({
                  nik: '',
                  nama: '',
                  alamat: '',
                  noHp: '',
                  jenisSurat: SURAT_TYPES[0] || '',
                  keperluan: '',
                  status: 'diproses',
                  nomorSurat: '',
                  pejabatTTD: officials[0]?.name || '',
                  catatanPetugas: ''
                });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f1efe8]  hover:bg-[#e7e4dc]  text-[#44403c]  rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Input Permohonan Lain</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/submissions')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#b32d32]  text-white  rounded-lg text-xs font-semibold hover:bg-[#92252a]  transition-colors cursor-pointer"
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
            className="p-2 bg-white  border border-[#e7e4dc]  hover:bg-[#f8f7f3]  text-[#44403c]  rounded-2xl transition-colors cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-2xl font-semibold text-[#292524]  tracking-tight">
              Loket Pelayanan
            </h2>
            <p className="text-xs text-[#78716c]  mt-0.5">
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
      {typesLoading && <p role="status">Memuat jenis surat…</p>}
      {typesError && <p role="alert">{typesError}</p>}
      {!typesLoading && !typesError && !letterTypes.length && <p role="status">Belum ada jenis surat aktif.</p>}
      {officialsLoading && <p role="status">Memuat pejabat penanda tangan…</p>}
      {officialsError && <p role="alert">{officialsError}</p>}
      {!officialsLoading && !officialsError && !officials.length && <p role="status">Belum ada pejabat penanda tangan aktif.</p>}
      <form onSubmit={handleSubmit} className="bg-white  border border-[#e7e4dc] bg-white rounded-2xl shadow-xs overflow-hidden">
        {/* Section 1: Data Identitas Pemohon */}
        <div className="p-6 border-b border-[#e7e4dc] ">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-6 h-6 rounded-full bg-[#fdf0ef] text-[#876a30]  font-bold text-xs flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[#292524] ">
                Identitas Pemohon
              </h3>
              <p className="text-xs text-[#78716c]">Pastikan NIK dan identitas sesuai KTP asli pemohon</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-[#44403c]  uppercase tracking-wider mb-1">
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
                className="w-full px-3 py-2 font-mono bg-[#f8f7f3]  border border-[#d9d5cb]  rounded-lg text-[#292524]  focus:outline-none focus:border-[#b32d32]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403c]  uppercase tracking-wider mb-1">
                Nama Lengkap Pemohon <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Nama sesuai KTP"
                required
                className="w-full px-3 py-2 bg-[#f8f7f3]  border border-[#d9d5cb]  rounded-lg text-[#292524]  focus:outline-none focus:border-[#b32d32]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403c]  uppercase tracking-wider mb-1">
                Nomor Kontak / WhatsApp
              </label>
              <input
                type="tel"
                name="noHp"
                value={formData.noHp}
                onChange={handleChange}
                placeholder="08123456789"
                className="w-full px-3 py-2 bg-[#f8f7f3]  border border-[#d9d5cb]  rounded-lg text-[#292524]  focus:outline-none focus:border-[#b32d32]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403c]  uppercase tracking-wider mb-1">
                Alamat Domisili KTP
              </label>
              <input
                type="text"
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                placeholder="Jl. / RT / RW / Kelurahan"
                className="w-full px-3 py-2 bg-[#f8f7f3]  border border-[#d9d5cb]  rounded-lg text-[#292524]  focus:outline-none focus:border-[#b32d32]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Detail Permohonan Surat */}
        <div className="p-6 border-b border-[#e7e4dc] ">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-6 h-6 rounded-full bg-[#fdf0ef] text-[#876a30]  font-bold text-xs flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[#292524] ">
                Detail Permohonan Surat
              </h3>
              <p className="text-xs text-[#78716c]">Jenis surat dan maksud keperluan pembuatan</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-[#44403c]  uppercase tracking-wider mb-1">
                Pilih Jenis Surat <span className="text-red-500">*</span>
              </label>
              <select
                name="jenisSurat"
                value={formData.jenisSurat}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#f8f7f3]  border border-[#d9d5cb]  rounded-lg text-[#292524]  font-medium focus:outline-none focus:border-[#b32d32] cursor-pointer"
              >
                <option value="">Pilih jenis surat</option>{SURAT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403c]  uppercase tracking-wider mb-1">
                Maksud & Keperluan Pengajuan <span className="text-red-500">*</span>
              </label>
              <textarea
                name="keperluan"
                rows={2}
                value={formData.keperluan}
                onChange={handleChange}
                placeholder="Contoh: Persyaratan pembukaan rekening bank, pengajuan pinjaman usaha, dsb..."
                required
                className="w-full p-2.5 bg-[#f8f7f3]  border border-[#d9d5cb]  rounded-lg text-[#292524]  focus:outline-none focus:border-[#b32d32]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Data Khusus Internal & Status Pelayanan */}
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-6 h-6 rounded-full bg-[#fdf0ef] text-[#876a30]  font-bold text-xs flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[#292524] ">
                Internal Pelayanan Loket
              </h3>
              <p className="text-xs text-[#78716c]">Pengaturan status penyelesaian dan nomor surat dinas</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Status Awal */}
            <div>
              <label className="block text-xs font-semibold text-[#44403c]  uppercase tracking-wider mb-2">
                Status Pelayanan Loket <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.status === 'diproses'
                      ? 'border-blue-500 bg-blue-50/50  text-blue-900  font-semibold'
                      : 'border-[#e7e4dc]  hover:bg-[#f8f7f3]  text-[#57534e] '
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
                      ? 'border-emerald-500 bg-emerald-50/50  text-emerald-900  font-semibold'
                      : 'border-[#e7e4dc]  hover:bg-[#f8f7f3]  text-[#57534e] '
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
              <div className="p-4 bg-[#f8f7f3]  border border-[#e7e4dc] bg-white rounded-2xl space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#44403c]  uppercase tracking-wider">
                      Nomor Surat Resmi <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoGenerateNumber}
                      disabled={generatingNumber}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#292524] hover:underline cursor-pointer"
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
                    className={`w-full px-3 py-2 font-mono bg-white  border rounded-2xl text-[#292524]  focus:outline-none ${
                      isDuplicateNumber
                        ? 'border-red-500 ring-1 ring-red-500'
                        : 'border-[#d9d5cb]  focus:border-[#b32d32]'
                    }`}
                  />
                  {isDuplicateNumber && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Nomor surat sudah terdaftar. Silakan buat nomor urut baru.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#44403c]  uppercase tracking-wider mb-1">
                    Pejabat Penanda Tangan (TTD) <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="pejabatTTD"
                    value={formData.pejabatTTD}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white  border border-[#d9d5cb]  rounded-2xl text-[#292524]  font-medium focus:outline-none focus:border-[#b32d32] cursor-pointer"
                  >
                    {officials.map((o) => (
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
              <label className="block text-xs font-semibold text-[#44403c]  uppercase tracking-wider mb-1">
                Catatan Loket (Opsional)
              </label>
              <textarea
                name="catatanPetugas"
                rows={2}
                value={formData.catatanPetugas}
                onChange={handleChange}
                placeholder="Catatan tambahan pelayanan loket tatap muka..."
                className="w-full p-2.5 bg-[#f8f7f3]  border border-[#d9d5cb]  rounded-lg text-[#292524]  focus:outline-none focus:border-[#b32d32]"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-[#f8f7f3]/70  border-t border-[#e7e4dc]  flex items-center justify-end gap-3">
          <Link
            to="/admin/submissions"
            className="px-4 py-2 bg-white  hover:bg-[#f8f7f3]  border border-[#d9d5cb]  text-[#44403c]  rounded-2xl text-xs font-semibold transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading || (formData.status === 'selesai' && (officialsLoading || !!officialsError || !officials.length)) || typesLoading || !!typesError || !letterTypes.length || (formData.status === 'selesai' && isDuplicateNumber)}
            className="px-5 py-2 bg-[#b32d32] hover:bg-[#92252a] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Spinner size="xs" color="white" /> : <Send className="w-3.5 h-3.5" />}
            <span>Simpan Permohonan</span>
          </button>
        </div>
      </form>
    </div>
  );
}




