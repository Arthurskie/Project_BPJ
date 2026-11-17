import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

export default function ForgotPassword() {
  const { forgotPassword, updatePassword, passwordRecovery } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [complete, setComplete] = useState(false);
  const requested = ['recovery', 'invite'].includes(new URLSearchParams(window.location.search).get('mode'));
  const updating = passwordRecovery || requested;
  async function submit(event) {
    event.preventDefault();
    setError(''); setMessage('');
    if (updating && (password.length < 8 || password !== confirmation)) {
      setError('Kata sandi minimal 8 karakter dan konfirmasi harus sama.'); return;
    }
    setBusy(true);
    try {
      if (updating) {
        await updatePassword(password); setComplete(true);
        setMessage('Kata sandi telah disimpan. Silakan masuk kembali.');
        window.history.replaceState(null, '', '/forgot-password');
      } else {
        const result = await forgotPassword(email); setMessage(result.message);
      }
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  const field = 'w-full rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 mt-1';
  return <div className="max-w-md mx-auto rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 sm:p-8">
    <h2 className="text-xl font-bold">{updating ? 'Atur Kata Sandi' : 'Lupa Kata Sandi'}</h2>
    <p className="text-sm text-slate-600 dark:text-neutral-300 mt-2">{updating ? 'Gunakan tautan undangan atau pemulihan yang dikirim oleh sistem.' : 'Masukkan email kedinasan untuk meminta tautan pemulihan.'}</p>
    {error && <p role="alert" className="mt-4 text-sm text-red-700 dark:text-red-300">{error}</p>}
    {message && <p role="status" className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}
    {!complete && <form onSubmit={submit} className="mt-5 space-y-4">
      {updating ? <>
        <label className="block text-sm">Kata sandi baru<input className={field} required minLength={8} type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} /></label>
        <label className="block text-sm">Konfirmasi kata sandi<input className={field} required minLength={8} type="password" autoComplete="new-password" value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label>
      </> : <label className="block text-sm">Email kedinasan<input className={field} required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>}
      <button disabled={busy} className="w-full rounded-lg bg-red-700 hover:bg-red-800 text-white px-4 py-2 disabled:opacity-50">{busy ? 'Memproses...' : updating ? 'Simpan Kata Sandi' : 'Kirim Tautan Pemulihan'}</button>
    </form>}
    <Link to="/login" className="inline-block mt-5 text-sm underline">Kembali ke halaman masuk</Link>
  </div>;
}
