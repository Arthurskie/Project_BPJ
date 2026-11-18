import React, { useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import authAPI from '../../services/authAPI';
export default function Profile() {
  const { user } = useAuth();
  const [nama, setNama] = useState(user?.nama || user?.name || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async event => { event.preventDefault(); setBusy(true); setError(''); setMessage(''); try { await authAPI.updateProfile({ nama }); setMessage('Nama profil tersimpan. Muat ulang sesi untuk memperbarui nama di navigasi.'); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  const recover = async () => { setBusy(true); setError(''); try { await authAPI.recoverPassword(user.email); setMessage('Jika akun terdaftar, instruksi pemulihan dikirim melalui email.'); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <div className="max-w-4xl space-y-6"><header><h1 className="text-2xl font-semibold">Profil Pegawai</h1><p className="mt-2 text-sm text-slate-600">Informasi akun administrator yang sedang digunakan.</p></header>{error && <p role="alert" className="text-red-700">{error}</p>}{message && <p role="status">{message}</p>}<section className="rounded-xl border bg-white p-6 space-y-5"><h2 className="font-semibold">Data akun</h2><dl className="grid sm:grid-cols-2 gap-4">{[['Email',user?.email],['Peran',user?.role],['Status',user?.is_active === false ? 'Nonaktif' : 'Aktif']].map(([label,value]) => <div key={label}><dt className="text-sm text-slate-600">{label}</dt><dd>{value || '—'}</dd></div>)}</dl><form onSubmit={save} className="space-y-4"><label className="block">Nama<input required minLength={3} maxLength={120} className="mt-2 block border rounded-lg p-3 w-full" value={nama} onChange={e => setNama(e.target.value)}/></label><button disabled={busy} className="bg-slate-900 text-white rounded-lg px-4 py-2">Simpan Profil</button></form></section><section className="rounded-xl border p-6 space-y-4"><h2 className="font-semibold">Keamanan akun</h2><p className="text-sm text-slate-600">Pemulihan kata sandi menggunakan email akun, bukan perubahan kata sandi oleh petugas lain.</p><button disabled={busy || !user?.email} className="border rounded-lg px-4 py-2" onClick={recover}>Kirim Email Pemulihan</button></section></div>;
}
