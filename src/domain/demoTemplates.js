export function demoServiceNote(name) {
 const notes = [
  ['Usaha','Data usaha, lokasi, dan kegiatan perlu diverifikasi petugas.'],
  ['Domisili','Alamat dan bukti tempat tinggal perlu diverifikasi petugas.'],
  ['Tidak Mampu','Kondisi ekonomi dan bukti pendukung perlu diverifikasi petugas.'],
  ['Belum Menikah','Status perkawinan dan pernyataan pemohon perlu diverifikasi petugas.'],
  ['SKCK','Dokumen ini bukan SKCK. Penerbitan SKCK merupakan kewenangan kepolisian.'],
  ['Kematian','Identitas almarhum, waktu kejadian, dan bukti kematian belum dinyatakan sah dalam demo ini.'],
  ['Kelahiran','Identitas bayi, orang tua, dan bukti kelahiran belum dinyatakan sah dalam demo ini.'],
  ['Penghasilan','Jumlah dan sumber penghasilan perlu diverifikasi; demo tidak menetapkan nominal.'],
  ['Keramaian','Rincian kegiatan dan persetujuan instansi berwenang perlu diperiksa; demo bukan izin acara.']
 ];
 return notes.find(([key]) => String(name).includes(key))?.[1] || 'Isi dan persyaratan layanan perlu diperiksa sesuai SOP instansi.';
}
