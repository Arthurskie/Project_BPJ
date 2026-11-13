import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  CheckCircle2,
  XCircle,
  FilePlus2,
  RefreshCw
} from 'lucide-react';
import auditLogAPI from '../../services/auditLogAPI';
import { Skeleton } from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

const ACTION_FILTERS = [
  { label: 'Semua Aktivitas', value: 'all' },
  { label: 'Persetujuan Surat', value: 'verify_submission' },
  { label: 'Penolakan Surat', value: 'reject_submission' },
  { label: 'Input Walk-in Loket', value: 'create_walkin' },
  { label: 'Ubah Status', value: 'update_status' }
];

export default function Activity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditLogAPI.getAuditLogs({
        action: actionFilter,
        search
      });
      if (res.success) {
        setLogs(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'verify_submission':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'reject_submission':
        return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'create_walkin':
        return <FilePlus2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'update_status':
        return <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <History className="w-4 h-4 text-slate-600 dark:text-neutral-400" />;
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'verify_submission':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Disetujui / Diterbitkan
          </span>
        );
      case 'reject_submission':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            Ditolak
          </span>
        );
      case 'create_walkin':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Walk-in Loket
          </span>
        );
      case 'update_status':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Ubah Status
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Log Aktivitas & Audit Trail
        </h2>
        <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
          Catatan riwayat seluruh tindakan verifikasi, penerbitan surat, penolakan, dan input loket oleh petugas secara atomik untuk akuntabilitas.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-3">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama petugas, nomor tiket, atau rincian tindakan..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-red-600"
          />
        </form>

        {/* Action Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {ACTION_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setActionFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                actionFilter === f.value
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Content */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
        {loading ? (
          <div className="space-y-4">
            <Skeleton variant="card" count={4} />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={History}
            title="Tidak Ada Catatan Log Aktivitas"
            description="Belum ada riwayat aktivitas yang sesuai dengan filter pencarian saat ini."
            action={
              <button
                type="button"
                onClick={() => {
                  setActionFilter('all');
                  setSearch('');
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            }
          />
        ) : (
          <div className="relative border-l-2 border-slate-200 dark:border-neutral-800 ml-3 sm:ml-4 space-y-6 py-2">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-6 sm:pl-8">
                {/* Node Dot */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-neutral-900 border-2 border-slate-800 dark:border-neutral-200 flex items-center justify-center" />

                <div className="bg-slate-50 dark:bg-neutral-950/70 p-4 rounded-xl border border-slate-200 dark:border-neutral-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                        {getActionIcon(log.action)}
                      </div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {log.adminName}
                      </span>
                      {getActionBadge(log.action)}
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-neutral-300 leading-relaxed">
                    {log.details}
                  </p>

                  {log.targetId && (
                    <div className="pt-1 text-[11px] text-slate-500 dark:text-neutral-400 flex items-center gap-1.5 font-mono">
                      <span>Target:</span>
                      <span className="font-semibold text-red-700 dark:text-red-400">
                        {log.targetId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
