import { applicantErrors } from '../../domain/workflow.js';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  Paperclip,
  X,
  ArrowRight,
  CheckCircle2,
  Printer,
  ShieldCheck,
  QrCode,
  Search,
  AlertCircle
} from 'lucide-react';
import GuestNavbar from '../../components/GuestNavbar';
import { GarudaLogo } from '../../components/IndonesiaSeal';
import './landing.css';
import './submit-letter.css';
import submissionAPI from '../../services/submissionAPI';
import letterTypeAPI from '../../services/letterTypeAPI';

const SubmitLetter = () => {
  const navigate = useNavigate();
  const [letterTypes] = useState(() => letterTypeAPI.getActive());
  const submitLock = useRef(false);
  const [reviewing, setReviewing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [copyMessage, setCopyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    nik: '',
    nama: '',
    email: '',
    telepon: '',
    alamat: '',
    jenisSurat: letterTypes[0]?.name || '',
    perihal: '',
    keterangan: '',
  });

  const [fileError, setFileError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [registrationData, setRegistrationData] = useState(null);
  const fileInputRef = useRef(null);
  const nikInputRef = useRef(null);

  useEffect(() => {
    if (!isSuccess && nikInputRef.current) nikInputRef.current.focus();
    if (isSuccess) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReviewing(false);
    // Khusus NIK hanya angka
    if (name === 'nik') {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 16) }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setReviewing(false);
    const file = e.target.files[0];
    if (!file) return;
    setFileError('');
    const extension = file.name.split('.').pop().toLowerCase();
    const allowed = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
    if (!allowed[extension] || (file.type && file.type !== allowed[extension]) || file.size > 10 * 1024 * 1024) {
      clearFile();
      setFileError('Pilih berkas PNG, JPG, PDF, DOC, atau DOCX dengan ukuran maksimal 10 MB.');
      return;
    }
    setSelectedFile(file);
    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
  };

  const clearFile = () => {
    setReviewing(false);
    setFileError('');
    setSelectedFile(null);
    setFileName('');
    setFileSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLock.current) return;
    setErrorMsg('');
    const errors = applicantErrors({...formData, keperluan:formData.perihal}, letterTypeAPI.getActive().map(item => item.name));
    setFieldErrors(errors);
    if (Object.keys(errors).length) { setReviewing(false); return; }
    if (!reviewing) { setReviewing(true); return; }
    if (formData.nik.length !== 16) {
      setErrorMsg('NIK harus terdiri dari 16 digit angka.');
      return;
    }

    if (!letterTypeAPI.getActive().some(item => item.name === formData.jenisSurat)) {
      setErrorMsg('Pilih jenis surat aktif terlebih dahulu.');
      return;
    }
    submitLock.current = true;
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('nik', formData.nik);
      payload.append('nama_lengkap', formData.nama);
      payload.append('email', formData.email || '');
      payload.append('telepon', formData.telepon || '');
      payload.append('alamat', formData.alamat || '');
      payload.append('jenis_surat', formData.jenisSurat);
      payload.append('perihal', formData.perihal);
      payload.append('keterangan', formData.keterangan || '');
      if (selectedFile) {
        payload.append('lampiran', selectedFile);
      }

      const res = await submissionAPI.submitLetter(payload);

      const now = new Date();
      const waktu = new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(now) + ' WIB';

      setRegistrationData({
        nomorReg: res.data?.trackingCode || `SRT-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-001`,
        waktu,
        ...formData,
        fileName,
        fileSize,
      });

      setIsSuccess(true);
    } catch (err) {
      console.error('[Submit Error]:', err);
      setErrorMsg(err.message || 'Gagal mengirimkan permohonan surat. Silakan coba lagi.');
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setReviewing(false);
    setIsSuccess(false);
    setRegistrationData(null);
    setSelectedFile(null);
    setFileName('');
    setFileSize('');
    setErrorMsg('');
    setFormData({
      nik: '',
      nama: '',
      email: '',
      telepon: '',
      alamat: '',
      jenisSurat: letterTypes[0]?.name || '',
      perihal: '',
      keterangan: '',
    });
  };

  const inputClass = 'submission-input';

  return (
    <div className="landing-page submission-page min-h-screen flex flex-col">
      <GuestNavbar />

      <a href="#submission-form" className="landing-skip no-print">Langsung ke formulir</a>
      <section className="submission-intro no-print" aria-labelledby="submission-title">
        <div className="submission-shell">
          <Link to="/guest" className="submission-back">Beranda <span aria-hidden="true">/</span> Pengajuan surat</Link>
          <p className="submission-eyebrow">Layanan Persuratan</p>
          <h1 id="submission-title">Formulir pengajuan surat.</h1>
          <p>Lengkapi identitas dan kebutuhan persuratan Anda. Setelah terkirim, simpan kode tracking untuk memantau pengajuan.</p>
        </div>
      </section>

      {/* Content */}
      <main id="submission-form" className="submission-main flex-1" tabIndex={-1}>
        <div className="submission-shell submission-layout">

          <aside className="submission-guidance no-print" aria-label="Persiapan pengajuan">
            <p className="submission-eyebrow">Sebelum mengirim</p>
            <h2>Siapkan data Anda.</h2>
            <ol><li>NIK 16 digit dan nama sesuai identitas.</li><li>Kontak yang dapat dihubungi.</li><li>Perihal dan dokumen pendukung, bila diperlukan.</li></ol>
            <p>Lampiran PNG, JPG, PDF, DOC, atau DOCX maksimal 10 MB. Periksa kembali data sebelum mengirim.</p>
            <Link to="/guest/track">Sudah mengajukan? Lacak surat <ArrowRight size={16} aria-hidden="true" /></Link>
          </aside>

          {isSuccess && registrationData ? (
            <div className="submission-card bg-white border border-slate-200 overflow-hidden print-only-container">

              {/* Success banner */}
              <div className="no-print bg-emerald-600 text-white px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-semibold">Pengajuan berhasil teregistrasi secara elektronik</span>
                </div>
                <button
                  onClick={() => window.print()}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-emerald-800 rounded-md"
                >
                  <Printer size={13} />
                  Cetak Tanda Terima
                </button>
              </div>

              {/* Receipt */}
              <div className="p-4 sm:p-10 bg-white text-slate-900">

                {/* Kop */}
                <div className="border-b-2 border-slate-900 pb-4 mb-5 sm:mb-6 text-center">
                  <GarudaLogo className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2" />
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
                    Tanda Terima Pengajuan Surat
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    Portal Pelayanan Persuratan & Administrasi Terpadu
                  </p>
                </div>

                {/* Nomor registrasi / Kode Tracking */}
                <div className="text-center mb-5 sm:mb-6">
                  <p className="text-[11px] sm:text-xs text-slate-500 mb-0.5 sm:mb-1">Kode Tracking / Nomor Tiket</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-700 font-mono tracking-wide">{registrationData.nomorReg}</p><button type="button" className="underline mt-2" onClick={async () => { try { await navigator.clipboard.writeText(registrationData.nomorReg); setCopyMessage('Kode tracking disalin.'); } catch { setCopyMessage('Tidak dapat menyalin. Pilih dan salin kode di atas.'); } }}>Salin kode tracking</button><p role="status">{copyMessage}</p>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">{registrationData.waktu}</p>
                </div>

                {/* QR + note */}
                <div className="flex items-center gap-3 sm:gap-4 bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4 mb-5 sm:mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white border border-slate-200 p-1 rounded flex items-center justify-center shrink-0">
                    <QrCode className="w-10 h-10 sm:w-12 sm:h-12 text-slate-700" />
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                    <p className="font-semibold text-slate-800 flex items-center gap-1 mb-0.5">
                      <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                      Teregistrasi di Database Resmi
                    </p>
                    Gunakan kombinasi <strong>NIK ({registrationData.nik})</strong> dan <strong>Kode Tracking ({registrationData.nomorReg})</strong> untuk melacak status dokumen Anda secara real-time.
                  </div>
                </div>

                {/* Detail table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden mb-5 sm:mb-6">
                  <table className="w-full text-[11px] sm:text-xs">
                    <tbody>
                      {[
                        ['NIK Pemohon', registrationData.nik],
                        ['Nama Lengkap', registrationData.nama],
                        ['Email', registrationData.email || '-'],
                        ['Telepon', registrationData.telepon || '-'],
                        ['Alamat Domisili', registrationData.alamat || '-'],
                        ['Jenis Surat', registrationData.jenisSurat],
                        ['Perihal', registrationData.perihal],
                        ['Lampiran Berkas', registrationData.fileName ? `${registrationData.fileName} (${registrationData.fileSize})` : 'Tidak ada lampiran'],
                        ['Status Pengajuan', 'Menunggu Verifikasi (Pending)'],
                        ['Estimasi Layanan', '1Ã—24 jam kerja'],
                      ].map(([label, value], i) => (
                        <tr key={i} className="border-b border-slate-200 last:border-b-0">
                          <td className="w-2/5 sm:w-1/3 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50 font-semibold text-slate-700">{label}</td>
                          <td className="px-3 py-2 sm:px-4 sm:py-2.5 text-slate-900 break-words">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Info */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] sm:text-xs text-amber-900">
                  <p className="font-semibold mb-1">Langkah selanjutnya:</p>
                  <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
                    <li>Simpan Kode Tracking <strong>{registrationData.nomorReg}</strong>.</li>
                    <li>Pantau status melalui menu <strong>Lacak Status</strong> dengan memasukkan NIK & Kode Tracking.</li>
                    <li>Surat balasan atau pemberitahuan akan dikirim ke email: <strong>{registrationData.email || 'Email Anda'}</strong>.</li>
                  </ol>
                </div>

              </div>

              {/* Actions */}
              <div className="no-print bg-slate-50 px-4 sm:px-8 py-3.5 sm:py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
                <button
                  onClick={() => navigate('/guest')}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors text-center"
                >
                  â† Kembali ke Beranda
                </button>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Link
                    to="/guest/track"
                    className="flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:scale-[0.98] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Search size={14} />
                    Lacak Status
                  </Link>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:scale-[0.98] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Printer size={14} />
                    Cetak
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 sm:flex-none px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-red-700 hover:bg-red-800 active:scale-[0.98] rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    Ajukan Lagi
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* ── Form Pengajuan ── */
            <div className="submission-card bg-white border border-slate-200 overflow-hidden">


              {/* Form header */}
              <div className="px-4 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-slate-100 ">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-0.5 sm:mb-1">
                  Detail Pengajuan Surat
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 ">
                  Kolom bertanda <span className="text-red-500 font-medium">*</span> wajib diisi dengan benar.
                </p>
              </div>

              {errorMsg && (
                <div role="alert" className="mx-4 sm:mx-8 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
<section className="p-5 border-b" aria-label="Persyaratan layanan"><h2 className="font-semibold">Persyaratan {formData.jenisSurat}</h2><ul className="list-disc pl-5 text-sm">{letterTypes.find(item => item.name === formData.jenisSurat)?.requirements.map(item => <li key={item}>{item}</li>)}</ul><p className="text-sm mt-2">Siapkan berkas sesuai persyaratan. Data demo tersimpan hanya pada browser ini.</p></section>
{Object.keys(fieldErrors).length > 0 && <div role="alert" className="p-5 text-red-700"><h2>Periksa isian berikut:</h2>{Object.entries(fieldErrors).map(([key,value]) => <p key={key} id={'error-'+key}><a href={'#'+(key === 'keperluan' ? 'perihal' : key)}>{value}</a></p>)}</div>}
{reviewing && <section className="p-5 border-2 border-red-700" aria-label="Tinjau permohonan"><h2 className="font-bold">Tinjau sebelum mengirim</h2><dl>{Object.entries({NIK:formData.nik,Nama:formData.nama,Alamat:formData.alamat,Layanan:formData.jenisSurat,Email:formData.email || 'Tidak dicantumkan',Telepon:formData.telepon || 'Tidak dicantumkan',Keperluan:formData.perihal,Keterangan:formData.keterangan || 'Tidak dicantumkan',Lampiran:fileName || 'Tidak ada'}).map(([key,value]) => <div key={key}><dt className="font-semibold">{key}</dt><dd>{value}</dd></div>)}</dl><button type="button" className="underline mt-3" onClick={() => setReviewing(false)}>Ubah isian</button></section>}

                <div className="px-4 sm:px-8 py-5 sm:py-6 space-y-4 sm:space-y-5">

                  <h3 className="submission-section-title"><span>01</span> Identitas pemohon</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nik" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
                      </label>
                      <input
                        ref={nikInputRef}
                        id="nik"
                        name="nik" aria-invalid={Boolean(fieldErrors.nik)} aria-describedby={fieldErrors.nik ? 'error-nik' : undefined}
                        type="text"
                        inputMode="numeric"
                        maxLength={16}
                        required
                        value={formData.nik}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="16 digit angka sesuai KTP"
                      />
                    </div>
                    <div>
                      <label htmlFor="nama" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="nama"
                        name="nama" aria-invalid={Boolean(fieldErrors.nama)} aria-describedby={fieldErrors.nama ? 'error-nama' : undefined}
                        type="text"
                        required
                        value={formData.nama}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Nama lengkap pemohon"
                      />
                    </div>
                  </div>

                  {/* Email & Telepon */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">
                        Alamat Email (opsional)

                      </label>
                      <input
                        id="email"
                        name="email" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'error-email' : undefined}
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="nama@email.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="telepon" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Nomor WhatsApp / HP
                      </label>
                      <input
                        id="telepon"
                        name="telepon"
                        type="tel"
                        value={formData.telepon}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>
                  </div>

                  {/* Asal Instansi & Jenis Surat */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="alamat" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">
                        Alamat Domisili <span className="text-red-500">*</span>

                      </label>
                      <input
                        id="alamat"
                        name="alamat" aria-invalid={Boolean(fieldErrors.alamat)} aria-describedby={fieldErrors.alamat ? 'error-alamat' : undefined}
                        type="text"
                        required
                        value={formData.alamat}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Jalan, nomor rumah, RT/RW, kelurahan"
                      />
                    </div>
                    <div>
                      <label htmlFor="jenisSurat" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Jenis Surat <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="jenisSurat"
                        name="jenisSurat" aria-invalid={Boolean(fieldErrors.jenisSurat)} aria-describedby={fieldErrors.jenisSurat ? 'error-jenisSurat' : undefined}
                        value={formData.jenisSurat}
                        onChange={handleChange}
                        className={inputClass}
                        required
                      >
                        <option value="">Pilih jenis surat</option>{letterTypes.map(type => <option key={type.id} value={type.name}>{type.name}</option>)}
                      </select>
                      {letterTypes.find(type => type.name === formData.jenisSurat) && <div className="mt-3 text-xs text-slate-500"><p className="font-medium">Persyaratan:</p><ul className="list-disc pl-4">{letterTypes.find(type => type.name === formData.jenisSurat).requirements.map(req => <li key={req}>{req}</li>)}</ul></div>}
                    </div>
                  </div>

                  <h3 className="submission-section-title"><span>02</span> Rincian permohonan</h3>
                  <div>
                    <label htmlFor="perihal" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Perihal Surat <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="perihal"
                      name="perihal" aria-invalid={Boolean(fieldErrors.keperluan)} aria-describedby={fieldErrors.keperluan ? 'error-keperluan' : undefined}
                      type="text"
                      required
                      value={formData.perihal}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Contoh: Permohonan Izin Riset Skripsi"
                    />
                  </div>

                  {/* File Lampiran */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Lampiran Berkas Persyaratan <span className="text-slate-400 font-normal">(PDF / DOC / DOCX, maks. 10 MB)</span>
                    </label>
                    {fileName ? (
                      <div className="flex items-center justify-between px-4 py-3 border border-red-200 rounded-lg bg-red-50 ">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                            <Paperclip size={14} className="text-red-600 " />
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-medium text-slate-900 truncate">{fileName}</p>
                            <p className="text-xs text-slate-500">{fileSize}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label="Hapus berkas lampiran"
                          onClick={clearFile}
                          className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-100 transition-colors shrink-0 ml-3"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="submission-upload group border-2 border-dashed border-slate-200 rounded-lg px-4 py-7 text-center cursor-pointer hover:border-red-400 hover:bg-red-50/50 transition-all"

                      >
                        <span className="w-10 h-10 mx-auto mb-2.5 rounded-lg bg-slate-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                          <Upload size={18} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                        </span>
                        <span className="block text-sm font-medium text-slate-600 group-hover:text-red-700 transition-colors">
                          Pilih berkas lampiran pendukung
                        </span>
                        <span className="block text-xs text-slate-400 mt-1">
                          Format: PNG, JPG, PDF, DOC, DOCX — Maksimal 10 MB
                        </span>

                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      aria-label="Berkas lampiran pendukung"
                      aria-describedby="file-error"
                      accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                    <p id="file-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{fileError}</p>
                  </div>

                  {/* Catatan / Keterangan */}
                  <div>
                    <label htmlFor="keterangan" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Catatan / Keterangan Tambahan <span className="text-slate-400 font-normal">(opsional)</span>
                    </label>
                    <textarea
                      id="keterangan"
                      name="keterangan"
                      rows={3}
                      value={formData.keterangan}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Tuliskan catatan khusus bila diperlukan"
                    />
                  </div>

                </div>

                {/* Form footer */}
                <div className="px-4 sm:px-8 py-3.5 sm:py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/guest')}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors text-center"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="submission-submit w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 text-xs sm:text-sm font-semibold text-white bg-red-700 hover:bg-red-800 active:scale-[0.98] rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Mendaftarkan Permohonan...</span>
                      </>
                    ) : (
                      <>
                        <span>{reviewing ? 'Konfirmasi & Kirim Permohonan' : 'Tinjau Permohonan'}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>&copy; {new Date().getFullYear()} Portal e-Surat</p>
          <div className="flex gap-4">
            <Link to="/guest" className="hover:text-slate-900 transition-colors">Beranda</Link>
            <Link to="/guest/track" className="hover:text-slate-900 transition-colors">Cek Status</Link>
            <Link to="/login" className="hover:text-slate-900 transition-colors">Portal Petugas</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SubmitLetter;

