export function mapSubmission(row) {
  if (!row) return row;
  return { ...row, ...(row.form_data || {}), trackingCode: row.tracking_code ?? row.trackingCode,
    jenisSurat: row.letter_type_name ?? row.letter_type_snapshot?.name ?? row.jenisSurat,
    letterTypeSnapshot: row.letter_type_snapshot, noHp: row.phone, createdAt: row.created_at,
    updatedAt: row.updated_at, verifiedAt: row.completed_at, nomorSurat: row.letter_number,
    pejabatTTD: row.official_name, catatanVerifikasi: row.verification_notes,
    notes: row.notes ?? row.rejection_reason, perihal: row.letter_type_name, tanggal: row.created_at,
    tahap: ({pending:1,diproses:2,selesai:4,ditolak:4})[row.status] || 1, catatanAdmin: row.rejection_reason, files: row.files || [] };
}
export function toSubmissionPayload(data, type) {
  return { status: data.status, nomorSurat: data.nomorSurat, pejabatTTD: data.pejabatTTD,
    catatanVerifikasi: data.catatanVerifikasi || data.catatanPetugas, letter_type_id: type.id, nik: data.nik, nama: data.nama, email: data.email || '', phone: data.noHp || '',
    form_data: { alamat: data.alamat, keperluan: data.keperluan, instansi: data.instansi || '', keterangan: data.keterangan || '' } };
}
