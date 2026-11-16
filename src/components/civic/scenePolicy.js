export function canAnimateCivicScene({ width, reducedMotion, saveData, cores, memory }) {
  return width >= 960 && !reducedMotion && !saveData && !(cores > 0 && cores <= 2) && !(memory > 0 && memory <= 2);
}
const civicStates = {
  beranda: { subject: 'building', label: 'Administrasi tertata. Pelayanan lebih dekat.', number: '01' },
  layanan: { subject: 'documents', label: 'Satu formulir untuk kebutuhan persuratan Anda.', number: '02' },
  prosedur: { subject: 'flow', label: 'Siapkan, kirim, pantau, dan terima hasil.', number: '03' },
  informasi: { subject: 'information', label: 'Informasi yang jelas sebelum Anda mengajukan.', number: '04' },
  entry: { subject: 'documents', label: 'Lengkapi identitas dan dokumen permohonan.', number: '01' },
  sending: { subject: 'flow', label: 'Permohonan sedang dikirim. Mohon tunggu.', number: '02' },
  success: { subject: 'success', label: 'Permohonan diterima. Simpan kode tracking Anda.', number: '03' },
};
export function getCivicState(stage) { return civicStates[stage] || civicStates.beranda; }
