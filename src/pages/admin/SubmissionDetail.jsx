import React, { useState, useEffect } from 'react';
import { observeRequest } from '../../utils/observeRequest';
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

const OFFICIALS = [
  { name: 'Budi Santoso, S.STP', nip: '198503152010011002', role: 'Lurah Cikarang' },
  { name: 'Dra. Hj. Maryati, M.Si', nip: '197904122005012003', role: 'Sekretaris Kelurahan' },
  { name: 'Ahmad Zaelani, S.AP', nip: '199002172014031001', role: 'Kepala Seksi Pelayanan Umum' }
];

export default function SubmissionDetail() {
  const { id } = useParams();
  return <SubmissionDetailContent key={id} id={id} />;
}

function SubmissionDetailContent({ id }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [submission, setSubmission] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatingNumber, setGeneratingNumber] = useState(false);
  const [alert, setAlert] = useState(null);

  // Form Verifikasi
  const [statusAction, setStatusAction] = useState('selesai'); // 'selesai' | 'ditolak'
  const [nomorSurat, setNomorSurat] = useState('');
  const [pejabatTTD, setPejabatTTD] = useState(OFFICIALS[0].name);
  const [catatanVerifikasi, setCatatanVerifikasi] = useState('');
  const [isDuplicateNumber, setIsDuplicateNumber] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const [reloadVersion, setReloadVersion] = useState(0);
  const loadData = () => {
    setLoading(true);
    setReloadVersion(version => version + 1);
  };

  useEffect(() => {
    const request = submissionAPI.getSubmissionById(id).then((res) => {
      if (!res.success || !res.data) return null;
      return { data: res.data };
    });
    return observeRequest(request, {
      success: (result) => {
        if (!result) return;
        setSubmission(result.data);
        setNomorSurat(result.data.nomorSurat || '');
        setPejabatTTD(result.data.pejabatTTD || OFFICIALS[0].name);
        setCatatanVerifikasi(result.data.catatanVerifikasi || '');

      },
      error: (err) => setAlert({
        type: 'error',
        message: err.message || 'Gagal memuat data permohonan surat.'
      }),
      complete: () => setLoading(false)
    });
  }, [id, reloadVersion]);

  useEffect(() => {
    if (!submission?.trackingCode) return;
    return observeRequest(auditLogAPI.getLogsByTarget(submission.trackingCode), {
      success: (res) => {
        if (res.success) setLogs(res.data || []);
      },
      error: (err) => setAlert({
        type: 'error',
        message: err.message || 'Gagal memuat riwayat permohonan surat.'
      })
    });
  }, [submission]);

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
    if (statusAction === 'selesai') {
      if (!nomorSurat.trim()) {
        setAlert({ type: 'error', message: 'Nomor Surat Resmi wajib diisi sebelum menyetujui surat.' });
        return;
      }
      if (isDuplicateNumber) {
        setAlert({ type: 'error', message: 'Nomor Surat tersebut sudah pernah digunakan. Silakan generate nomor baru.' });
        return;
      }
      if (!pejabatTTD) {
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
    const selectedOfficial = OFFICIALS.find((o) => o.name === pejabatTTD) || OFFICIALS[0];
    const html = letterGeneratorAPI.generateLetterHTML({
      nomorSurat: nomorSurat || submission.nomorSurat || '470 / 001 / KEL.CKR / XI / 2026',
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
    const selectedOfficial = OFFICIALS.find((o) => o.name === pejabatTTD) || OFFICIALS[0];
    const html = letterGeneratorAPI.generateLetterHTML({
      nomorSurat: nomorSurat || submission.nomorSurat || '470 / 001 / KEL.CKR / XI / 2026',
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
            <Clock className="w-3.5 h-3.5" />
            Menunggu Verifikasi
          </span>
        );
      case 'diproses':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Sedang Diproses
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Selesai / Terbit
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40">
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
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Permohonan Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 dark:text-neutral-400">
          Berkas permohonan dengan ID tersebut tidak ditemukan dalam sistem.
        </p>
        <Link
          to="/admin/submissions"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-semibold"
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
            className="p-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 rounded-lg transition-colors cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
                Verifikasi Permohonan Surat
              </h2>
              {getStatusBadge(submission.status)}
            </div>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Kode Tiket:{' '}
              <span className="font-mono font-bold text-red-700 dark:text-red-400">
                {submission.trackingCode}
              </span>{' '}
              &bull; Sumber:{' '}
              <span className="font-semibold text-slate-700 dark:text-neutral-300">
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
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadWord}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
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
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-700 dark:text-neutral-300" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-neutral-200">
              Data Pemohon & Berkas Pengajuan
            </h3>
          </div>

          <div className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-neutral-800">
              <div>
                <span className="text-[11px] font-medium text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                  Nama Lengkap Pemohon
                </span>
                <p className="font-bold text-sm text-slate-900 dark:text-white">{submission.nama}</p>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                  Nomor Induk Kependudukan (NIK)
                </span>
                <p className="font-mono font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded inline-block">
                  {submission.nik}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-neutral-800">
              <div>
                <span className="text-[11px] font-medium text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                  Jenis Surat Permohonan
                </span>
                <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-red-600" />
                  {submission.jenisSurat}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                  Nomor Kontak / WhatsApp
                </span>
                <p className="font-semibold text-slate-800 dark:text-neutral-200">{submission.noHp || '-'}</p>
              </div>
            </div>

            <div className="pb-4 border-b border-slate-100 dark:border-neutral-800">
              <span className="text-[11px] font-medium text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                Alamat Domisili KTP
              </span>
              <p className="text-slate-700 dark:text-neutral-300 leading-relaxed">{submission.alamat || '-'}</p>
            </div>

            <div className="pb-4 border-b border-slate-100 dark:border-neutral-800">
              <span className="text-[11px] font-medium text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-1">
                Keperluan / Keterangan Pengajuan
              </span>
              <div className="p-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg text-slate-800 dark:text-neutral-200">
                {submission.keperluan || '-'}
              </div>
            </div>

            {/* Berkas Lampiran Syarat */}
            <div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-neutral-500 uppercase tracking-wider block mb-2">
                Dokumen Lampiran Warga ({submission.files?.length || 0})
              </span>
              {submission.files && submission.files.length > 0 ? (
                <div className="space-y-1.5">
                  {submission.files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium text-slate-800 dark:text-neutral-200 truncate">
                          {file.name || `Lampiran_${idx + 1}.pdf`}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {file.size ? `${(file.size / 1024).toFixed(0)} KB` : 'Dokumen'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 dark:text-neutral-500 italic">
                  Tidak ada file lampiran digital yang disertakan.
                </p>
              )}
            </div>

            {/* Waktu Masuk & Petugas Verifikator Terakhir */}
            <div className="pt-2 text-[11px] text-slate-500 dark:text-neutral-400 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Masuk: {new Date(submission.createdAt).toLocaleString('id-ID')}</span>
              </div>
              {submission.verifiedBy && (
                <span className="font-medium text-slate-700 dark:text-neutral-300">
                  Petugas: {submission.verifiedBy}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Form Pemrosesan & Verifikasi Internal Admin */}
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-red-700 dark:text-red-400" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-neutral-200">
                Panel Verifikasi & Keputusan
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">RBAC: Petugas / Admin</span>
          </div>

          <form onSubmit={handleSubmitPrompt} className="p-5 space-y-4 text-xs">
            {/* Pilihan Keputusan Status */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                Keputusan Status Surat <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                    statusAction === 'selesai'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 font-semibold'
                      : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800/40 text-slate-600 dark:text-neutral-400'
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
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-300 font-semibold'
                      : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800/40 text-slate-600 dark:text-neutral-400'
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
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-neutral-800">
                {/* Nomor Surat Resmi */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">
                      Nomor Surat Resmi Instansi <span className="text-red-500">*</span>
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
                    value={nomorSurat}
                    onChange={(e) => setNomorSurat(e.target.value)}
                    placeholder="Contoh: 470 / 001 / KEL.CKR / XI / 2026"
                    className={`w-full px-3 py-2 font-mono bg-slate-50 dark:bg-neutral-950 border rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none transition-colors ${
                      isDuplicateNumber
                        ? 'border-red-500 focus:border-red-600 ring-1 ring-red-500'
                        : 'border-slate-300 dark:border-neutral-700 focus:border-red-600'
                    }`}
                  />
                  {isDuplicateNumber ? (
                    <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Nomor surat ini sudah terdaftar pada surat lain. Mohon gunakan nomor urut berbeda.
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1">
                      Format: 470 / [Nomor Urut 3 Digit] / [Kode Instansi] / [Bulan Romawi] / [Tahun]
                    </p>
                  )}
                </div>

                {/* Pejabat Penanda Tangan */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                    Pejabat Penanda Tangan (TTD) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={pejabatTTD}
                    onChange={(e) => setPejabatTTD(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-lg text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-red-600 cursor-pointer"
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

            {/* Catatan Verifikasi / Alasan Penolakan */}
            <div className="pt-2 border-t border-slate-100 dark:border-neutral-800">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
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
                className="w-full p-2.5 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-red-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Pesan ini dapat dilihat oleh pemohon saat mengecek kode tiket di portal publik.
              </p>
            </div>

            {/* Action Buttons Submit */}
            <div className="pt-3 flex items-center justify-end gap-2.5">
              <Link
                to="/admin/submissions"
                className="px-4 py-2 bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 rounded-lg font-semibold transition-colors"
              >
                Kembali
              </Link>
              <button
                type="submit"
                disabled={submitting || (statusAction === 'selesai' && isDuplicateNumber)}
                className={`px-5 py-2 rounded-lg font-semibold text-white shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                  statusAction === 'ditolak'
                    ? 'bg-red-700 hover:bg-red-800'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {submitting ? (
                  <Spinner size="xs" color="white" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>
                  {statusAction === 'ditolak' ? 'Konfirmasi Tolak Permohonan' : 'Setujui & Terbitkan Surat'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Riwayat Jejak Audit (Audit Trail Timeline) */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-700 dark:text-neutral-300" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-neutral-200">
              Audit Trail & Riwayat Aktivitas Permohonan
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Total: {logs.length} catatan</span>
        </div>

        <div className="p-5">
          {logs.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-neutral-500 italic py-2">
              Belum ada riwayat aktivitas yang tercatat untuk permohonan ini.
            </p>
          ) : (
            <div className="relative border-l-2 border-slate-200 dark:border-neutral-800 ml-3 space-y-4 py-1">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-6">
                  <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-white dark:bg-neutral-900 border-2 border-red-700 dark:border-red-500" />
                  <div className="bg-slate-50 dark:bg-neutral-950/60 p-3 rounded-lg border border-slate-200 dark:border-neutral-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {log.adminName}
                        <span className="font-normal text-slate-500 ml-1.5">
                          ({log.action})
                        </span>
                      </p>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-neutral-300 mt-1 leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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

