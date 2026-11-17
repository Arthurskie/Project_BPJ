import demo from './demo/letterTypeAPI';
import { getSupabase, isDemoMode, staffAction } from './supabaseClient';
async function getAll() {
  if (isDemoMode) return demo.getAll();
  const { data, error } = await getSupabase().from('letter_types').select('id,code,name,requirements,active,description').order('name');
  if (error) throw new Error('Jenis surat gagal dimuat. Periksa konfigurasi server.');
  return data;
}
export default {
  getAll,
  getActive: async () => (await getAll()).filter(item => item.active),
  save: async input => {
    const result = isDemoMode ? demo.save(input) : (await staffAction('saveLetterType', input)).data;
    window.dispatchEvent(new Event('letter-types-updated'));
    return result;
  },
  remove: async id => {
    const result = isDemoMode ? demo.remove(id) : await staffAction('removeLetterType', { id });
    window.dispatchEvent(new Event('letter-types-updated'));
    return result;
  },
};
