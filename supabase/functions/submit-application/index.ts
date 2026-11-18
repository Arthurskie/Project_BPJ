import {serve,human,secret,hash,canonical,service,Failure} from '../_shared/security.ts';
serve('submit',async (_req,b)=>{
 await human(b.turnstile_token,'submit');
 if(!Array.isArray(b.files)||b.files.length>5||b.files.some(x=>typeof x!=='string'||! /^[a-f0-9-]{36}$/i.test(x))) throw new Failure('INVALID_FILES');
 if(b.files.length && (typeof b.session_id!=='string'||! /^[a-f0-9-]{36}$/i.test(b.session_id))) throw new Failure('INVALID_FILES');
 if(typeof b.idempotency_key!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(b.idempotency_key)) throw new Failure('INVALID_REQUEST');
 const access_hash=await hash(secret(b.access_secret));
 const payload={jenis_surat_id:b.jenis_surat_id,nama_pemohon:b.nama_pemohon,no_hp:b.no_hp,email:b.email??null,jawaban:b.jawaban};
 if(typeof payload.jenis_surat_id!=='string'||typeof payload.nama_pemohon!=='string'||typeof payload.no_hp!=='string'||!payload.jawaban||typeof payload.jawaban!=='object'||Array.isArray(payload.jawaban)) throw new Failure('INVALID_REQUEST');
 const {data,error}=await service().rpc('submit_application_with_files',{p_key:b.idempotency_key,p_access_hash:access_hash,p_payload_hash:await hash(canonical({payload,files:[...b.files].sort(),session_id:b.session_id??null,access_hash})),p_payload:payload,p_session_id:b.session_id??null,p_files:b.files});
 if(error) {if(error.message.includes('IDEMPOTENCY_CONFLICT')) throw new Failure('IDEMPOTENCY_CONFLICT',409); throw new Failure('SUBMISSION_REJECTED',400);}
 return data;
});

