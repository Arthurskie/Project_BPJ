import { useEffect, useRef, useState } from 'react';
import letterTypeAPI from '../services/letterTypeAPI';
import submissionAPI from '../services/submissionAPI';
import { uploadDocument } from '../services/documentStorage';
import DynamicFields from './DynamicFields';
import TurnstileChallenge from './TurnstileChallenge';
import { createReceiptIdentity, submissionFingerprint, validateApplicant, validateDynamicAnswers, validateFiles } from '../domain/dynamicForms';
const inputClass='w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-red-600';
export default function DynamicSubmissionForm({ walkIn=false }) {
 const [types,setTypes]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const [typeId,setTypeId]=useState(''),[applicant,setApplicant]=useState({nama_pemohon:'',no_hp:'',email:''}),[answers,setAnswers]=useState({});
 const [errors,setErrors]=useState({}),[review,setReview]=useState(false),[busy,setBusy]=useState(false),[receipt,setReceipt]=useState(null),[token,setToken]=useState(''),[resetKey,setResetKey]=useState(0);
 const retry=useRef(null),lock=useRef(false);
 const uploadsEnabled=import.meta.env.VITE_PRIVATE_UPLOADS_ENABLED==='true';
 const [files,setFiles]=useState([]),[uploaded,setUploaded]=useState([]),[uploadToken,setUploadToken]=useState(''),[uploadReset,setUploadReset]=useState(0),[attempted,setAttempted]=useState(false);
 async function uploadNext() {
  if(lock.current || !uploadToken || uploaded.length>=files.length)return;
  lock.current=true;setBusy(true);setError('');
  try {
   if(!retry.current)retry.current={...createReceiptIdentity(),fingerprint:null};
   const data=await uploadDocument(files[uploaded.length],{access_secret:retry.current.access_secret,session_id:retry.current.idempotency_key,turnstile_token:uploadToken});
   if(!data?.id)throw new Error('unavailable');
   setUploaded(items=>[...items,data.id]);
  } catch {setError('Unggah berkas belum terkonfirmasi. Coba kembali; jangan mengirim sebelum seluruh berkas terverifikasi.');}
  finally {lock.current=false;setBusy(false);setUploadToken('');setUploadReset(k=>k+1);}
 }
 useEffect(()=>{let live=true;Promise.resolve().then(()=>letterTypeAPI.getActive()).then(rows=>{if(live)setTypes(rows);}).catch(()=>{if(live)setError('Jenis surat belum dapat dimuat. Silakan muat ulang halaman.');}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[]);
 const selected=types.find(t=>t.id===typeId), fields=selected?.fields || [];
 const edit=()=>{setReview(false);setError('');};
 async function submit(event) {
  event.preventDefault();if(lock.current)return;
  const nextErrors={...validateApplicant(applicant),...validateDynamicAnswers(fields,answers)};
  if(!selected)nextErrors.jenis_surat_id='Pilih jenis surat aktif.';
  setErrors(nextErrors);if(Object.keys(nextErrors).length){setReview(false);return;}
  if(!review){setReview(true);return;}
  if(!walkIn && !token){setError('Selesaikan verifikasi manusia sebelum mengirim.');return;}
  lock.current=true;setBusy(true);setError('');
  try {
   const payload={jenis_surat_id:typeId,...applicant,jawaban:answers};
   if(files.length!==uploaded.length)throw new Error('UPLOAD_PENDING');
   const fingerprint=submissionFingerprint(payload,files);
   if(retry.current?.fingerprint && retry.current.fingerprint!==fingerprint) throw new Error('RETRY_CHANGED');
   if(!retry.current) retry.current={...createReceiptIdentity(),fingerprint};
   retry.current.fingerprint=fingerprint;setAttempted(true);
   const result=walkIn?await submissionAPI.createWalkInSubmission({...payload,access_secret:retry.current.access_secret,idempotency_key:retry.current.idempotency_key,files:uploaded,session_id:retry.current.idempotency_key}):await submissionAPI.submitLetter({...payload,access_secret:retry.current.access_secret,idempotency_key:retry.current.idempotency_key,turnstile_token:token,files:uploaded,session_id:retry.current.idempotency_key});
   if(result?.success===false || result?.error)throw new Error('UNAVAILABLE');
   const data=result?.data || result;
   if(!data?.kode_permohonan)throw new Error('UNAVAILABLE');
   setReceipt({kode_permohonan:data.kode_permohonan,access_secret:walkIn?null:retry.current.access_secret});
   setApplicant({nama_pemohon:'',no_hp:'',email:''});setAnswers({});
  } catch(failure) {
   setError(failure.message==='RETRY_CHANGED'?'Percobaan sebelumnya belum terkonfirmasi. Kembalikan isi formulir semula untuk mencoba ulang; jangan membuat pengajuan baru sebelum memastikan hasilnya.':'Pengajuan belum dapat dikonfirmasi. Layanan mungkin belum tersedia. Isi tetap di halaman ini; coba ulang dengan isi yang sama. Jangan tutup halaman.');
  } finally {lock.current=false;setBusy(false);setToken('');setResetKey(k=>k+1);}
 }
 if(receipt)return <section className="submission-card bg-white border border-slate-200 p-6 space-y-4" aria-live="polite"><h2 className="text-xl font-bold">Permohonan diterima</h2><p>Kode permohonan</p><p className="font-mono text-red-700 break-all">{receipt.kode_permohonan}</p>{receipt.access_secret && <><p>Kode akses rahasia</p><p className="font-mono break-all">{receipt.access_secret}</p><p>Simpan kedua kode secara pribadi sekarang. Kode akses tidak dapat dipulihkan dan tidak disimpan di browser. Jangan bagikan kode akses.</p></>}<p>Ini tanda terima, bukan surat resmi. Status awal: menunggu.</p></section>;
 return <form onSubmit={submit} className="submission-card bg-white border border-slate-200 p-6 space-y-5" noValidate>
  <h2 className="text-lg font-bold text-slate-900">{walkIn?'Data Permohonan Loket':'Formulir pengajuan surat'}</h2>
  {loading && <p role="status">Memuat jenis surat-</p>}{error && <p role="alert" className="text-red-700">{error}</p>}
  {!loading && !types.length && <p role="status">Belum ada jenis surat aktif yang tersedia.</p>}
  <fieldset disabled={busy || loading} className="space-y-5">
  <div><label htmlFor="letter-type" className="block text-sm font-semibold mb-1">Jenis surat *</label><select id="letter-type" className={inputClass} value={typeId} onChange={e=>{setTypeId(e.target.value);setAnswers({});setErrors({});edit();}}><option value="">Pilih jenis surat</option>{types.map(type=><option key={type.id} value={type.id}>{type.nama || type.name}</option>)}</select>{errors.jenis_surat_id && <p role="alert">{errors.jenis_surat_id}</p>}</div>
  {[['nama_pemohon','Nama lengkap','text'],['no_hp','Nomor telepon','tel'],['email','Email (opsional)','email']].map(([key,label,type])=><div key={key}><label className="block text-sm font-semibold mb-1" htmlFor={key}>{label}{key!=='email'?' *':''}</label><input id={key} className={inputClass} type={type} value={applicant[key]} maxLength={key==='nama_pemohon'?120:key==='no_hp'?20:254} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key]?`${key}-error`:undefined} onChange={e=>{setApplicant({...applicant,[key]:e.target.value});edit();}}/>{errors[key] && <p id={`${key}-error`} role="alert" className="text-red-700 text-sm">{errors[key]}</p>}</div>)}
  <DynamicFields fields={fields} answers={answers} errors={errors} onChange={(key,value)=>{setAnswers({...answers,[key]:value});edit();}}/>
  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">{uploadsEnabled ? <><label htmlFor="private-files" className="font-semibold">Lampiran privat (opsional)</label><input id="private-files" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" disabled={busy || uploaded.length>0 || attempted} onChange={e=>{const selected=Array.from(e.target.files || []);const failure=validateFiles(selected);setError(failure);if(!failure){setFiles(selected);setUploaded([]);edit();}}}/><p>{uploaded.length} dari {files.length} berkas terverifikasi.</p>{uploaded.length<files.length && <><TurnstileChallenge action="upload" onToken={setUploadToken} resetKey={uploadReset}/><button type="button" className="underline" disabled={busy || !uploadToken} onClick={uploadNext}>Unggah dan periksa berkas berikutnya</button></>}</> : <p className="font-semibold">Lampiran belum tersedia</p>}<p className="text-sm">Unggah privat memerlukan layanan pemeriksaan berkas yang terverifikasi. Jangan kirim berkas melalui saluran lain. Batas saat diaktifkan: 5 berkas PDF/JPEG/PNG, masing-masing 10 MiB.</p></div>
  {review && <div className="p-4 border border-slate-300 rounded-lg" role="status"><h3 className="font-semibold">Periksa kembali data Anda</h3><p>Jenis: {selected?.nama || selected?.name}</p><p>Nama: {applicant.nama_pemohon}</p><p>Telepon: {applicant.no_hp}</p>{applicant.email && <p>Email: {applicant.email}</p>}<dl>{fields.map(f=><div key={f.field_key}><dt>{f.label}</dt><dd className="break-words">{String(answers[f.field_key]??'-')}</dd></div>)}</dl></div>}
  {!walkIn && <TurnstileChallenge action="submit" onToken={setToken} resetKey={resetKey}/>}
  <button type="submit" disabled={busy || loading || !types.length || (review && !walkIn && !token)} className="px-5 py-3 bg-red-700 hover:bg-red-800 text-white rounded-lg font-semibold disabled:opacity-50">{busy?'Mengirim-':review?'Kirim permohonan':'Periksa pengajuan'}</button>
  </fieldset>
 </form>;
}
