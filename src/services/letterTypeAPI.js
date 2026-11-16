const KEY = 'bpj_letter_types_v1';
const names = ['Surat Keterangan Usaha (SKU)', 'Surat Keterangan Domisili', 'Surat Keterangan Tidak Mampu (SKTM)', 'Surat Keterangan Belum Menikah', 'Surat Pengantar SKCK', 'Surat Keterangan Kematian', 'Surat Keterangan Kelahiran', 'Surat Keterangan Penghasilan', 'Surat Rekomendasi Izin Keramaian'];
const defaults = names.map((name, index) => ({ id: `type-${index + 1}`, code: ['SKU','DOM','SKTM','BM','SKCK','MATI','LAHIR','HASIL','RAMAI'][index], name, requirements: ['Fotokopi KTP', 'Fotokopi Kartu Keluarga', ['Keterangan usaha dan alamat usaha', 'Bukti alamat domisili', 'Keterangan kondisi ekonomi', 'Pernyataan status perkawinan', 'Pengantar RT/RW untuk SKCK', 'Keterangan kematian dari fasilitas kesehatan', 'Keterangan kelahiran dari fasilitas kesehatan', 'Rincian penghasilan pemohon', 'Rincian acara, lokasi, dan waktu'][index]], active: true }));
function getAll() {
  const stored = localStorage.getItem(KEY);
  if (!stored) return defaults.map(item => ({ ...item, requirements: [...item.requirements] }));
  try { const data = JSON.parse(stored); if (!Array.isArray(data)) throw new Error(); return data; }
  catch { throw new Error('Data jenis surat tidak dapat dibaca. Hubungi administrator.'); }
}
function persist(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('letter-types-updated'));
}
function save(input) {
  const items = getAll();
  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();
  if (!/^[A-Z0-9_-]{2,20}$/.test(code)) throw new Error('Kode wajib 2–20 karakter huruf, angka, garis bawah, atau tanda hubung.');
  if (!name || name.length > 150) throw new Error('Nama jenis surat wajib diisi (maksimal 150 karakter).');
  if (items.some(item => item.id !== input.id && (item.code.toUpperCase() === code || item.name.toLowerCase() === name.toLowerCase()))) throw new Error('Kode atau nama jenis surat sudah digunakan.');
  const requirements = [...new Set(input.requirements.map(value => value.trim()).filter(Boolean))];
  if (!requirements.length) throw new Error('Isi minimal satu persyaratan.');
  const record = { id: input.id || crypto.randomUUID(), code, name, requirements, active: Boolean(input.active) };
  persist(input.id ? items.map(item => item.id === input.id ? record : item) : [...items, record]);
  return record;
}
function remove(id) { persist(getAll().filter(item => item.id !== id)); }
export default { getAll, save, remove, getActive: () => getAll().filter(item => item.active) };

