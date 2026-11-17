import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, RefreshCw, CheckCircle2, XCircle, Plus, ArrowRight, Inbox, Calendar } from 'lucide-react';
import dashboardAPI from '../../services/dashboardAPI';
import submissionAPI from '../../services/submissionAPI';
import { useAuth } from '../../contexts/useAuth';
import { Skeleton } from '../../components/Loading';

const statusMeta = {
  pending: { label: 'Menunggu', icon: Clock, style: 'bg-amber-50 text-amber-800' },
  diproses: { label: 'Diproses', icon: RefreshCw, style: 'bg-blue-50 text-blue-800' },
  selesai: { label: 'Selesai', icon: CheckCircle2, style: 'bg-emerald-50 text-emerald-800' },
  ditolak: { label: 'Ditolak', icon: XCircle, style: 'bg-red-50 text-red-800' }
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
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [statsRes, submissionsRes, activityRes] = await Promise.all([
          dashboardAPI.getStats(),
          submissionAPI.getAllSubmissions(),
          dashboardAPI.getRecentActivity().catch(() => ({ success: false }))
        ]);
        if (isMounted) {
          if (statsRes.success) setStats(statsRes.data);
          if (submissionsRes.success) { setSubmissions(submissionsRes.data); setRecentSubmissions([...submissionsRes.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)); }
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
  const panel = 'admin-panel rounded-2xl border border-[#e7e4dc] bg-white';
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - 6 + index);
    const next = new Date(date); next.setDate(next.getDate() + 1);
    const rows = submissions.filter(item => { const created = new Date(item.createdAt); return created >= date && created < next; });
    return { label: date.toLocaleDateString('id-ID', { weekday: 'short' }), date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), online: rows.filter(item => item.source !== 'walk-in').length, walkIn: rows.filter(item => item.source === 'walk-in').length };
  });
  const chartMax = Math.max(1, ...week.map(day => Math.max(day.online, day.walkIn)));
  const weeklyTotal = week.reduce((total, day) => total + day.online + day.walkIn, 0);

  return (
    <div className="space-y-7 text-sm text-slate-700">
      <header className="flex flex-col justify-between gap-5 pb-1 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 flex items-center gap-2 text-slate-500"><Calendar size={15} />{currentDateStr}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#292524] sm:text-3xl">Dashboard pelayanan</h1>
          <p className="mt-2 text-slate-500">Selamat datang, <span className="font-medium text-slate-700">{user?.name || 'Petugas'}</span>. Pantau dan kelola permohonan surat warga.</p>
        </div>
        <button type="button" onClick={() => navigate('/admin/submissions/new')} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#b32d32] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#92252a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b32d32]"><Plus size={17} />Permohonan walk-in</button>
      </header>

      {error && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">Sebagian data belum dapat dimuat. Muat ulang halaman untuk mencoba kembali.</p>}

      <section aria-label="Statistik permohonan" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return <Link to="/admin/submissions" key={card.title} className={`${panel} group p-5 transition-colors hover:border-[#9b7670] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b32d32]`}>
            <div className="flex items-center justify-between gap-2"><p className="text-slate-500">{card.title}</p><Icon size={17} className="shrink-0 text-[#b32d32]" /></div>
            {loading ? <Skeleton variant="text" className="mt-3 h-9 w-16" /> : <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-[#292524]">{card.value ?? '—'}</p>}
          </Link>;
        })}
      </section>

      <section className={panel + ' p-5 sm:p-6'} aria-labelledby="weekly-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h2 id="weekly-title" className="text-base font-semibold text-[#292524]">Permohonan mingguan</h2><p className="mt-1 text-slate-500">Jumlah permohonan masuk dalam 7 hari terakhir.</p></div>
          <div className="flex gap-4 text-xs text-slate-600"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#b32d32]" />Portal online</span><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#9b7670]" />Loket / walk-in</span></div>
        </div>
        {loading ? <Skeleton variant="card" className="mt-6 h-48" /> : <>
          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4 border-b border-[#e7e4dc] pb-5"><div><p className="text-3xl font-semibold tabular-nums text-[#292524]">{weeklyTotal}</p><p className="mt-1 text-xs text-slate-500">Total 7 hari terakhir</p></div></div>
          <div className="mt-6 grid grid-cols-7 gap-2 sm:gap-6" role="img" aria-label={'Grafik permohonan tujuh hari terakhir. ' + week.map(day => day.date + ': ' + day.online + ' online, ' + day.walkIn + ' walk-in').join('. ')}>
            {week.map(day => <div key={day.date} className="min-w-0 text-center">
              <div className="flex h-40 items-end justify-center gap-1 border-b border-slate-200 sm:gap-2">
                <div title={day.online + ' online'} className="w-3 max-w-8 flex-1 rounded-t bg-[#b32d32] sm:w-6" style={{ height: (day.online / chartMax * 100) + '%', minHeight: day.online ? 4 : 0 }} />
                <div title={day.walkIn + ' walk-in'} className="w-3 max-w-8 flex-1 rounded-t bg-[#9b7670] sm:w-6" style={{ height: (day.walkIn / chartMax * 100) + '%', minHeight: day.walkIn ? 4 : 0 }} />
              </div>
              <p className="mt-3 text-xs font-medium text-slate-600">{day.label}</p><p className="mt-1 text-[10px] text-slate-400 sm:text-xs">{day.date}</p>
            </div>)}
          </div>
          {weeklyTotal === 0 && <p className="mt-4 text-xs text-slate-500">Belum ada permohonan masuk dalam periode ini.</p>}
        </>}
      </section>

      <section className={panel} aria-labelledby="recent-title">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-5">
          <div><h2 id="recent-title" className="text-base font-semibold text-[#292524]">Permohonan terbaru</h2><p className="mt-1 text-slate-500">Lima permohonan terakhir yang masuk ke sistem.</p></div>
          <Link to="/admin/submissions" className="inline-flex items-center gap-2 font-medium text-[#92252a] hover:underline">Lihat semua<ArrowRight size={16} /></Link>
        </div>
        {loading ? <div className="p-5"><Skeleton variant="card" count={3} /></div> : recentSubmissions.length === 0 ? <div className="px-5 py-14 text-center"><Inbox size={28} className="mx-auto mb-3 text-slate-400" /><p className="font-medium text-slate-800">Belum ada permohonan</p><p className="mt-1 text-slate-500">Permohonan yang masuk akan ditampilkan di sini.</p></div> : <div className="overflow-x-auto rounded-b-xl">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500"><tr>{['Kode tiket', 'Pemohon', 'Jenis surat', 'Kanal', 'Status', ''].map((label, i) => <th key={i} scope="col" className="px-5 py-3.5 font-medium">{label || <span className="sr-only">Tindakan</span>}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {recentSubmissions.map(item => <tr key={item.id} className="transition-colors hover:bg-slate-50">
                <td className="px-5 py-4"><Link to={`/admin/submissions/${item.id}`} className="whitespace-nowrap font-mono text-xs font-medium text-slate-800 hover:text-[#92252a] hover:underline">{item.trackingCode}</Link></td>
                <td className="px-5 py-4"><p className="font-medium text-slate-900">{item.nama}</p><p className="mt-1 text-xs tabular-nums text-slate-500">{item.nik}</p></td>
                <td className="px-5 py-4">{item.jenisSurat}</td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-500">{item.source === 'walk-in' ? 'Loket / walk-in' : 'Portal online'}</td>
                <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                <td className="px-5 py-4 text-right"><button type="button" onClick={() => navigate(`/admin/submissions/${item.id}`)} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400 hover:bg-white" aria-label={`Verifikasi permohonan ${item.trackingCode}`}>Verifikasi</button></td>
              </tr>)}
            </tbody>
          </table>
        </div>}
      </section>

      <section className={panel} aria-labelledby="activity-title">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4"><div><h2 id="activity-title" className="text-base font-semibold text-[#292524]">Aktivitas terbaru</h2><p className="mt-1 text-slate-500">Lima tindakan petugas terbaru dari catatan audit lokal.</p></div><Link to="/admin/activity" className="inline-flex items-center gap-2 font-medium text-[#92252a] hover:underline">Lihat semua aktivitas<ArrowRight size={16} /></Link></div>
        {loading ? <div className="p-5"><Skeleton variant="text" count={3} /></div> : activities.length === 0 ? <p className="px-5 py-8 text-slate-500">Belum ada aktivitas untuk ditampilkan.</p> : <ul className="divide-y divide-slate-100">{activities.map(activity => <li key={activity.id} className="flex items-start gap-3 px-5 py-4"><span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"><Clock size={14} /></span><div className="min-w-0 flex-1"><p className="font-medium text-slate-800">{activity.title}</p><p className="mt-1 text-xs text-slate-500">{activity.description}</p></div><span className="shrink-0 pt-1 text-xs tabular-nums text-slate-500">{activity.time}</span></li>)}</ul>}
      </section>
    </div>
  );
}
