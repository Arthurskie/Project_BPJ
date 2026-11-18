import {getSupabase} from '../lib/supabase.js';
import {safeError} from './adapterUtils.js';
const messages={UPLOAD_NOT_RECEIVED:'Berkas belum diterima. Coba unggah kembali.',FILE_REJECTED:'Berkas tidak lolos pemeriksaan keamanan.',UPLOAD_REFUSED:'Sesi unggah tidak berlaku atau tidak diizinkan.',FEATURE_UNAVAILABLE:'Layanan belum tersedia. Hubungi administrator atau coba kembali nanti.',HUMAN_VERIFICATION_REQUIRED:'Selesaikan verifikasi keamanan lalu coba kembali.',UNAUTHORIZED:'Sesi berakhir. Silakan masuk kembali.',NOT_FOUND:'Permohonan tidak ditemukan atau kode akses tidak valid.',UPLOAD_UNAVAILABLE:'Unggah berkas belum tersedia sampai pemeriksaan keamanan dikonfigurasi.',RATE_LIMITED:'Terlalu banyak permintaan. Silakan coba lagi nanti.',HUMAN_VERIFICATION_FAILED:'Verifikasi keamanan belum berhasil. Silakan ulangi.',HUMAN_VERIFICATION_UNAVAILABLE:'Verifikasi keamanan tidak tersedia. Silakan coba lagi nanti.',IDEMPOTENCY_CONFLICT:'Isi pengajuan berubah. Periksa kembali sebelum mengirim pengajuan baru.',INVALID_REQUEST:'Periksa kembali isian permintaan.',SUBMISSION_REJECTED:'Pengajuan belum dapat diterima. Periksa kembali isian.',TRACKING_UNAVAILABLE:'Permohonan tidak dapat ditemukan atau kode akses tidak valid.',FORBIDDEN:'Akses tidak diizinkan.'};
export async function invokeEdge(name,body,client=getSupabase()){
 const {data,error}=await client.functions.invoke(name,{body});
 if(error){let code;try{const response=await error.context?.clone().json();code=response?.error?.code||response?.code||response?.error;}catch{/* Provider details must not be shown. */}
  if(typeof code==='string'&&messages[code])throw Object.assign(new Error(messages[code]),{code});
  throw safeError(error);
 }
 if(data?.error){const code=data.error.code||data.error;throw Object.assign(new Error(messages[code]||'Layanan tidak dapat memproses permintaan.'),{code:typeof code==='string'?code:'SERVICE_ERROR'});}
 return data?.data??data;
}

