export function safeError(error) {
 const codes = { '23503':['IN_USE','Data masih digunakan oleh permohonan. Nonaktifkan jenis surat ini.'], '23505':['CONFLICT','Data sudah digunakan. Periksa kembali isian.'], '42501':['FORBIDDEN','Akses tidak diizinkan.'], 'PGRST116':['NOT_FOUND','Data tidak ditemukan.'] };
 const [code,message] = codes[error?.code] || ['SERVICE_ERROR','Layanan tidak dapat memproses permintaan. Silakan coba kembali.'];
 return Object.assign(new Error(message),{code});
}
export function requireAdminProfile(profile) {
 if (profile?.role !== 'admin' || profile?.is_active !== true) throw Object.assign(new Error('Akun tidak memiliki akses administrator aktif.'),{code:'FORBIDDEN'});
 return {...profile,name:profile.nama};
}
export function mapSubmission(row) {
 return {...row,trackingCode:row.kode_permohonan,nama:row.nama_pemohon,noHp:row.no_hp,jenisSurat:row.jenis_surat?.nama || row.nama_jenis_surat || '',createdAt:row.created_at,updatedAt:row.updated_at,notes:row.catatan_admin,source:row.source || 'online'};
}
export async function unwrap(request) {
 const {data,error}=await request;
 if(error) throw safeError(error);
 return data;
}
