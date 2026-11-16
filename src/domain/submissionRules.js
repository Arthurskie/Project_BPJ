const clean = value => String(value ?? '').trim();
export const normalizeLetterNumber = value => clean(value).replace(/\s/g, '').toUpperCase();
export function validateApplicant(data, activeNames) {
  if (!/^\d{16}$/.test(clean(data.nik))) throw new Error('NIK harus terdiri dari 16 digit angka.');
  for (const [key, label] of [['nama', 'Nama'], ['alamat', 'Alamat domisili'], ['keperluan', 'Keperluan']]) {
    if (!clean(data[key]) || clean(data[key]) === '-') throw new Error(`${label} wajib diisi.`);
  }
  if (!activeNames.includes(clean(data.jenisSurat))) throw new Error('Pilih jenis surat yang masih aktif.');
}
export function validateIssuance(data, submissions, currentId = null) {
  if (!['diproses', 'selesai'].includes(data.status)) throw new Error('Status walk-in tidak valid.');
  if (data.status !== 'selesai') return;
  if (!clean(data.nomorSurat)) throw new Error('Nomor surat wajib diisi.');
  if (!clean(data.pejabatTTD)) throw new Error('Pejabat penanda tangan wajib diisi.');
  if (submissions.some(row => row.id !== currentId && normalizeLetterNumber(row.nomorSurat) === normalizeLetterNumber(data.nomorSurat))) throw new Error('Nomor surat sudah digunakan.');
}
export function proposeLetterNumber(submissions, code = 'KEL.CKR', now = new Date()) {
  const year = now.getFullYear();
  const month = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][now.getMonth()];
  const sequences = submissions.filter(row => row.status === 'selesai').map(row => {
    const parts = clean(row.nomorSurat).split('/').map(clean);
    return parts.length === 5 && Number(parts[4]) === year ? Number(parts[1]) || 0 : 0;
  });
  const seq = Math.max(0, ...sequences) + 1;
  return { nomorSurat: `470 / ${String(seq).padStart(3, '0')} / ${code} / ${month} / ${year}`, seq, year, month, kodeInstansi: code };
}
