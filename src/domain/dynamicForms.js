export function validateApplicant(value) {
 const errors = {};
 if ((value.nama_pemohon || '').trim().length < 3 || value.nama_pemohon.length > 120) errors.nama_pemohon = 'Nama harus 3-120 karakter.';
 if (!/^[+0-9() .-]{8,20}$/.test(value.no_hp || '')) errors.no_hp = 'Nomor telepon harus 8-20 karakter.';
 if (value.email && (value.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email))) errors.email = 'Alamat email tidak valid.';
 return errors;
}
export function validateDynamicAnswers(fields, answers) {
 const errors = {};
 const keys = new Set(fields.map(f=>f.field_key));
 for (const key of Object.keys(answers)) if (!keys.has(key)) errors[key] = 'Isian tidak dikenal.';
 for (const field of fields) {
  const key=field.field_key, value=answers[key], type=field.tipe_input;
  if (value === undefined || value === null || (typeof value==='string' && value.trim()==='')) { if(field.wajib) errors[key]='Wajib diisi.'; continue; }
  if(type==='number') { if(typeof value !== 'number' || !Number.isFinite(value)) errors[key]='Masukkan angka yang valid.'; continue; }
  if(typeof value!=='string' || value.length>(field.panjang_maksimum || 5000)) { errors[key]='Isian tidak valid atau terlalu panjang.'; continue; }
  if(type==='select' && !(field.opsi || []).includes(value)) errors[key]='Pilih opsi yang tersedia.';
  if(type==='email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[key]='Email tidak valid.';
  if(type==='tel' && !/^[+0-9() .-]{8,20}$/.test(value)) errors[key]='Telepon tidak valid.';
  if(type==='date' && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0,10)!==value)) errors[key]='Tanggal tidak valid.';
 }
 return errors;
}
export function validateFiles(files) {
 if(files.length>5) return 'Maksimal 5 berkas.';
 const types={pdf:'application/pdf',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png'};
 return files.some(f=>!types[f.name.split('.').pop().toLowerCase()] || types[f.name.split('.').pop().toLowerCase()]!==f.type || f.size<=0 || f.size>10*1024*1024) ? 'Gunakan PDF, JPEG, atau PNG, maksimal 10 MiB per berkas.' : '';
}
export function createReceiptIdentity(cryptoProvider=globalThis.crypto) {
 if(!cryptoProvider?.getRandomValues) throw new Error('Kriptografi browser tidak tersedia.');
 const random=()=>Array.from(cryptoProvider.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');
 const bytes=cryptoProvider.getRandomValues(new Uint8Array(16));
 bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const hex=Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('');
 return {access_secret:random(),idempotency_key:[hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-')};
}
export function submissionFingerprint(payload, files) {
 const canonical=value=>Array.isArray(value)?value.map(canonical):value && typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
 return JSON.stringify(canonical({payload,files:files.map(f=>({name:f.name,size:f.size,type:f.type,lastModified:f.lastModified}))}));
}
