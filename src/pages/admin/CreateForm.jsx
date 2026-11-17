import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import letterTypeAPI from '../../services/letterTypeAPI';
export default function CreateForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const id = params.get('edit');
  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({ code: '', name: '', requirements: [], active: true });
  const [requirements, setRequirements] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!id) return;
    let active = true;
    letterTypeAPI.getAll().then(items => {
      if (!active) return;
      const item = items.find(item => item.id === id);
      setInitial(item || null);
      if (item) { setForm(item); setRequirements(item.requirements.join('\n')); }
    }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  const inputClass = 'w-full border border-[#d9d5cb]  rounded-lg p-3 bg-white mt-2';
  const submit = async e => { e.preventDefault(); if (saving) return; setSaving(true); try { await letterTypeAPI.save({ ...form, requirements: requirements.split('\n') }); navigate('/admin/forms'); } catch (err) { setError(err.message); } finally { setSaving(false); } };
  if (loading) return <p role="status">Memuat jenis surat…</p>;
  if (id && !initial) return <div><p role="alert">{error || 'Jenis surat tidak ditemukan.'}</p><Link to="/admin/forms">Kembali ke Master Jenis Surat</Link></div>;
  return <div className="max-w-2xl mx-auto text-[#292524] "><Link to="/admin/forms" className="text-sm text-[#78716c]">Kembali ke Master Jenis Surat</Link><h1 className="text-2xl font-semibold mt-5">{id ? 'Ubah' : 'Tambah'} Jenis Surat</h1><p className="text-sm text-[#78716c] mt-2">Tentukan identitas dan persyaratan layanan surat.</p><form onSubmit={submit} className="mt-6 space-y-5 border border-[#e7e4dc] bg-white rounded-2xl p-6">{error && <p role="alert" className="text-red-700">{error}</p>}<label className="block text-sm">Kode Surat <span className="text-red-600">*</span><input required maxLength={20} className={inputClass} value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="Contoh: SKU"/><span className="text-xs text-[#78716c]">Kode unik, 2â€“20 karakter.</span></label><label className="block text-sm">Nama Jenis Surat <span className="text-red-600">*</span><input required maxLength={150} className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></label><label className="block text-sm">Persyaratan <span className="text-red-600">*</span><textarea required rows={5} className={inputClass} value={requirements} onChange={e => setRequirements(e.target.value)} placeholder={'Fotokopi KTP\nFotokopi Kartu Keluarga'}/><span className="text-xs text-[#78716c]">Tulis satu persyaratan pada setiap baris.</span></label><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })}/>Aktif â€” tersedia untuk permohonan baru</label><div className="flex justify-end gap-4 pt-3"><Link to="/admin/forms" className="px-4 py-2 text-sm">Batal</Link><button disabled={saving} type="submit" className="bg-[#b32d32] text-white  rounded-lg px-4 py-2 text-sm">Simpan Jenis Surat</button></div></form></div>;
}


