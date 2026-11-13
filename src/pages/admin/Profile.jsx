import React, { useState } from 'react';
import { User, Shield, Mail, Key, Building2, BadgeCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../../components/Alert';

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [alert, setAlert] = useState(null);

  const tabs = [
    { id: 'general', label: 'Profil Pegawai', icon: User },
    { id: 'security', label: 'Keamanan Akun', icon: Shield },
  ];

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setAlert({
      type: 'success',
      message: 'Data profil berhasil diperbarui.'
    });
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setAlert({
      type: 'success',
      message: 'Kata sandi akun Anda berhasil diperbarui.'
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Profil Pegawai & Administrator
        </h2>
        <p className="text-slate-500 dark:text-neutral-400 text-xs sm:text-sm mt-1">
          Informasi identitas dinas, jabatan, dan kredensial akses sistem persuratan.
        </p>
      </div>

      {alert && (
        <Alert type={alert.type} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xs overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 p-4 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-neutral-700'
                    : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900/50 hover:text-slate-900 dark:hover:text-white border border-transparent'
                }`}
              >
                <tab.icon size={15} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8 flex-1">
          {activeTab === 'general' && (
            <form onSubmit={handleSaveProfile} className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  Data Identitas Kedinasan
                </h3>

                {/* Avatar Badge */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-red-700 text-white flex items-center justify-center text-xl font-bold shadow-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {user?.name || 'Petugas'}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 uppercase border border-red-200 dark:border-red-900/40">
                        <BadgeCheck size={12} />
                        {user?.role === 'super_admin' ? 'Super Admin' : 'Verifikator'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 font-mono">
                      NIP: {user?.nip || '198503152010011002'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-neutral-300">
                      Nama Lengkap & Gelar
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.name || 'Budi Santoso, S.STP'}
                      className="w-full bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:border-red-600 transition-colors shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-neutral-300">
                      Nomor Induk Pegawai (NIP)
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.nip || '198503152010011002'}
                      disabled
                      className="w-full bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-500 font-mono rounded-lg px-3 py-2 cursor-not-allowed shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-semibold text-slate-700 dark:text-neutral-300">
                      Alamat Email Kedinasan
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        defaultValue={user?.email || 'admin@kelurahan.go.id'}
                        disabled
                        className="w-full bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-500 rounded-lg pl-9 pr-3 py-2 cursor-not-allowed shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-semibold text-slate-700 dark:text-neutral-300">
                      Unit Kerja / Jabatan
                    </label>
                    <div className="relative">
                      <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        defaultValue={user?.department || 'Seksi Pelayanan Umum & Administrasi Kependudukan'}
                        className="w-full bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-red-600 transition-colors shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 flex justify-end">
                <button
                  type="submit"
                  className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Perubahan Profil
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleUpdatePassword} className="space-y-6 animate-fade-in text-xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  Ganti Kata Sandi Akun
                </h3>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-neutral-300">
                      Kata Sandi Saat Ini
                    </label>
                    <div className="relative">
                      <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-red-600 transition-colors shadow-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-neutral-300">
                      Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:border-red-600 transition-colors shadow-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-neutral-300">
                      Ulangi Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:border-red-600 transition-colors shadow-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 flex justify-end">
                <button
                  type="submit"
                  className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Perbarui Kata Sandi
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
