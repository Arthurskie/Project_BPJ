import React, { useEffect, useState } from 'react';
import authAPI from '../../services/authAPI';
import { useAuth } from '../../contexts/useAuth';
export default function Settings() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [email, setEmail] = useState('');
  const [nama, setNama] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { let active = true; authAPI.listAdmins().then(res => { if (active) setAdmins(res.data); }).catch(err => { if (active) setError(err.message); }); return () => { active = false; }; }, []);
  const changeRole = async (profile, role) => {
    if (profile.id === user?.id || profile.role === role || !window.confirm('Ubah peran akun ' + profile.email + ' menjadi ' + role + '?')) return;
    setBusy(true); setError(''); setMessage('');
    try { await authAPI.setRole(profile.id, role); const res = await authAPI.listAdmins(); setAdmins(res.data); setMessage('Peran akun berhasil diperbarui.'); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const invite = async event => { event.preventDefault(); setBusy(true); setError(''); setMessage(''); try { await authAPI.inviteAdmin({ email, nama }); setMessage('Undangan admin berhasil dikirim. Penerima harus menggunakan tautan email untuk mengaktifkan akun.'); setEmail(''); setNama(''); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <div className="max-w-4xl space-y-6"><header><h1 className="text-2xl font-semibold">Pengaturan</h1><p className="mt-2 text-sm text-slate-600">Akun administrator dan ketersediaan layanan.</p></header>{error && <p role="alert" className="text-red-700">{error}</p>}{message && <p role="status">{message}</p>}<section className="rounded-xl border bg-white p-6 space-y-5"><h2 className="font-semibold">Akun dan Peran</h2><p className="text-sm text-slate-600">Perubahan peran memengaruhi akses administrator. Peran akun sendiri tidak dapat diubah dari halaman ini.</p><ul className="divide-y">{admins.map(admin => <li className="py-3" key={admin.id}><p>{admin.nama || admin.email}</p><p className="text-sm text-slate-600">{admin.email} / {admin.is_active ? 'Aktif' : 'Nonaktif'}</p><label className="mt-2 block text-sm">Peran akun<select aria-label={'Peran ' + admin.email} className="ml-3 border rounded-lg p-2" disabled={busy || admin.id === user?.id} value={admin.role} onChange={event => changeRole(admin, event.target.value)}><option value="guest">Guest</option><option value="admin">Admin</option></select></label></li>)}</ul><form onSubmit={invite} className="space-y-4"><h3 className="font-medium">Undang administrator</h3><label className="block">Nama<input required minLength={3} maxLength={120} className="block mt-2 border rounded-lg p-3 w-full" value={nama} onChange={e => setNama(e.target.value)}/></label><label className="block">Email<input required type="email" className="block mt-2 border rounded-lg p-3 w-full" value={email} onChange={e => setEmail(e.target.value)}/></label><button disabled={busy} className="bg-slate-900 text-white rounded-lg px-4 py-2">{busy ? 'Mengirim…' : 'Kirim Undangan Admin'}</button></form></section><section className="rounded-xl border p-6 space-y-3"><h2 className="font-semibold">Konfigurasi layanan</h2><p className="text-sm text-slate-600">Penerbitan dan penomoran dokumen resmi tidak tersedia. Notifikasi pemohon otomatis belum diaktifkan.</p><p className="text-sm text-slate-600">Konfigurasi keamanan, penyimpanan, pemindaian lampiran, dan email dikelola oleh operator server; tidak dapat diubah dari peramban.</p></section></div>;
}
