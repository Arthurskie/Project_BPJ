import { isDemoMode } from '../../services/supabaseClient';
import DocumentPreview from '../../components/DocumentPreview';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  User,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Printer,
  Download,
  AlertTriangle,
  History,
  Send,
  FileCheck2,
  Calendar
} from 'lucide-react';
import submissionAPI from '../../services/submissionAPI';
import auditLogAPI from '../../services/auditLogAPI';
import letterGeneratorAPI from '../../services/letterGeneratorAPI';
import { useAuth } from '../../contexts/useAuth';
import { Skeleton, Spinner } from '../../components/Loading';
import Alert from '../../components/Alert';
import ConfirmModal from '../../components/ConfirmModal';

import officialsAPI from '../../services/officialsAPI';

export default function SubmissionDetail() {
  const { id } = useParams();
  return <SubmissionDetailContent key={id} id={id} />;
}

function SubmissionDetailContent({ id }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [previewFile, setPreviewFile] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatingNumber, setGeneratingNumber] = useState(false);
  const [alert, setAlert] = useState(null);

  // Form Verifikasi
  const [statusAction, setStatusAction] = useState(''); // Decision requires explicit selection.
  const [nomorSurat, setNomorSurat] = useState('');
  const [officials, setOfficials] = useState([]);
  const [officialsLoading, setOfficialsLoading] = useState(true);
  const [officialsError, setOfficialsError] = useState('');
  const [pejabatTTD, setPejabatTTD] = useState(officials[0]?.name || '');
  const [catatanVerifikasi, setCatatanVerifikasi] = useState('');
  const [isDuplicateNumber, setIsDuplicateNumber] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    officialsAPI.getActive().then(items => {
      if (!active) return;
      setOfficials(items);
      setPejabatTTD(prev => prev || items[0]?.name || '');
    }).catch(err => { if (active) setOfficialsError(err.message); }).finally(() => { if (active) setOfficialsLoading(false); });
    return () => { active = false; };
  }, []);

  // Load Data Permohonan & Audit Log
  const [revision, setRevision] = useState(0);
  const loadData = () => {
    setLoading(true);
    setRevision(value => value + 1);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await submissionAPI.getSubmissionById(id);
        if (!active) return;
        if (res.success && res.data) {
          setSubmission(res.data);
          if (res.data.nomorSurat) setNomorSurat(res.data.nomorSurat);
          if (res.data.pejabatTTD) setPejabatTTD(res.data.pejabatTTD);
          if (res.data.catatanVerifikasi) setCatatanVerifikasi(res.data.catatanVerifikasi);

          // Ambil riwayat audit untuk permohonan ini
          const logsRes = await auditLogAPI.getLogsByTarget(isDemoMode ? res.data.trackingCode : res.data.id);
          if (active && logsRes.success) {
            setLogs(logsRes.data || []);
          }
        }
      } catch (err) {
        if (!active) return;
        setAlert({
          type: 'error',
          message: err.message || 'Gagal memuat data permohonan surat.'
        });
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id, revision]);

  // Validasi real-time duplikasi nomor surat
  useEffect(() => {
    let active = true;
    const checkDuplicate = async () => {
      if (!nomorSurat || !nomorSurat.trim() || !submission) {
        setIsDuplicateNumber(false);
        return;
      }
      try {
        const res = await submissionAPI.validateLetterNumber(nomorSurat, submission.id);
        if (active) setIsDuplicateNumber(res.isDuplicate);
      } catch {
        if (active) setIsDuplicateNumber(false);
      }
    };

    const timer = setTimeout(checkDuplicate, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [nomorSurat, submission]);

  // Auto-generate nomor surat resmi
  const handleAutoGenerateNumber = async () => {
    setGeneratingNumber(true);
    try {
      const res = await submissionAPI.generateLetterNumber('KEL.CKR');
      if (res.success && res.data?.nomorSurat) {
        setNomorSurat(res.data.nomorSurat);
        setIsDuplicateNumber(false);
      }
    } catch {
      setAlert({ type: 'error', message: 'Gagal men-generate nomor surat otomatis.' });
    } finally {
      setGeneratingNumber(false);
    }
  };

  // Trigger modal konfirmasi
  const handleSubmitPrompt = (e) => {
    e.preventDefault();
    if (!statusAction) { setAlert({type: "error", message: "Pilih keputusan terlebih dahulu."}); return; }
    if (statusAction === 'selesai') {
      if (!nomorSurat.trim()) {
        setAlert({ type: 'error', message: 'Nomor Surat Resmi wajib diisi sebelum menyetujui surat.' });
        return;
      }
      if (isDuplicateNumber) {
        setAlert({ type: 'error', message: 'Nomor Surat tersebut sudah pernah digunakan. Silakan generate nomor baru.' });
        return;
      }
      if (!officials.some(item => item.name === pejabatTTD)) {
        setAlert({ type: 'error', message: 'Silakan pilih Pejabat Penanda Tangan.' });
        return;
      }
    } else if (statusAction === 'ditolak') {
      if (!catatanVerifikasi.trim()) {
        setAlert({ type: 'error', message: 'Alasan penolakan wajib dicantumkan secara lengkap.' });
        return;
      }
    }
    setConfirmModalOpen(true);
  };

  // Submit verifikasi
  const handleConfirmSubmit = async () => {
    if (statusAction === 'selesai' && !officials.some(item => item.name === pejabatTTD)) { setAlert({ type: 'error', message: officialsError || 'Pilih pejabat penanda tangan aktif.' }); return; }
    setSubmitting(true);
    try {
      const res = await submissionAPI.verifyAndComplete(submission.id, {
        nomorSurat,
        pejabatTTD,
        catatanVerifikasi,
        status: statusAction,
        adminId: user?.id || user?.nip || 'admin-verif',
        adminName: user?.name || 'Petugas Verifikator'
      });

      setAlert({
        type: 'success',
        message: res.message || 'Verifikasi berhasil disimpan!'
      });
      setConfirmModalOpen(false);
      loadData();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Gagal menyimpan hasil verifikasi.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Cetak Surat Resmi (Browser Print / PDF)
  const handlePrintLetter = () => {
    if (!submission) return;
    const selectedOfficial = officials.find((o) => o.name === pejabatTTD);
    if (!selectedOfficial) { setAlert({ type: 'error', message: 'Pejabat penanda tangan tidak tersedia. Muat ulang daftar pejabat.' }); return; }
    const html = letterGeneratorAPI.generateLetterHTML({
      nomorSurat: nomorSurat || submission.nomorSurat || '',
      jenisSurat: submission.jenisSurat,
      nama: submission.nama,
      nik: submission.nik,
      alamat: submission.alamat,
      keperluan: submission.keperluan,
      pejabatTTD: selectedOfficial.name,
      nipPejabat: selectedOfficial.nip,
      jabatanPejabat: selectedOfficial.role,
      tanggalSurat: submission.verifiedAt || new Date()
    });
    letterGeneratorAPI.printLetter(html);
  };

  // Download Dokumen Word (.doc)
  const handleDownloadWord = () => {
    if (!submission) return;
    const selectedOfficial = officials.find((o) => o.name === pejabatTTD);
    if (!selectedOfficial) { setAlert({ type: 'error', message: 'Pejabat penanda tangan tidak tersedia. Muat ulang daftar pejabat.' }); return; }
    const html = letterGeneratorAPI.generateLetterHTML({
      nomorSurat: nomorSurat || submission.nomorSurat || '',
      jenisSurat: submission.jenisSurat,
      nama: submission.nama,
      nik: submission.nik,
      alamat: submission.alamat,
      keperluan: submission.keperluan,
      pejabatTTD: selectedOfficial.name,
      nipPejabat: selectedOfficial.nip,
      jabatanPejabat: selectedOfficial.role,
      tanggalSurat: submission.verifiedAt || new Date()
    });
    const filename = `${submission.jenisSurat.replace(/[^a-zA-Z0-9]/g, '_')}_${submission.nama.replace(/\s+/g, '_')}.doc`;
    letterGeneratorAPI.downloadWordDocument(html, filename);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50  text-amber-700  border border-amber-200 ">
            <Clock className="w-3.5 h-3.5" />
            Menunggu Verifikasi
          </span>
        );
      case 'diproses':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50  text-blue-700  border border-blue-200 ">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Sedang Diproses
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50  text-emerald-700  border border-emerald-200 ">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Selesai / Terbit
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50  text-red-700  border border-red-200 ">
            <XCircle className="w-3.5 h-3.5" />
            Ditolak
          </span>
        );
      default:
        return <span className="text-xs">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton variant="circle" className="w-8 h-8" />
          <Skeleton variant="text" className="w-48 h-6" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton variant="card" className="h-96" />
          <Skeleton variant="card" className="h-96" />
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="bg-white  border border-[#e7e4dc] bg-white rounded-2xl p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-[#292524] ">Permohonan Tidak Ditemukan</h3>
        <p className="text-xs text-[#78716c] ">
          Berkas permohonan dengan ID tersebut tidak ditemukan dalam sistem.
        </p>
        <Link
          to="/admin/submissions"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#b32d32]  text-white  rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Permohonan
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/submissions')}
            className="p-2 bg-white  border border-[#e7e4dc]  hover:bg-[#f8f7f3]  text-[#44403c]  rounded-2xl transition-colors cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-[#292524]  tracking-tight">
                Verifikasi Permohonan Surat
              </h2>
              {getStatusBadge(submission.status)}
            </div>
            <p className="text-xs text-[#78716c]  mt-0.5">
              Kode Tiket:{' '}
              <span className="font-mono font-bold text-[#292524] ">
                {submission.trackingCode}
              </span>{' '}
              &bull; Sumber:{' '}
              <span className="font-semibold text-[#44403c] ">
                {submission.source === 'walk-in' ? 'Loket Pelayanan (Walk-in)' : 'Portal Publik (Online)'}
              </span>
            </p>
          </div>
        </div>

        {/* Quick Action Cetak (Jika sudah disetujui / ada nomor surat) */}
        {(submission.status === 'selesai' || submission.nomorSurat) && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintLetter}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#b32d32] hover:bg-[#92252a] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadWord}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white  border border-[#d9d5cb]  text-[#44403c]  hover:bg-[#f8f7f3]  rounded-2xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh DOC</span>
            </button>
          </div>
        )}
      </div>

      {/* Alert Notifikasi */}
      {alert && (
        <Alert type={alert.type} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {/* Grid 2 Kolom: Data Pemohon (Read-only) & Form Verifikasi (Editable) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Kolom Kiri: Detail Pengajuan Warga (Read-Only) */}
        <div className="bg-white  border border-[#e7e4dc] bg-white rounded-2xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-[#f8f7f3]/70  border-b border-[#e7e4dc]  flex items-center gap-2">
            <User className="w-4 h-4 text-[#44403c] " />
            <h3 className="text-sm font-semibold text-[#292524] ">
              Data Pemohon & Berkas Pengajuan
            </h3>
          </div>

          <div className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#e7e4dc] ">
              <div>
                <span className="text-xs font-medium text-[#78716c]  uppercase tracking-wider block mb-1">
                  Nama Lengkap Pemohon
                </span>
                <p className="font-bold text-sm text-[#292524] ">{submission.nama}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-[#78716c]  uppercase tracking-wider block mb-1">
                  Nomor Induk Kependudukan (NIK)
                </span>
                <p className="font-mono font-semibold text-[#292524]  bg-[#f1efe8]  px-2 py-0.5 rounded inline-block">
                  {submission.nik}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[#e7e4dc] ">
              <div>
                <span className="text-xs font-medium text-[#78716c]  uppercase tracking-wider block mb-1">
                  Jenis Surat Permohonan
                </span>
                <p className="font-semibold text-[#292524]  flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#b32d32]" />
                  {submission.jenisSurat}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-[#78716c]  uppercase tracking-wider block mb-1">
                  Nomor Kontak / WhatsApp
                </span>
                <p className="font-semibold text-[#292524] ">{submission.noHp || '-'}</p>
              </div>
            </div>

            <div className="pb-4 border-b border-[#e7e4dc] ">
              <span className="text-xs font-medium text-[#78716c]  uppercase tracking-wider block mb-1">
                Alamat Domisili KTP
              </span>
              <p className="text-[#44403c]  leading-relaxed">{submission.alamat || '-'}</p>
            </div>

            <div className="pb-4 border-b border-[#e7e4dc] ">
              <span className="text-xs font-medium text-[#78716c]  uppercase tracking-wider block mb-1">
                Keperluan / Keterangan Pengajuan
              </span>
              <div className="p-3 bg-[#f8f7f3]  border border-[#e7e4dc]  rounded-lg text-[#292524] ">
                {submission.keperluan || '-'}
              </div>
            </div>

            <section className="pb-4 border-b border-[#e7e4dc] " aria-label="Informasi tambahan pengajuan"><h4 className="font-semibold mb-2">Informasi tambahan</h4><dl className="space-y-2"><div><dt>Email pemohon</dt><dd>{submission.email || 'Tidak dicantumkan'}</dd></div><div><dt>Keterangan warga</dt><dd className="whitespace-pre-wrap">{submission.keterangan || 'Tidak dicantumkan'}</dd></div><div><dt>Sumber pengajuan</dt><dd>{submission.source === 'walk-in' ? 'Loket langsung' : 'Formulir warga'}</dd></div></dl>{submission.letterTypeSnapshot && <div className="mt-3"><h4 className="font-semibold">Persyaratan saat diajukan ({submission.letterTypeSnapshot.code})</h4><ul className="list-disc pl-4">{submission.letterTypeSnapshot.requirements.map(item => <li key={item}>{item}</li>)}</ul></div>}</section>
            {/* Berkas Lampiran Syarat */}
            <div>
              <span className="text-xs font-medium text-[#78716c]  uppercase tracking-wider block mb-2">
                Dokumen Lampiran Warga ({submission.files?.length || 0})
              </span>
              {submission.files && submission.files.length > 0 ? (
                <div className="space-y-1.5">
                  {submission.files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-[#f8f7f3]  border border-[#e7e4dc]  rounded-lg"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium text-[#292524]  truncate">
                          {file.name || `Lampiran_${idx + 1}.pdf`}
                        </span>
                      </div>
                      <span className="text-xs text-[#78716c] shrink-0">
                        <button type="button" onClick={() => setPreviewFile(file)} className="mr-3 text-xs font-medium text-[#292524] underline ">Pratinjau Dokumen</button>
                          {file.size ? `${(file.size / 1024).toFixed(0)} KB` : 'Dokumen'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#78716c]  italic">
                  Tidak ada file lampiran digital yang disertakan.
                </p>
              )}
            </div>

            {/* Waktu Masuk & Petugas Verifikator Terakhir */}
            <div className="pt-2 text-xs text-[#78716c]  flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Masuk: {new Date(submission.createdAt).toLocaleString('id-ID')}</span>
              </div>
              {submission.verifiedBy && (
                <span className="font-medium text-[#44403c] ">
                  Petugas: {submission.verifiedBy}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Form Pemrosesan & Verifikasi Internal Admin */}
        <div className="bg-white  border border-[#e7e4dc] bg-white rounded-2xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-[#f8f7f3]/70  border-b border-[#e7e4dc]  flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#b32d32] " />
              <h3 className="text-sm font-semibold text-[#292524] ">
                Panel Verifikasi & Keputusan
              </h3>
            </div>

          </div>

          {officialsLoading && <p role="status">Memuat pejabat penanda tangan…</p>}
      {officialsError && <p role="alert">{officialsError}</p>}
      {!officialsLoading && !officialsError && !officials.length && <p role="status">Belum ada pejabat penanda tangan aktif.</p>}
      <form onSubmit={handleSubmitPrompt} className="p-5 space-y-4 text-xs">
            {/* Pilihan Keputusan Status */}
            <div>
              <label className="block text-xs font-semibold text-[#44403c]  uppercase tracking-wider mb-2">
                Keputusan Status Surat <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                    statusAction === 'selesai'
                      ? 'border-emerald-500 bg-emerald-50/50  text-emerald-900  font-semibold'
                      : 'border-[#e7e4dc]  hover:bg-[#f8f7f3]  text-[#57534e] '
                  }`}
                >
                  <input
                    type="radio"
                    name="statusAction"
                    value="selesai"
                    checked={statusAction === 'selesai'}
                    onChange={() => setStatusAction('selesai')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Setujui & Terbitkan</span>
                </label>

                <label
                  className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                    statusAction === 'ditolak'
                      ? 'border-red-500 bg-red-50/50  text-red-900  font-semibold'
                      : 'border-[#e7e4dc]  hover:bg-[#f8f7f3]  text-[#57534e] '
                  }`}
                >
                  <input
                    type="radio"
                    name="statusAction"
                    value="ditolak"
                    checked={statusAction === 'ditolak'}
                    onChange={() => setStatusAction('ditolak')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Tolak Permohonan</span>
                </label>
              </div>
            </div>

            {/* Form Bidang Internal untuk Persetujuan (Nomor Surat & Pejabat TTD) */}
            {statusAction === 'selesai' && (
              <div className="space-y-4 pt-2 border-t border-[#e7e4dc] ">
                {/* Nomor Surat Resmi */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#44403c]  uppercase tracking-wider">
                      Nomor Surat Resmi Instansi <span className="text-red-500">*</span>
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
                    value={nomorSurat}
                    onChange={(e) => setNomorSurat(e.target.value)}
                    placeholder="Contoh: 470 / 001 / KEL.CKR / XI / 2026"
                    className={`w-full px-3 py-2 font-mono bg-[#f8f7f3]  border rounded-lg text-xs text-[#292524]  focus:outline-none transition-colors ${
                      isDuplicateNumber
                        ? 'border-red-500 focus:border-[#b32d32] ring-1 ring-red-500'
                        : 'border-[#d9d5cb]  focus:border-[#b32d32]'
                    }`}
                  />
                  {isDuplicateNumber ? (
                    <p className="text-xs text-red-600  mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Nomor surat ini sudah terdaftar pada surat lain. Mohon gunakan nomor urut berbeda.
                    </p>
                  ) : (
                    <p className="text-xs text-[#78716c]  mt-1">
                      Format: 470 / [Nomor Urut 3 Digit] / [Kode Instansi] / [Bulan Romawi] / [Tahun]
                    </p>
                  )}
                </div>

                {/* Pejabat Penanda Tangan */}
                <div>
                  <label className="block text-xs font-semibold text-[#44403c]  uppercase tracking-wider mb-1">
                    Pejabat Penanda Tangan (TTD) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={pejabatTTD}
                    onChange={(e) => setPejabatTTD(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f8f7f3]  border border-[#d9d5cb]  rounded-lg text-xs text-[#292524]  font-medium focus:outline-none focus:border-[#b32d32] cursor-pointer"
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

            {/* Catatan Verifikasi / Alasan Penolakan */}
            <div className="pt-2 border-t border-[#e7e4dc] ">
              <label className="block text-xs font-semibold text-[#44403c]  uppercase tracking-wider mb-1">
                {statusAction === 'ditolak' ? (
                  <>
                    Alasan Penolakan (Wajib Diisi) <span className="text-red-500">*</span>
                  </>
                ) : (
                  'Catatan Verifikasi / Pesan untuk Pemohon'
                )}
              </label>
              <textarea
                rows={3}
                value={catatanVerifikasi}
                onChange={(e) => setCatatanVerifikasi(e.target.value)}
                placeholder={
                  statusAction === 'ditolak'
                    ? 'Tuliskan secara jelas mengapa permohonan ini ditolak (misal: Foto KTP buram, Surat Pengantar RT/RW belum dilampirkan, dsb)...'
                    : 'Catatan tambahan atau instruksi pengambilan surat asli di kantor kelurahan...'
                }
                className="w-full p-2.5 bg-[#f8f7f3]  border border-[#d9d5cb]  rounded-lg text-xs text-[#292524]  focus:outline-none focus:border-[#b32d32]"
              />
              <p className="text-xs text-[#78716c] mt-1">
                Pesan ini dapat dilihat oleh pemohon saat mengecek kode tiket di portal publik.
              </p>
            </div>

            {/* Action Buttons Submit */}
            <div className="pt-3 flex items-center justify-end gap-2.5">
              <Link
                to="/admin/submissions"
                className="px-4 py-2 bg-white  hover:bg-[#f8f7f3]  border border-[#d9d5cb]  text-[#44403c]  rounded-2xl font-semibold transition-colors"
              >
                Kembali
              </Link>
              <button
                type="submit"
                disabled={!statusAction || (statusAction === 'selesai' && (officialsLoading || !!officialsError || !officials.length)) || submitting || (statusAction === 'selesai' && isDuplicateNumber)}
                className={`px-5 py-2 rounded-lg font-semibold text-white shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                  statusAction === 'ditolak'
                    ? 'bg-[#b32d32] hover:bg-[#92252a]'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {submitting ? (
                  <Spinner size="xs" color="white" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>
                  {!statusAction ? 'Pilih keputusan terlebih dahulu' : statusAction === 'ditolak' ? 'Konfirmasi Tolak Permohonan' : 'Setujui & Terbitkan Surat'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Riwayat Jejak Audit (Audit Trail Timeline) */}
      <div className="bg-white  border border-[#e7e4dc] bg-white rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-[#f8f7f3]/70  border-b border-[#e7e4dc]  flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#44403c] " />
            <h3 className="text-sm font-semibold text-[#292524] ">
              Audit Trail & Riwayat Aktivitas Permohonan
            </h3>
          </div>
          <span className="text-xs text-[#78716c]">Total: {logs.length} catatan</span>
        </div>

        <div className="p-5">
          {logs.length === 0 ? (
            <p className="text-xs text-[#78716c]  italic py-2">
              Belum ada riwayat aktivitas yang tercatat untuk permohonan ini.
            </p>
          ) : (
            <div className="relative border-l-2 border-[#e7e4dc]  ml-3 space-y-4 py-1">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-6">
                  <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-white  border-2 border-[#b32d32] " />
                  <div className="bg-[#f8f7f3]  p-3 rounded-lg border border-[#e7e4dc] ">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <p className="font-bold text-[#292524] ">
                        {log.adminName}
                        <span className="font-normal text-[#78716c] ml-1.5">
                          ({log.action})
                        </span>
                      </p>
                      <span className="text-[#78716c] font-mono text-xs">
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <p className="text-xs text-[#44403c]  mt-1 leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {previewFile && <DocumentPreview key={previewFile.storageId || previewFile.name} file={previewFile} onClose={() => setPreviewFile(null)} />}
      {/* Modal Dialog Konfirmasi Aksi */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        loading={submitting}
        type={statusAction === 'ditolak' ? 'danger' : 'success'}
        title={statusAction === 'ditolak' ? 'Konfirmasi Penolakan Surat' : 'Konfirmasi Penerbitan Surat'}
        message={
          statusAction === 'ditolak'
            ? `Apakah Anda yakin ingin MENOLAK permohonan dari ${submission.nama}? Alasan penolakan akan dikirimkan kepada pemohon.`
            : `Apakah Anda yakin ingin MENYETUJUI dan menerbitkan surat resmi dengan Nomor: ${nomorSurat} atas nama ${submission.nama}?`
        }
        confirmText={statusAction === 'ditolak' ? 'Ya, Tolak Permohonan' : 'Ya, Terbitkan Surat'}
        cancelText="Batalkan"
      />
    </div>
  );
}




