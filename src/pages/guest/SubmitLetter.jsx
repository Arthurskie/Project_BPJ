import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Paperclip, X } from 'lucide-react';

const SubmitLetter = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState('');
  const nameInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (nameInputRef.current && !isSuccess) {
      nameInputRef.current.focus();
    }
  }, [isSuccess]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const clearFile = () => {
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setFileName('');
  };

  const inputClass = "block w-full px-3 py-2.5 border border-slate-200 dark:border-neutral-700 rounded-lg text-sm bg-white dark:bg-neutral-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400 transition-colors";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 transition-colors">
      {/* Top bar */}
      <div className="border-b border-slate-200 dark:border-neutral-800 bg-white dark:bg-black">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Form Pengajuan Surat
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
            Lengkapi data berikut untuk mengajukan surat. Kolom bertanda <span className="text-red-500">*</span> wajib diisi.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl">
          {isSuccess ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Pengajuan Berhasil Dikirim</h3>
              <p className="text-sm text-slate-500 dark:text-neutral-400 mb-6 max-w-sm mx-auto">
                Surat Anda telah masuk ke sistem dan akan diproses oleh petugas terkait.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/guest')}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Kembali ke Beranda
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-slate-800 dark:hover:bg-neutral-100 transition-colors"
                >
                  Buat Pengajuan Lain
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                {/* Nama & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="nama" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={nameInputRef}
                      id="nama"
                      name="nama"
                      type="text"
                      required
                      className={inputClass}
                      placeholder="Nama sesuai identitas"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className={inputClass}
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>

                {/* Perihal */}
                <div>
                  <label htmlFor="perihal" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">
                    Perihal <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="perihal"
                    name="perihal"
                    type="text"
                    required
                    className={inputClass}
                    placeholder="Contoh: Permohonan Cuti Tahunan"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">
                    Lampiran Dokumen <span className="text-red-500">*</span>
                  </label>
                  {fileName ? (
                    <div className="flex items-center justify-between px-3 py-2.5 border border-slate-200 dark:border-neutral-700 rounded-lg bg-slate-50 dark:bg-neutral-900">
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip size={14} className="text-slate-400 shrink-0" />
                        <span className="text-sm text-slate-700 dark:text-neutral-300 truncate">{fileName}</span>
                      </div>
                      <button type="button" onClick={clearFile} className="text-slate-400 hover:text-red-500 transition-colors shrink-0 ml-2">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-slate-300 dark:border-neutral-700 rounded-lg px-4 py-6 text-center cursor-pointer hover:border-slate-400 dark:hover:border-neutral-600 transition-colors"
                    >
                      <Upload size={20} className="mx-auto mb-2 text-slate-400 dark:text-neutral-500" />
                      <p className="text-sm text-slate-600 dark:text-neutral-400">
                        Klik untuk memilih file
                      </p>
                      <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">
                        PDF, DOC, DOCX — Maks. 10 MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    required={!fileName}
                    onChange={handleFileChange}
                  />
                </div>

                {/* Keterangan */}
                <div>
                  <label htmlFor="keterangan" className="block text-sm font-medium text-slate-700 dark:text-neutral-300 mb-1.5">
                    Catatan <span className="text-slate-400 dark:text-neutral-500 font-normal">(opsional)</span>
                  </label>
                  <textarea
                    id="keterangan"
                    name="keterangan"
                    rows={3}
                    className={inputClass}
                    placeholder="Informasi tambahan terkait pengajuan"
                    defaultValue={''}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-slate-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-slate-800 dark:hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitLetter;
