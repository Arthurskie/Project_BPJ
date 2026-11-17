import demo from './demo/submissionAPI';
import letterTypeAPI from './letterTypeAPI';
import { isDemoMode, staffAction, guestAction } from './supabaseClient';
import { storeDocument, removeDocuments } from './documentStorage';
import { mapSubmission, toSubmissionPayload } from './submissionContract';
import { validateApplicant } from '../domain/submissionRules';
async function prepare(input) {
  let file;
  let data = input;
  if (input instanceof FormData) {
    file = input.get('lampiran');
    data = { nik: input.get('nik'), nama: input.get('nama_lengkap'), jenisSurat: input.get('jenis_surat'),
      keperluan: input.get('perihal'), alamat: input.get('alamat'), instansi: input.get('instansi'),
      noHp: input.get('telepon'), email: input.get('email'), keterangan: input.get('keterangan') };
  }
  const types = await letterTypeAPI.getActive();
  validateApplicant(data, types.map(type => type.name));
  const payload = toSubmissionPayload(data, types.find(type => type.name === data.jenisSurat));
  const attachments = [];
  try {
    if (file instanceof Blob && file.size) attachments.push(await storeDocument(file));
    for (const entry of data.files || []) {
      if (entry instanceof Blob) attachments.push(await storeDocument(entry));
      else if (entry.token) attachments.push(entry);
      else throw new Error('Lampiran belum diunggah. Pilih ulang berkas.');
    }
  } catch (error) {
    try { await removeDocuments(attachments.map(entry => entry.token)); }
    catch { throw new Error('Unggah lampiran gagal dan pembersihan belum berhasil; hubungi pengelola.'); }
    throw error;
  }
  return { payload: { ...payload, attachment_tokens: attachments.map(entry => entry.token) }, attachments };
}
async function submit(input, staff = false) {
  const { payload, attachments } = await prepare(input);
  try {
    const result = staff ? await staffAction('createWalkInSubmission', payload) : await guestAction('submit', payload);
    return { ...result, data: mapSubmission(result.data) };
  } catch (error) {
    try { await removeDocuments(attachments.map(file => file.token)); }
    catch { throw new Error(`${error.message} Pembersihan lampiran belum berhasil; hubungi pengelola agar berkas sementara dibersihkan.`); }
    throw error;
  }
}
const live = {
  submitLetter: data => submit(data),
  createWalkInSubmission: data => submit(data, true),
  trackStatus: async (nik, trackingCode) => {
    const result = await guestAction('track', { nik: nik.trim(), tracking_code: trackingCode.trim() });
    return { ...result, data: mapSubmission(result.data) };
  },
  getSubmissionById: async id => { const result = await staffAction('getSubmissionById', { id }); return { ...result, data: mapSubmission(result.data) }; },
  getAllSubmissions: async (filter = {}) => { const result = await staffAction('getAllSubmissions', filter); return { ...result, data: result.data.map(mapSubmission) }; },
  updateStatus: async (id, status, notes = '') => { const result = await staffAction('updateStatus', { id, status, notes }); return { ...result, data: mapSubmission(result.data) }; },
  verifyAndComplete: async (id, input) => { const result = await staffAction('verifyAndComplete', { id, ...input }); return { ...result, data: mapSubmission(result.data) }; },
  generateLetterNumber: kodeInstansi => staffAction('generateLetterNumber', { kodeInstansi }),
  validateLetterNumber: (nomorSurat, currentSubmissionId = null) => staffAction('validateLetterNumber', { nomorSurat, currentSubmissionId }),
};
export const submissionAPI = isDemoMode ? demo : live;
export const submissionService = submissionAPI;
export default submissionAPI;



