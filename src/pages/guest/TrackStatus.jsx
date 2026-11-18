import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import GuestNavbar from '../../components/GuestNavbar';
import TurnstileChallenge from '../../components/TurnstileChallenge';
import submissionAPI from '../../services/submissionAPI';
import './landing.css';
import './submit-letter.css';
export default function TrackStatus() {
 const [code,setCode]=useState(''),[secret,setSecret]=useState(''),[token,setToken]=useState(''),[resetKey,setResetKey]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState(null);
 const lock=useRef(false);
 async function track(event) {
  event.preventDefault();if(lock.current || !token)return;
  lock.current=true;setBusy(true);setError('');setResult(null);
  try {
   const response=await submissionAPI.trackStatus({kode_permohonan:code.trim(),access_secret:secret.trim(),turnstile_token:token});
   if(response?.success===false || response?.error)throw new Error('refused');
   const data=response?.data || response;
   if(!data?.status)throw new Error('refused');
   setResult({status:data.status,jenis_surat:data.jenis_surat || data.nama_jenis_surat,created_at:data.created_at,updated_at:data.updated_at,catatan_publik:data.public_note || data.catatan_publik});
  }catch{setError('Status tidak dapat ditampilkan. Periksa kedua kode atau coba kembali nanti.');}
  finally {lock.current=false;setBusy(false);setToken('');setResetKey(k=>k+1);}
 }
 return <div className="landing-page submission-page min-h-screen flex flex-col"><GuestNavbar/><section className="submission-intro"><div className="submission-shell"><Link to="/guest" className="submission-back">Beranda / Lacak status</Link><p className="submission-eyebrow">Layanan Persuratan</p><h1>Lacak status permohonan</h1><p>Gunakan kedua kode pada tanda terima. Jangan bagikan kode akses rahasia.</p></div></section><main className="submission-main flex-1"><div className="submission-shell submission-layout"><aside className="submission-guidance"><h2>Kode akses diperlukan</h2><p>Kode akses tidak dapat dipulihkan. Pelacakan tidak menampilkan data pemohon, catatan internal, atau lampiran.</p></aside><div><form onSubmit={track} className="submission-card bg-white border border-slate-200 p-6 space-y-5"><label className="block" htmlFor="tracking-code">Kode permohonan<input className="w-full mt-2 p-3 border border-slate-300 rounded-lg" id="tracking-code" value={code} onChange={e=>{setCode(e.target.value);setResult(null);}} required maxLength={100} autoComplete="off"/></label><label className="block" htmlFor="access-secret">Kode akses rahasia<input className="w-full mt-2 p-3 border border-slate-300 rounded-lg" id="access-secret" type="password" value={secret} onChange={e=>{setSecret(e.target.value);setResult(null);}} required maxLength={256} autoComplete="off"/></label><TurnstileChallenge action="track" onToken={setToken} resetKey={resetKey}/>{error && <p role="alert" className="text-red-700">{error}</p>}<button type="submit" disabled={busy || !token || !code.trim() || !secret.trim()} className="px-5 py-3 bg-red-700 text-white rounded-lg font-semibold disabled:opacity-50">{busy?'Memeriksa-':'Lacak status'}</button></form>{result && <section aria-live="polite" className="submission-card bg-white border border-slate-200 p-6 mt-4 space-y-3"><h2 className="font-bold text-xl">Status: {result.status}</h2>{typeof result.jenis_surat==='string' && <p>Jenis surat: {result.jenis_surat}</p>}{result.created_at && <p>Diajukan: {new Date(result.created_at).toLocaleString('id-ID')}</p>}{result.updated_at && <p>Diperbarui: {new Date(result.updated_at).toLocaleString('id-ID')}</p>}{result.catatan_publik && <p>Catatan publik: {result.catatan_publik}</p>}</section>}</div></div></main></div>;
}
