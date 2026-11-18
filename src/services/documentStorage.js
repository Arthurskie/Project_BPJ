import {getSupabase} from '../lib/supabase.js';
import {createUploadLifecycle} from './uploadLifecycle.js';
import {invokeEdge} from './edgeAPI.js';
export const privateUploadsEnabled=import.meta.env?.VITE_PRIVATE_UPLOADS_ENABLED==='true';
const unavailable=()=>{throw Object.assign(new Error('Unggah berkas belum tersedia sampai pemeriksaan keamanan dikonfigurasi.'),{code:'UPLOAD_UNAVAILABLE'});};
export async function prepareUpload(body){return invokeEdge('upload-attachment',{...body,action:'prepare'});}
export async function finalizeUpload(body){return invokeEdge('upload-attachment',{...body,action:'finalize'});}
export async function readDocument(id){return invokeEdge('upload-attachment',{action:'read',id});}
const uploadWithRetry=createUploadLifecycle({prepare:prepareUpload,finalize:finalizeUpload,upload:(prepared,file)=>getSupabase().storage.from(prepared.bucket).uploadToSignedUrl(prepared.path,prepared.token,file,{contentType:file.type})});
export async function uploadDocument(file,context){
 if(!privateUploadsEnabled)return unavailable();
 if(!['application/pdf','image/jpeg','image/png'].includes(file.type)||file.size<=0||file.size>10*1024*1024)throw new Error('Berkas harus PDF, JPEG, atau PNG dengan ukuran maksimal 10 MiB.');
 return uploadWithRetry(file,context);
}
export const storeDocument=uploadDocument;
export async function removeDocuments(){return unavailable();}
