import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, RefreshCw, CheckCircle2, XCircle, Plus, ArrowRight, Inbox, Calendar } from 'lucide-react';
import dashboardAPI from '../../services/dashboardAPI';
import submissionAPI from '../../services/submissionAPI';
import { useAuth } from '../../contexts/useAuth';
import { Skeleton } from '../../components/Loading';

const statusMeta = {
  pending: { label: 'Menunggu', icon: Clock, style: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' },
  diproses: { label: 'Diproses', icon: RefreshCw, style: 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300' },
  selesai: { label: 'Selesai', icon: CheckCircle2, style: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' },
  ditolak: { label: 'Ditolak', icon: XCircle, style: 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300' }
};

function StatusBadge({ status }) {
  const meta = statusMeta[status];
  if (!meta) return <span>{status || '—'}</span>;
  const Icon = meta.icon;
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ${meta.style}`}><Icon size={13} />{meta.label}</span>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [statsRes, submissionsRes, activityRes] = await Promise.all([
          dashboardAPI.getStats(),
          submissionAPI.getAllSubmissions({ limit: 5 }),
          dashboardAPI.getRecentActivity().catch(() => ({ success: false }))
        ]);
        if (isMounted) {
          if (statsRes.success) setStats(statsRes.data);
          if (submissionsRes.success) setRecentSubmissions(submissionsRes.data.slice(0, 5));
          if (activityRes.success) setActivities(activityRes.data.slice(0, 5));
          if (!statsRes.success || !submissionsRes.success) setError(true);
        }
      } catch {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboardData();
    return () => { isMounted = false; };
  }, []);

  const statCards = [
    { title: 'Total permohonan', value: stats?.totalSubmissions, icon: Inbox },
    { title: 'Menunggu verifikasi', value: stats?.pendingSubmissions, icon: Clock },
    { title: 'Sedang diproses', value: stats?.processingSubmissions, icon: RefreshCw },
    { title: 'Surat selesai', value: stats?.completedSubmissions, icon: CheckCircle2 }
  ];
  const currentDateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const panel = 'rounded-xl border border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-900';

  return (
    <div className="space-y-7 text-sm text-slate-700 dark:text-neutral-300">
      <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-center dark:border-neutral-800">
        <div>
          <p className="mb-2 flex items-center gap-2 text-slate-500 dark:text-neutral-400"><Calendar size={15} />{currentDateStr}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-white">Ringkasan pelayanan</h1>
          <p className="mt-2 text-slate-500 dark:text-neutral-400">Selamat datang, <span className="font-medium text-slate-700 dark:text-neutral-200">{user?.name || 'Petugas'}</span>. Pantau dan kelola permohonan surat warga.</p>
        </div>
        <button type="button" onClick={() => navigate('/admin/submissions/new')} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"><Plus size={17} />Permohonan walk-in</button>
      </header>

      {error && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">Sebagian data belum dapat dimuat. Muat ulang halaman untuk mencoba kembali.</p>}

      <section aria-label="Statistik permohonan" className={`${panel} grid grid-cols-2 overflow-hidden lg:grid-cols-4`}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return <Link to="/admin/submissions" key={card.title} className={`group p-5 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-red-700 dark:hover:bg-neutral-800/50 ${index > 0 ? 'border-l border-slate-200 dark:border-neutral-800' : ''} ${index > 1 ? 'border-t lg:border-t-0' : ''} ${index === 2 ? 'max-lg:border-l-0' : ''}`}>
            <div className="flex items-center justify-between gap-2"><p className="text-slate-500 dark:text-neutral-400">{card.title}</p><Icon size={17} className="shrink-0 text-slate-400 dark:text-neutral-500" /></div>
            {loading ? <Skeleton variant="text" className="mt-3 h-9 w-16" /> : <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-slate-950 dark:text-white">{card.value ?? '—'}</p>}
          </Link>;
        })}
      </section>

      <section className={panel} aria-labelledby="recent-title">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-5 dark:border-neutral-800">
          <div><h2 id="recent-title" className="text-base font-semibold text-slate-950 dark:text-white">Permohonan terbaru</h2><p className="mt-1 text-slate-500 dark:text-neutral-400">Lima permohonan terakhir yang masuk ke sistem.</p></div>
          <Link to="/admin/submissions" className="inline-flex items-center gap-2 font-medium text-red-700 hover:underline dark:text-red-400">Lihat semua<ArrowRight size={16} /></Link>
        </div>
        {loading ? <div className="p-5"><Skeleton variant="card" count={3} /></div> : recentSubmissions.length === 0 ? <div className="px-5 py-14 text-center"><Inbox size={28} className="mx-auto mb-3 text-slate-400" /><p className="font-medium text-slate-800 dark:text-neutral-200">Belum ada permohonan</p><p className="mt-1 text-slate-500 dark:text-neutral-400">Permohonan yang masuk akan ditampilkan di sini.</p></div> : <div className="overflow-x-auto rounded-b-xl">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500 dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-400"><tr>{['Kode tiket', 'Pemohon', 'Jenis surat', 'Kanal', 'Status', ''].map((label, i) => <th key={i} scope="col" className="px-5 py-3.5 font-medium">{label || <span className="sr-only">Tindakan</span>}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
              {recentSubmissions.map(item => <tr key={item.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800/40">
                <td className="px-5 py-4"><Link to={`/admin/submissions/${item.id}`} className="whitespace-nowrap font-mono text-xs font-medium text-slate-800 hover:text-red-700 hover:underline dark:text-neutral-200">{item.trackingCode}</Link></td>
                <td className="px-5 py-4"><p className="font-medium text-slate-900 dark:text-white">{item.nama}</p><p className="mt-1 text-xs tabular-nums text-slate-500 dark:text-neutral-400">{item.nik}</p></td>
                <td className="px-5 py-4">{item.jenisSurat}</td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-500 dark:text-neutral-400">{item.source === 'walk-in' ? 'Loket / walk-in' : 'Portal online'}</td>
                <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                <td className="px-5 py-4 text-right"><button type="button" onClick={() => navigate(`/admin/submissions/${item.id}`)} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400 hover:bg-white dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800" aria-label={`Verifikasi permohonan ${item.trackingCode}`}>Verifikasi</button></td>
              </tr>)}
            </tbody>
          </table>
        </div>}
      </section>

      <section className={panel} aria-labelledby="activity-title">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-neutral-800"><h2 id="activity-title" className="text-base font-semibold text-slate-950 dark:text-white">Aktivitas terbaru</h2><p className="mt-1 text-slate-500 dark:text-neutral-400">Tindakan petugas dari catatan audit lokal.</p></div>
        {loading ? <div className="p-5"><Skeleton variant="text" count={3} /></div> : activities.length === 0 ? <p className="px-5 py-8 text-slate-500 dark:text-neutral-400">Belum ada aktivitas untuk ditampilkan.</p> : <ul className="divide-y divide-slate-100 dark:divide-neutral-800">{activities.map(activity => <li key={activity.id} className="flex items-start gap-3 px-5 py-4"><span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-neutral-400"><Clock size={14} /></span><div className="min-w-0 flex-1"><p className="font-medium text-slate-800 dark:text-neutral-200">{activity.title}</p><p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">{activity.description}</p></div><span className="shrink-0 pt-1 text-xs tabular-nums text-slate-500 dark:text-neutral-400">{activity.time}</span></li>)}</ul>}
      </section>
    </div>
  );
}
