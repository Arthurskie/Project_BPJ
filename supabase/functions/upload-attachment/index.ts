import {serve,human,secret,hash,service,admin,env,Failure} from '../_shared/security.ts';
const bucket='application-attachments';
function configured(){if(env('SCANNER_PROTOCOL')!=='exact-bytes-v1') throw new Failure('UPLOAD_UNAVAILABLE',503);if(!env('SCANNER_URL').startsWith('https://'))throw new Failure('UPLOAD_UNAVAILABLE',503);env('SCANNER_TOKEN');}
const uuid=(v:unknown)=>{if(typeof v!=='string'||! /^[a-f0-9-]{36}$/i.test(v))throw new Failure('INVALID_REQUEST');return v;};
function mime(bytes:Uint8Array){if(bytes[0]===0x25&&bytes[1]===0x50&&bytes[2]===0x44&&bytes[3]===0x46&&bytes[4]===0x2d)return 'application/pdf';if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return 'image/jpeg';if([137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return 'image/png';throw new Failure('FILE_REJECTED');}
async function digest(bytes:Uint8Array){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');}
serve('upload',async(req,b)=>{
 if(b.action==='read'){
 await admin(req);const token=req.headers.get('Authorization')!.slice(7);
 const client=service();const {data:user}=await client.auth.getUser(token);
 // Run admin-only RPC under the caller JWT rather than the service identity.
 const {createClient}=await import('npm:@supabase/supabase-js@2');
 const caller=createClient(env('SUPABASE_URL'),env('SUPABASE_ANON_KEY'),{global:{headers:{Authorization:'Bearer '+token}},auth:{persistSession:false}});
 if(!user.user)throw new Failure('FORBIDDEN',403);
 const {data:path,error}=await caller.rpc('admin_attachment_path',{p_id:uuid(b.id)});if(error||!path)throw new Failure('FILE_REFUSED',404);
 const {data:signed,error:se}=await client.storage.from(bucket).createSignedUrl(path,60);if(se)throw new Failure('FEATURE_UNAVAILABLE',503);return {url:signed.signedUrl,expires_at:new Date(Date.now()+60000).toISOString()};
 }
 configured();
 const access_hash=await hash(secret(b.access_secret)),session=uuid(b.session_id),client=service();
 if(b.action==='prepare'){
 await human(b.turnstile_token,'upload');
 if(typeof b.name!=='string'||b.name.length<1||b.name.length>180||[...b.name].some(ch=>ch.charCodeAt(0)<32)||!Number.isInteger(b.size)||Number(b.size)<1||Number(b.size)>10485760||!['application/pdf','image/png','image/jpeg'].includes(String(b.mime)))throw new Failure('INVALID_FILE');
 const capability=crypto.randomUUID()+crypto.randomUUID();
 const {data:r,error}=await client.rpc('prepare_attachment',{p_access_hash:access_hash,p_capability_hash:await hash(capability),p_session_id:session,p_name:b.name,p_size:b.size,p_type:b.mime});if(error)throw new Failure('UPLOAD_REFUSED');
 const {data:signed,error:se}=await client.storage.from(bucket).createSignedUploadUrl(r.object_path,{upsert:false});if(se)throw new Failure('UPLOAD_UNAVAILABLE',503);
 return {id:r.id,capability,bucket,path:r.object_path,token:signed.token,expires_at:r.expires_at};
 }
 const capability_hash=await hash(secret(b.capability)),id=uuid(b.id);
 if(b.action==='cancel'){const {error}=await client.rpc('cancel_attachment',{p_id:id,p_access_hash:access_hash,p_capability_hash:capability_hash,p_session_id:session});if(error)throw new Failure('UPLOAD_REFUSED');return {cancelled:true};}
 if(b.action!=='finalize')throw new Failure('INVALID_REQUEST');
 const {data:r,error}=await client.rpc('get_attachment_capability',{p_id:id,p_access_hash:access_hash,p_capability_hash:capability_hash,p_session_id:session});if(error||!r)throw new Failure('UPLOAD_REFUSED');
 if(r.status==='ready')return {id:r.id,name:r.original_name,size:r.expected_size,mime:r.expected_type};
 const {data:blob,error:de}=await client.storage.from(bucket).download(r.object_path);if(de){const status=String((de as {statusCode?:string|number}).statusCode??'');if(status==='404')throw new Failure('UPLOAD_NOT_RECEIVED',409);throw new Failure('UPLOAD_UNAVAILABLE',503);}if(!blob)throw new Failure('UPLOAD_UNAVAILABLE',503);if(blob.size!==r.expected_size||blob.size>10485760)throw new Failure('FILE_REJECTED');
 const bytes=new Uint8Array(await blob.arrayBuffer());if(mime(bytes)!==r.expected_type||blob.type!==r.expected_type)throw new Failure('FILE_REJECTED');
 const sha256=await digest(bytes);
 // Exact-byte scanner contract: authenticated request bytes, explicit digest-bound clean verdict.
 const scan=await fetch(env('SCANNER_URL'),{method:'POST',headers:{Authorization:'Bearer '+env('SCANNER_TOKEN'),'Content-Type':'application/octet-stream','X-Content-SHA256':sha256},body:bytes,signal:AbortSignal.timeout(30000),redirect:'error'});
 if(!scan.ok)throw new Failure('UPLOAD_UNAVAILABLE',503);const verdict=await scan.json();if(verdict.verdict!=='clean'||verdict.sha256!==sha256)throw new Failure('FILE_REJECTED');
 // A new private object prevents still-live upload tokens from mutating the verified object.
 const verified='verified/'+crypto.randomUUID();const {error:ue}=await client.storage.from(bucket).upload(verified,bytes,{contentType:r.expected_type,upsert:false});if(ue)throw new Failure('UPLOAD_UNAVAILABLE',503);
 const {data:result,error:fe}=await client.rpc('finalize_attachment',{p_id:id,p_access_hash:access_hash,p_capability_hash:capability_hash,p_session_id:session,p_verified_path:verified,p_sha256:sha256});
 if(fe){throw new Failure('UPLOAD_REFUSED');}if(result.verified_path!==verified)await client.storage.from(bucket).remove([verified]);return {id:result.id,name:result.name,size:result.size,mime:result.mime};
});





