import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import letterTypeAPI from '../../services/letterTypeAPI';

export default function Forms() {
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    letterTypeAPI.getAll().then(data => { if (active) setItems(data); }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [notice, setNotice] = useState('');
  const filtered = items.filter(item => `${item.code} ${item.name}`.toLowerCase().includes(query.toLowerCase()) && (status === 'all' || item.active === (status === 'active')));
  const remove = async (item) => {
    if (!window.confirm(`Hapus jenis surat "${item.name}"? Riwayat permohonan yang sudah ada tidak berubah.`)) return;
    try { await letterTypeAPI.remove(item.id); setItems(await letterTypeAPI.getAll()); setNotice('Jenis surat berhasil dihapus.'); setError(''); } catch (err) { setError(err.message); }
  };
  return <div className="max-w-6xl mx-auto space-y-6 text-[#292524] ">
    <div className="flex flex-wrap justify-between gap-4 items-center"><div><h1 className="text-2xl font-semibold">Master Jenis Surat</h1><p className="text-sm text-[#78716c] mt-1">Kelola kode, persyaratan, dan ketersediaan layanan surat.</p></div><Link to="/admin/forms/new" className="bg-[#b32d32] text-white rounded-lg px-4 py-2 text-sm ">Tambah Jenis Surat</Link></div>
    <p className="text-xs text-[#78716c]">Jenis nonaktif tidak ditawarkan pada permohonan baru.</p>
    {loading && <p role="status">Memuat jenis surat…</p>}{error && <p role="alert" className="text-red-700">{error}</p>}{notice && <p role="status" className="text-green-700">{notice}</p>}
    <div className="flex flex-wrap gap-3"><input aria-label="Cari jenis surat" placeholder="Cari kode atau nama surat..." value={query} onChange={e => setQuery(e.target.value)} className="border border-[#d9d5cb] bg-white rounded-lg px-3 py-2 bg-white flex-1"/><select aria-label="Filter status" value={status} onChange={e => setStatus(e.target.value)} className="border border-[#d9d5cb] bg-white rounded-lg px-3 py-2 "><option value="all">Semua status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select></div>
    <div className="overflow-x-auto border border-[#e7e4dc] bg-white rounded-2xl"><table className="w-full text-sm text-left"><thead className="bg-[#f8f7f3] "><tr>{['Kode','Nama Jenis Surat','Persyaratan','Status','Tindakan'].map(label => <th key={label} className="p-4 font-medium">{label}</th>)}</tr></thead><tbody>{filtered.map(item => <tr key={item.id} className="border-t border-[#e7e4dc] "><td className="p-4 font-mono">{item.code}</td><td className="p-4 font-medium">{item.name}</td><td className="p-4"><ul className="list-disc pl-4 text-[#78716c]">{item.requirements.map(req => <li key={req}>{req}</li>)}</ul></td><td className="p-4">{item.active ? 'Aktif' : 'Nonaktif'}</td><td className="p-4"><div className="flex items-center gap-2 whitespace-nowrap"><Link aria-label={`Ubah ${item.name}`} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#e7e4dc] bg-white px-3 text-sm font-medium text-[#44403c] no-underline transition-colors hover:border-[#d9d5cb] hover:bg-[#f8f7f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2    " to={`/admin/forms/new?edit=${encodeURIComponent(item.id)}`}><Pencil className="h-3.5 w-3.5" aria-hidden="true" />Ubah</Link><button type="button" aria-label={`Hapus ${item.name}`} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2    " onClick={() => remove(item)}><Trash2 className="h-3.5 w-3.5" aria-hidden="true" />Hapus</button></div></td></tr>)}</tbody></table>{!loading && !error && !filtered.length && <p className="p-8 text-center text-[#78716c]">Tidak ada jenis surat yang cocok.</p>}</div>
  </div>;
}

