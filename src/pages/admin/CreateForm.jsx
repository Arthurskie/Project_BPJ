import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import letterTypeAPI from '../../services/letterTypeAPI';

export default function CreateForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const route = useParams();
  const id = route.id || params.get('edit');
  const [form, setForm] = useState({ kode: '', nama: '', deskripsi: '', is_active: false, fields: [] });
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    if (id) letterTypeAPI.getAll().then(items => {
      if (!active) return;
      const item = items.find(row => row.id === id);
      if (!item) throw new Error('Jenis surat tidak ditemukan.');
      setForm({ ...item, kode: item.kode ?? item.code, nama: item.nama ?? item.name, deskripsi: item.deskripsi || '', is_active: item.is_active ?? item.active, fields: item.fields || item.form_surat_fields || [] });
    }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  const input = 'w-full border border-slate-300 rounded-lg p-3 bg-transparent mt-2';
  const changeField = (index, patch) => setForm(previous => ({ ...previous, fields: previous.fields.map((field, i) => i === index ? { ...field, ...patch } : field) }));
  const move = (index, delta) => setForm(previous => { const fields = [...previous.fields]; [fields[index], fields[index + delta]] = [fields[index + delta], fields[index]]; return { ...previous, fields }; });
  const submit = async event => {
    event.preventDefault(); setError(''); setSaving(true);
    try {
      const keys = form.fields.map(field => field.field_key);
      if (new Set(keys).size !== keys.length) throw new Error('Kunci pertanyaan harus unik.');
      await letterTypeAPI.save({ ...form, fields: form.fields.map((field, urutan) => ({ ...field, urutan, opsi: field.tipe_input === 'select' ? field.opsi : [] })) });
      navigate('/admin/forms');
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };
  if (loading) return <p role="status">Memuat jenis surat…</p>;
  return <div className="max-w-3xl mx-auto text-slate-900"><Link to="/admin/forms">Kembali ke Master Jenis Surat</Link><h1 className="text-2xl font-semibold mt-5">{id ? 'Ubah' : 'Tambah'} Jenis Surat</h1><form onSubmit={submit} className="mt-6 space-y-5 border rounded-xl p-6">{error && <p role="alert" className="text-red-700">{error}</p>}<label className="block">Kode Surat<input required pattern="[A-Z][A-Z0-9_]{1,29}" maxLength={30} className={input} value={form.kode} onChange={e => setForm({ ...form, kode: e.target.value })}/></label><label className="block">Nama Jenis Surat<input required minLength={3} maxLength={120} className={input} value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })}/></label><label className="block">Deskripsi / persyaratan<textarea className={input} rows={4} value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })}/></label><label className="flex gap-3"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}/>Aktif untuk permohonan baru</label><h2 className="font-semibold">Pertanyaan formulir</h2><p className="text-sm text-slate-600">Perubahan berlaku untuk permohonan baru. Jawaban lama menggunakan snapshot saat diajukan.</p>{form.fields.map((field, index) => <fieldset key={index} className="border rounded-lg p-4 space-y-3"><legend>Pertanyaan {index + 1}</legend><label className="block">Kunci<input required pattern="[a-z][a-z0-9_]{0,49}" className={input} value={field.field_key} onChange={e => changeField(index, { field_key: e.target.value })}/></label><label className="block">Label<input required maxLength={120} className={input} value={field.label} onChange={e => changeField(index, { label: e.target.value })}/></label><label className="block">Tipe<select className={input} value={field.tipe_input} onChange={e => changeField(index, { tipe_input: e.target.value, opsi: [] })}>{['text','textarea','number','date','select','email','tel'].map(type => <option key={type}>{type}</option>)}</select></label><label className="block">Petunjuk<input className={input} value={field.placeholder || ''} onChange={e => changeField(index, { placeholder: e.target.value })}/></label><label className="block">Panjang maksimum<input type="number" min={1} max={2000} required className={input} value={field.panjang_maksimum} onChange={e => changeField(index, { panjang_maksimum: Number(e.target.value) })}/></label>{field.tipe_input === 'select' && <label className="block">Pilihan (satu per baris)<textarea required className={input} value={field.opsi.join('\n')} onChange={e => changeField(index, { opsi: e.target.value.split('\n') })}/></label>}<label className="flex gap-2"><input type="checkbox" checked={field.wajib} onChange={e => changeField(index, { wajib: e.target.checked })}/>Wajib diisi</label><div className="flex gap-4"><button type="button" disabled={index === 0} onClick={() => move(index, -1)}>Naik</button><button type="button" disabled={index === form.fields.length - 1} onClick={() => move(index, 1)}>Turun</button><button type="button" className="text-red-700" onClick={() => setForm({ ...form, fields: form.fields.filter((_, i) => i !== index) })}>Hapus pertanyaan</button></div></fieldset>)}<button type="button" className="border rounded-lg px-4 py-2" onClick={() => setForm({ ...form, fields: [...form.fields, { field_key: '', label: '', tipe_input: 'text', placeholder: '', wajib: false, opsi: [], panjang_maksimum: 255 }] })}>Tambah Pertanyaan</button><div className="flex justify-end gap-4"><Link to="/admin/forms">Batal</Link><button disabled={saving} className="bg-slate-900 text-white rounded-lg px-4 py-2">{saving ? 'Menyimpan…' : 'Simpan Jenis Surat'}</button></div></form></div>;
}

