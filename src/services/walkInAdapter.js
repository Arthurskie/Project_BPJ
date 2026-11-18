import {unwrap} from './adapterUtils.js';
export function canonical(value){
 if(value===null||typeof value!=='object')return JSON.stringify(value);
 if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
 return '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}';
}
async function hash(value){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');}
export async function submitWalkIn(client,body){
 const payload={jenis_surat_id:body.jenis_surat_id,nama_pemohon:body.nama_pemohon,no_hp:body.no_hp,email:body.email??null,jawaban:body.jawaban};
 const parameters={p_jenis_surat_id:payload.jenis_surat_id,p_nama_pemohon:payload.nama_pemohon,p_no_hp:payload.no_hp,p_email:payload.email,p_jawaban:payload.jawaban};
 if(body.files?.length||body.idempotency_key){
  if(!Array.isArray(body.files)||body.files.length>5||! /^[A-Za-z0-9_-]{22,128}$/.test(body.access_secret||'')||!body.idempotency_key||!body.session_id)throw new Error('Identitas sesi lampiran tidak valid. Ulangi persiapan pengajuan.');
  const access_hash=await hash(body.access_secret);
  return unwrap(client.rpc('admin_submit_walkin_with_files',{...parameters,p_key:body.idempotency_key,p_access_hash:access_hash,p_payload_hash:await hash(canonical({payload,files:[...body.files].sort(),session_id:body.session_id,access_hash})),p_session_id:body.session_id,p_files:body.files}));
 }
 return unwrap(client.rpc('admin_submit_walkin',parameters));
}
