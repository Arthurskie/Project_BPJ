import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from '../../contexts/FormContext';

export default function Forms() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredForms, setFilteredForms] = useState([]);
  const searchInputRef = useRef(null);

  const navigate = useNavigate();
  const { forms: allForms } = useFormContext();

  // Auto focus search on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Filter logic
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredForms(allForms);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = allForms.filter(form => 
        form.name.toLowerCase().includes(lowercasedQuery) ||
        form.status.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredForms(filtered);
    }
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Manage Forms</h2>
          <p className="text-slate-500 dark:text-neutral-400 text-sm mt-1">Create, edit, and view all your forms in one place.</p>
        </div>
        <button 
          onClick={() => navigate('/forms/new')}
          className="flex items-center gap-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
          <Plus size={16} />
          Create Form
        </button>
      </div>

      <div className="bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl shadow-sm p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search forms by name or status..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-black border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-400 transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 hover:bg-slate-50 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-700 dark:text-neutral-300 text-sm font-medium transition-colors shadow-sm">
            <Filter size={16} />
            Filters
          </button>
        </div>

        {/* List or Empty State */}
        {filteredForms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredForms.map(form => (
              <div key={form.id} className="p-5 border border-slate-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900/50 hover:border-slate-300 dark:hover:border-neutral-700 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-3">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-neutral-300">
                    <span className={`w-2 h-2 rounded-full ${
                      form.status === 'Active' ? 'bg-emerald-500' :
                      form.status === 'Draft' ? 'bg-amber-500' :
                      'bg-slate-400 dark:bg-neutral-500'
                    }`}></span>
                    {form.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400 bg-slate-50 dark:bg-black px-2 py-1 rounded-md border border-slate-200 dark:border-neutral-700">
                    {form.responses} <span className="font-normal text-slate-400 dark:text-neutral-500">resp</span>
                  </span>
                </div>
                <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{form.name}</h3>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-slate-300 dark:border-neutral-700 rounded-xl bg-slate-50 dark:bg-neutral-900/50">
            <div className="w-12 h-12 bg-white dark:bg-neutral-900 rounded-lg flex items-center justify-center mb-4 shadow-sm border border-slate-200 dark:border-neutral-700">
              <FileTextIcon className="text-slate-400 dark:text-neutral-500 w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No forms found</h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mb-6">We couldn't find any forms matching "{searchQuery}".</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FileTextIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  )
}
