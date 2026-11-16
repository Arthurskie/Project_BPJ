import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import letterTypeAPI from '../../services/letterTypeAPI';
export default function CreateForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const id = params.get('edit');
  const [initial] = useState(() => { try { return id ? letterTypeAPI.getAll().find(item => item.id === id) : null; } catch { return null; } });
  const [form, setForm] = useState(initial || { code: '', name: '', requirements: [], active: true });
  const [requirements, setRequirements] = useState(initial?.requirements.join('\n') || '');
  const [error, setError] = useState('');
  const inputClass = 'w-full border border-slate-300 dark:border-neutral-700 rounded-lg p-3 bg-transparent mt-2';
  const submit = e => { e.preventDefault(); try { letterTypeAPI.save({ ...form, requirements: requirements.split('\n') }); navigate('/admin/forms'); } catch (err) { setError(err.message); } };
  if (id && !initial) return <div><p role="alert">Jenis surat tidak ditemukan atau data tidak dapat dibaca.</p><Link to="/admin/forms">Kembali ke Master Jenis Surat</Link></div>;
  return <div className="max-w-2xl mx-auto text-slate-900 dark:text-white"><Link to="/admin/forms" className="text-sm text-slate-500">Kembali ke Master Jenis Surat</Link><h1 className="text-2xl font-semibold mt-5">{id ? 'Ubah' : 'Tambah'} Jenis Surat</h1><p className="text-sm text-slate-500 mt-2">Tentukan identitas dan persyaratan layanan surat.</p><form onSubmit={submit} className="mt-6 space-y-5 border border-slate-200 dark:border-neutral-800 rounded-xl p-6">{error && <p role="alert" className="text-red-700">{error}</p>}<label className="block text-sm">Kode Surat <span className="text-red-600">*</span><input required maxLength={20} className={inputClass} value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="Contoh: SKU"/><span className="text-xs text-slate-500">Kode unik, 2â€“20 karakter.</span></label><label className="block text-sm">Nama Jenis Surat <span className="text-red-600">*</span><input required maxLength={150} className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></label><label className="block text-sm">Persyaratan <span className="text-red-600">*</span><textarea required rows={5} className={inputClass} value={requirements} onChange={e => setRequirements(e.target.value)} placeholder={'Fotokopi KTP\nFotokopi Kartu Keluarga'}/><span className="text-xs text-slate-500">Tulis satu persyaratan pada setiap baris.</span></label><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })}/>Aktif â€” tersedia untuk permohonan baru</label><div className="flex justify-end gap-4 pt-3"><Link to="/admin/forms" className="px-4 py-2 text-sm">Batal</Link><button type="submit" className="bg-slate-900 text-white dark:bg-neutral-700 rounded-lg px-4 py-2 text-sm">Simpan Jenis Surat</button></div></form></div>;
}


