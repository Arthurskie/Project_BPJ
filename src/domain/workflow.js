export function applicantErrors(data, activeNames) {
 const errors = {};
 if (!/^\d{16}$/.test(String(data.nik || '').trim())) errors.nik = 'NIK harus 16 digit angka.';
 for (const [key,label] of [['nama','Nama lengkap'],['alamat','Alamat domisili'],['keperluan','Keperluan']]) if (!String(data[key] || '').trim() || data[key] === '-') errors[key] = `${label} wajib diisi.`;
 if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email).trim())) errors.email = 'Format email tidak valid.';
 if (!activeNames.includes(data.jenisSurat)) errors.jenisSurat = 'Pilih jenis surat aktif.';
 return errors;
}
export function localDateKey(value) {
 const date = new Date(value);
 return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
}
export function querySubmissions(rows, {type='',from='',to='',sort='newest',page=1,pageSize=10} = {}) {
 const filtered = rows.filter(row => (!type || row.jenisSurat === type) && (!from || localDateKey(row.createdAt) >= from) && (!to || localDateKey(row.createdAt) <= to)).sort((a,b) => sort === 'oldest' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt));
 const pages = Math.max(1,Math.ceil(filtered.length/pageSize));
 const current = Math.min(Math.max(1,page),pages);
 return {data:filtered.slice((current-1)*pageSize,current*pageSize),total:filtered.length,pages,page:current};
}
