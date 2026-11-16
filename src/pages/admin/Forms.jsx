import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from '../../contexts/useForm';

export default function Forms() {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const navigate = useNavigate();
  const { forms: allForms } = useFormContext();

  useEffect(() => {
    if (searchInputRef.current && window.innerWidth >= 768) {
      searchInputRef.current.focus();
    }
  }, []);

  const lowercasedQuery = searchQuery.toLowerCase();
  const filteredForms = searchQuery.trim() === '' ? allForms : allForms.filter(
    form => form.name.toLowerCase().includes(lowercasedQuery) ||
      form.status.toLowerCase().includes(lowercasedQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-neutral-800">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Master Jenis Surat
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            Kelola master formulir persyaratan permohonan surat dinas kelurahan.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/forms/new')}
          className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus size={15} />
          <span>Tambah jenis surat</span>
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xs p-4 sm:p-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari berdasarkan nama formulir atau status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>
        </div>

        {/* List of Forms */}
        {filteredForms.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-neutral-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-neutral-950"><tr>{['Nama Jenis Surat', 'Status', 'Respons'].map(label => <th key={label} scope="col" className="p-4 font-medium">{label}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                {filteredForms.map(form => <tr key={form.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/40">
                  <td className="p-4 font-medium text-slate-900 dark:text-white">{form.name}</td>
                  <td className="p-4 text-slate-600 dark:text-neutral-300">{form.status === 'Active' ? 'Aktif' : form.status === 'Draft' ? 'Draf' : form.status}</td>
                  <td className="p-4 tabular-nums text-slate-500 dark:text-neutral-400">{form.responses}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-slate-200 dark:border-neutral-800 rounded-xl bg-slate-50 dark:bg-neutral-950">
            <div className="w-10 h-10 bg-white dark:bg-neutral-900 rounded-lg flex items-center justify-center mb-3 shadow-xs border border-slate-200 dark:border-neutral-800">
              <FileText className="text-slate-400 w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
              Template Tidak Ditemukan
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mb-4">
              Tidak ada formulir yang cocok dengan kata kunci "{searchQuery}".
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-red-700 dark:text-red-400 font-semibold hover:underline cursor-pointer"
            >
              Hapus Filter Pencarian
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
