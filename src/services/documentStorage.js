import * as demo from './demo/documentStorage';
import { isDemoMode, getSupabase, guestAction } from './supabaseClient';
const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
export async function storeDocument(file) {
  if (isDemoMode) return demo.storeDocument(file);
  if (!allowed.includes(file.type) || file.size <= 0 || file.size > 10 * 1024 * 1024) throw new Error('Lampiran harus PDF, JPG, atau PNG maksimal 10 MB.');
  const { data } = await guestAction('upload', { content_type: file.type, size: file.size, name: file.name || 'lampiran' });
  try {
    const { error } = await getSupabase().storage.from('bpj-documents').uploadToSignedUrl(data.path, data.upload_token, file, { contentType: file.type });
    if (error) throw new Error('Unggah lampiran gagal.');
  } catch (error) {
    try { await guestAction('remove', { token: data.token }); }
    catch { throw new Error('Unggah gagal dan pembersihan belum berhasil; hubungi pengelola.'); }
    throw error;
  }
  return { token: data.token, path: data.path, name: file.name || 'lampiran', size: file.size, type: file.type };
}
export async function readDocument(path) {
  if (isDemoMode) return demo.readDocument(path);
  const { data, error } = await getSupabase().storage.from('bpj-documents').createSignedUrl(path, 60);
  if (error) throw new Error('Akses lampiran ditolak atau berkas tidak tersedia.');
  const response = await fetch(data.signedUrl);
  if (!response.ok) throw new Error('Lampiran gagal dimuat.');
  return response.blob();
}
export async function removeDocuments(tokens) {
  if (isDemoMode) return demo.removeDocuments(tokens);
  await Promise.all(tokens.map(token => guestAction('remove', { token })));
}
