import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from '../../contexts/FormContext';

export default function Forms() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredForms, setFilteredForms] = useState([]);
  const searchInputRef = useRef(null);

  const navigate = useNavigate();
  const { forms: allForms } = useFormContext();

  useEffect(() => {
    if (searchInputRef.current && window.innerWidth >= 768) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredForms(allForms);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = allForms.filter(
        (form) =>
          form.name.toLowerCase().includes(lowercasedQuery) ||
          form.status.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredForms(filtered);
    }
  }, [searchQuery, allForms]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-neutral-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Template & Formulir Surat
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
          <span>Buat Template Baru</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="p-4 border border-slate-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 hover:border-slate-300 dark:hover:border-neutral-700 transition-colors shadow-xs"
              >
                <div className="flex justify-between items-start mb-2.5">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-neutral-300">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        form.status === 'Active'
                          ? 'bg-emerald-500'
                          : form.status === 'Draft'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    {form.status === 'Active' ? 'Aktif' : form.status === 'Draft' ? 'Draf' : form.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                    {form.responses} respons
                  </span>
                </div>
                <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                  {form.name}
                </h3>
              </div>
            ))}
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
