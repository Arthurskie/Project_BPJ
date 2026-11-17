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

  const [request, setRequest] = useState({ actionFilter: 'all', search: '' });

  const fetchLogs = (override = {}) => {
    setLoading(true);
    setRequest({ actionFilter, search, ...override });
  };

  const changeFilter = (value) => {
    setActionFilter(value);
    setLoading(true);
    setRequest({ actionFilter: value, search });
  };

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await auditLogAPI.getAuditLogs({ action: request.actionFilter, search: request.search });
        if (active && res.success) {
          setLogs(res.data);
        }
      } catch {
        if (active) {  }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [request]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'verify_submission':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 " />;
      case 'reject_submission':
        return <XCircle className="w-4 h-4 text-red-600 " />;
      case 'create_walkin':
        return <FilePlus2 className="w-4 h-4 text-blue-600 " />;
      case 'update_status':
        return <RefreshCw className="w-4 h-4 text-amber-600 " />;
      default:
        return <History className="w-4 h-4 text-[#57534e] " />;
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'verify_submission':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50  text-emerald-700  border border-emerald-200 ">
            Disetujui / Diterbitkan
          </span>
        );
      case 'reject_submission':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-50  text-red-700  border border-red-200 ">
            Ditolak
          </span>
        );
      case 'create_walkin':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50  text-blue-700  border border-blue-200 ">
            Walk-in Loket
          </span>
        );
      case 'update_status':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50  text-amber-700  border border-amber-200 ">
            Ubah Status
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#f1efe8]  text-[#44403c] ">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#292524]  tracking-tight">
          Log Aktivitas & Audit Trail
        </h2>
        <p className="text-xs text-[#78716c]  mt-1">
          Catatan riwayat seluruh tindakan verifikasi, penerbitan surat, penolakan, dan input loket oleh petugas secara atomik untuk akuntabilitas.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white  border border-[#e7e4dc] bg-white rounded-2xl p-4 shadow-xs space-y-3">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-[#78716c] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama petugas, nomor tiket, atau rincian tindakan..."
            className="w-full pl-9 pr-4 py-2 bg-[#f8f7f3]  border border-[#e7e4dc]  rounded-lg text-xs text-[#292524]  placeholder:text-[#78716c] focus:outline-none focus:border-[#b32d32]"
          />
        </form>

        {/* Action Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {ACTION_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => changeFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                actionFilter === f.value
                  ? 'bg-[#b32d32] text-white shadow-xs'
                  : 'bg-[#f1efe8] hover:bg-[#e7e4dc]   text-[#44403c] '
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Content */}
      <div className="bg-white  border border-[#e7e4dc] bg-white rounded-2xl p-5 shadow-xs">
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
                  fetchLogs({ actionFilter: 'all', search: '' });
                }}
                className="px-3.5 py-1.5 bg-[#f1efe8] hover:bg-[#e7e4dc]   text-[#44403c]  text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            }
          />
        ) : (
          <div className="relative border-l-2 border-[#e7e4dc]  ml-3 sm:ml-4 space-y-6 py-2">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-6 sm:pl-8">
                {/* Node Dot */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white  border-2 border-slate-800  flex items-center justify-center" />

                <div className="bg-[#f8f7f3]  p-4 rounded-2xl border border-[#e7e4dc]  space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-white  border border-[#e7e4dc] ">
                        {getActionIcon(log.action)}
                      </div>
                      <span className="font-bold text-xs text-[#292524] ">
                        {log.adminName}
                      </span>
                      {getActionBadge(log.action)}
                    </div>

                    <span className="text-xs font-mono text-[#78716c]">
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-[#44403c]  leading-relaxed">
                    {log.details}
                  </p>

                  {log.targetId && (
                    <div className="pt-1 text-xs text-[#78716c]  flex items-center gap-1.5 font-mono">
                      <span>Target:</span>
                      <span className="font-semibold text-[#292524] ">
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

