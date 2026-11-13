import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  Inbox,
  Calendar
} from 'lucide-react';
import dashboardAPI from '../../services/dashboardAPI';
import submissionAPI from '../../services/submissionAPI';
import { useAuth } from '../../contexts/AuthContext';
import { Skeleton } from '../../components/Loading';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const [statsRes, submissionsRes] = await Promise.all([
          dashboardAPI.getStats(),
          submissionAPI.getAllSubmissions({ limit: 5 })
        ]);

        if (isMounted) {
          if (statsRes.success) setStats(statsRes.data);
          if (submissionsRes.success) setRecentSubmissions(submissionsRes.data.slice(0, 5));
        }
      } catch {
        // Silently fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
            <Clock className="w-3 h-3" />
            Menunggu
          </span>
        );
      case 'diproses':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Diproses
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
            <CheckCircle2 className="w-3 h-3" />
            Selesai
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40">
            <XCircle className="w-3 h-3" />
            Ditolak
          </span>
        );
      default:
        return <span className="text-xs">{status}</span>;
    }
  };

  const statCards = [
    {
      title: 'Total Permohonan',
      value: stats ? stats.totalSubmissions : 0,
      icon: Inbox,
      color: 'text-slate-700 dark:text-neutral-300',
      bg: 'bg-slate-100 dark:bg-neutral-800'
    },
    {
      title: 'Menunggu Verifikasi',
      value: stats ? stats.pendingSubmissions : 0,
      icon: Clock,
      color: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40'
    },
    {
      title: 'Sedang Diproses',
      value: stats ? stats.processingSubmissions : 0,
      icon: RefreshCw,
      color: 'text-blue-700 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40'
    },
    {
      title: 'Surat Terbit (Selesai)',
      value: stats ? stats.completedSubmissions : 0,
      icon: CheckCircle2,
      color: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40'
    }
  ];

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Header Sederhana & Profesional */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{currentDateStr}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Dasbor Pelayanan
          </h2>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            Selamat datang, <span className="font-semibold text-slate-800 dark:text-neutral-200">{user?.name || 'Petugas'}</span>. Berikut ringkasan permohonan surat hari ini.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/admin/submissions/new')}
            className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Permohonan Baru (Walk-in)</span>
          </button>
        </div>
      </div>

      {/* Grid Statistik Kartu */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-neutral-400 truncate">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-md ${card.bg} ${card.color} shrink-0`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              {loading ? (
                <Skeleton variant="text" className="w-14 h-7" />
              ) : (
                <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
                  {card.value}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tabel Permohonan Terbaru */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Permohonan Masuk Terbaru
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Antrean surat yang baru diajukan oleh pemohon.
            </p>
          </div>
          <Link
            to="/admin/submissions"
            className="inline-flex items-center gap-1 text-xs text-red-700 dark:text-red-400 hover:underline font-semibold"
          >
            <span>Semua Permohonan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6">
            <Skeleton variant="card" count={3} />
          </div>
        ) : recentSubmissions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 dark:text-neutral-500">
            Belum ada permohonan surat masuk.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Kode Tiket</th>
                  <th className="px-4 py-3">Nama Pemohon</th>
                  <th className="px-4 py-3">Jenis Surat</th>
                  <th className="px-4 py-3">Kanal</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/60">
                {recentSubmissions.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-red-700 dark:text-red-400">
                      {item.trackingCode}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{item.nama}</p>
                      <p className="text-[11px] font-mono text-slate-400 dark:text-neutral-500">{item.nik}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-neutral-300">
                      {item.jenisSurat}
                    </td>
                    <td className="px-4 py-3">
                      {item.source === 'walk-in' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40">
                          Loket Offline
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400">
                          Portal Online
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/submissions/${item.id}`)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 rounded-md font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        Verifikasi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
