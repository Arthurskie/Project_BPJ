/**
 * Service API untuk Pembuatan dan Pencetakan Dokumen Surat Resmi (Letter Generator).
 * Menghasilkan template surat kedinasan standar pemerintah Indonesia dengan Kop Surat,
 * Nomor Registrasi Resmi, Isi Perihal, dan Pengesahan Tanda Tangan Pejabat.
 * Mendukung Cetak Langsung / Simpan PDF (window.print) dan Unduh Dokumen (Word/DOCX compatible).
 */

export const letterGeneratorAPI = {
  /**
   * Format tanggal bahasa Indonesia (contoh: 12 November 2026)
   */
  formatIndonesianDate: (dateInput) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const d = dateInput ? new Date(dateInput) : new Date();
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  },

  /**
   * Menghasilkan string HTML dokumen surat resmi siap cetak
   * @param {Object} data
   * @param {string} data.nomorSurat
   * @param {string} data.jenisSurat
   * @param {string} data.nama
   * @param {string} data.nik
   * @param {string} [data.alamat]
   * @param {string} [data.keperluan]
   * @param {string} [data.pejabatTTD]
   * @param {string} [data.nipPejabat]
   * @param {string} [data.jabatanPejabat]
   * @param {string} [data.instansiNama]
   * @param {string} [data.instansiAlamat]
   */
  generateLetterHTML: ({
    nomorSurat = '470 / 001 / KEL.CKR / XI / 2026',
    jenisSurat = 'SURAT KETERANGAN',
    nama = 'Nama Pemohon',
    nik = '3200000000000000',
    alamat = 'Jl. Protokol No. 1 RT 01/RW 01',
    keperluan = 'Keperluan Administrasi Kedinasan',
    pejabatTTD = 'Budi Santoso, S.STP',
    nipPejabat = '198503152010011002',
    jabatanPejabat = 'Lurah Cikarang',
    instansiNama = 'PEMERINTAH KABUPATEN BEKASI\nKECAMATAN CIKARANG PUSAT\nKELURAHAN CIKARANG',
    instansiAlamat = 'Jl. Raya Cikarang No. 12, Telp. (021) 8910223 - Kode Pos 17530',
    tanggalSurat = new Date()
  }) => {
    const tglResmi = letterGeneratorAPI.formatIndonesianDate(tanggalSurat);
    const judulUpper = jenisSurat.toUpperCase();
    const instansiLines = instansiNama.split('\n');

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${judulUpper} - ${nama}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 20mm 20mm 20mm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      color: #000;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      font-size: 12pt;
      background: #fff;
    }
    .kop {
      text-align: center;
      position: relative;
      margin-bottom: 5px;
    }
    .kop h3 {
      font-size: 13pt;
      font-weight: normal;
      margin: 0;
      letter-spacing: 1px;
    }
    .kop h2 {
      font-size: 15pt;
      font-weight: bold;
      margin: 2px 0;
      letter-spacing: 1px;
    }
    .kop p {
      font-size: 9.5pt;
      margin: 0;
      color: #333;
    }
    .line-double {
      border: 0;
      border-top: 3px solid #000;
      border-bottom: 1px solid #000;
      height: 4px;
      margin: 10px 0 25px 0;
    }
    .title-box {
      text-align: center;
      margin-bottom: 25px;
    }
    .title-box h1 {
      font-size: 14pt;
      font-weight: bold;
      text-decoration: underline;
      margin: 0;
      text-transform: uppercase;
    }
    .title-box .nomor {
      font-size: 11pt;
      margin-top: 4px;
      font-weight: normal;
    }
    .content-p {
      text-align: justify;
      text-indent: 40px;
      margin: 14px 0;
    }
    .bio-table {
      width: 100%;
      margin: 15px 0 20px 20px;
      border-collapse: collapse;
      font-size: 12pt;
    }
    .bio-table td {
      padding: 3px 0;
      vertical-align: top;
    }
    .bio-table td.label {
      width: 180px;
    }
    .bio-table td.colon {
      width: 20px;
    }
    .ttd-box {
      margin-top: 40px;
      float: right;
      width: 260px;
      text-align: center;
    }
    .ttd-box .tempat-tgl {
      margin-bottom: 5px;
    }
    .ttd-box .jabatan {
      font-weight: bold;
      margin-bottom: 75px;
    }
    .ttd-box .nama-pejabat {
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 2px;
    }
    .ttd-box .nip {
      font-size: 10.5pt;
    }
    .clearfix::after {
      content: "";
      clear: both;
      display: table;
    }
    .stamp-badge {
      display: inline-block;
      border: 2px dashed #b91c1c;
      color: #b91c1c;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 9pt;
      font-family: monospace;
      font-weight: bold;
      margin-top: 8px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <!-- Tombol Aksi Layar (Disembunyikan saat dicetak) -->
  <div class="no-print" style="margin-bottom: 20px; padding: 12px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <strong style="color: #0f172a;">Pratinjau Surat Resmi Siap Cetak</strong>
      <span style="font-size: 12px; color: #64748b; margin-left: 10px;">Format resmi dokumen dinas</span>
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" style="padding: 8px 16px; background: #b91c1c; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
        🖨️ Cetak / Simpan PDF
      </button>
      <button onclick="window.close()" style="padding: 8px 16px; background: #64748b; color: white; border: none; border-radius: 6px; cursor: pointer;">
        Tutup
      </button>
    </div>
  </div>

  <!-- KOP SURAT DINAS -->
  <div class="kop">
    ${instansiLines.slice(0, -1).map((line) => `<h3>${line}</h3>`).join('\n    ')}
    <h2>${instansiLines[instansiLines.length - 1] || 'KELURAHAN CIKARANG'}</h2>
    <p>${instansiAlamat}</p>
  </div>
  <div class="line-double"></div>

  <!-- JUDUL & NOMOR SURAT -->
  <div class="title-box">
    <h1>${judulUpper}</h1>
    <div class="nomor">Nomor : ${nomorSurat}</div>
  </div>

  <!-- ISI SURAT -->
  <p class="content-p">
    Yang bertanda tangan di bawah ini, Kepala Kelurahan Cikarang, Kecamatan Cikarang Pusat, Kabupaten Bekasi, menerangkan dengan sebenarnya bahwa:
  </p>

  <table class="bio-table">
    <tr>
      <td class="label">Nama Lengkap</td>
      <td class="colon">:</td>
      <td><strong>${nama}</strong></td>
    </tr>
    <tr>
      <td class="label">NIK (KTP)</td>
      <td class="colon">:</td>
      <td>${nik}</td>
    </tr>
    <tr>
      <td class="label">Alamat Domisili</td>
      <td class="colon">:</td>
      <td>${alamat || '-'}</td>
    </tr>
    <tr>
      <td class="label">Keperluan</td>
      <td class="colon">:</td>
      <td>${keperluan || '-'}</td>
    </tr>
  </table>

  <p class="content-p">
    Berdasarkan catatan dan verifikasi dokumen yang ada pada kami, yang bersangkutan adalah benar warga yang tercatat berdomisili di wilayah Kelurahan Cikarang dan surat keterangan ini diberikan atas dasar permohonan yang bersangkutan untuk dipergunakan sebagaimana tercantum di atas.
  </p>

  <p class="content-p">
    Demikian Surat Keterangan ini dibuat dan diberikan kepada yang bersangkutan untuk dapat dipergunakan sebagaimana mestinya dengan penuh tanggung jawab.
  </p>

  <!-- PENGESAHAN TANDA TANGAN -->
  <div class="clearfix">
    <div class="ttd-box">
      <div class="tempat-tgl">Bekasi, ${tglResmi}</div>
      <div class="jabatan">${jabatanPejabat}</div>
      <div class="nama-pejabat">${pejabatTTD}</div>
      <div class="nip">NIP. ${nipPejabat}</div>
      <div class="stamp-badge">TERVERIFIKASI SISTEM E-SURAT</div>
    </div>
  </div>
</body>
</html>`;
  },

  /**
   * Buka jendela baru dan trigger dialog print browser / save as PDF
   */
  printLetter: (htmlContent) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Gagal membuka jendela cetak. Pastikan izin pop-up browser telah diizinkan.');
    }
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
  },

  /**
   * Unduh dokumen sebagai berkas .DOC (Word-compatible)
   */
  downloadWordDocument: (htmlContent, filename = 'surat-keterangan.doc') => {
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export default letterGeneratorAPI;
