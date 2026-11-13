import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Shield, Database, CheckCircle2 } from 'lucide-react';
import Alert from '../../components/Alert';

export default function Settings() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [emailNotif, setEmailNotif] = useState(true);
  const [autoNumbering, setAutoNumbering] = useState(true);
  const [alert, setAlert] = useState(null);

  const handleSave = () => {
    setAlert({
      type: 'success',
      message: 'Preferensi sistem berhasil disimpan.'
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-slate-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Pengaturan Sistem
        </h2>
        <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
          Konfigurasi preferensi tampilan, pemberitahuan layanan, dan parameter kedinasan.
        </p>
      </div>

      {alert && (
        <Alert type={alert.type} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <div className="space-y-4">
        {/* Pengaturan Tampilan */}
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            {darkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Tema Antarmuka
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">
            Pilih mode tampilan layar yang nyaman untuk bertugas.
          </p>
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-neutral-950 rounded-lg border border-slate-200 dark:border-neutral-800">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-white">
                {darkMode ? 'Mode Gelap (Dark Mode)' : 'Mode Terang (Light Mode)'}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-0.5">
                Mengubah palet warna sistem secara menyeluruh.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                darkMode ? 'bg-red-700' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-xs ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Parameter Kedinasan */}
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-red-700 dark:text-red-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Parameter Penomoran Surat
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-neutral-950 rounded-lg border border-slate-200 dark:border-neutral-800">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-white">
                  Auto-generate Nomor Urut Otomatis
                </p>
                <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-0.5">
                  Secara otomatis membuat nomor surat berformat <code>470 / [Seq] / KEL.CKR / [Bulan] / [Tahun]</code> saat diverifikasi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoNumbering(!autoNumbering)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  autoNumbering ? 'bg-red-700' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-xs ${
                    autoNumbering ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-neutral-950 rounded-lg border border-slate-200 dark:border-neutral-800">
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-white">
                  Notifikasi Email Petugas
                </p>
                <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-0.5">
                  Menerima pemberitahuan email kedinasan saat permohonan baru masuk dari warga.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotif(!emailNotif)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  emailNotif ? 'bg-red-700' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-xs ${
                    emailNotif ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Database & Penyimpanan */}
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Data & Penyimpanan
            </h3>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-neutral-950 rounded-lg border border-slate-200 dark:border-neutral-800 text-xs text-slate-600 dark:text-neutral-400">
            <div className="flex items-center justify-between">
              <span>Status Penyimpanan Lokal:</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={13} />
                Tersinkronisasi
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Data surat dinas, log audit, dan pengguna tersimpan dengan aman pada storage lokal browser.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Simpan Konfigurasi
          </button>
        </div>
      </div>
    </div>
  );
}
