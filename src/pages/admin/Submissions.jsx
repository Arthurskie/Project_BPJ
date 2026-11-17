import { querySubmissions } from '../../domain/workflow.js';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Plus,
  Eye,
  FileCheck2
} from 'lucide-react';
import submissionAPI from '../../services/submissionAPI';
import { useAuth } from '../../contexts/useAuth';
import { Skeleton } from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Alert from '../../components/Alert';
import ConfirmModal from '../../components/ConfirmModal';

export default function Submissions() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [submissions, setSubmissions] = useState([]);
  const [queue, setQueue] = useState({type:'',from:'',to:'',sort:'newest',page:1,pageSize:10});
  const result = querySubmissions(submissions, queue);
  const updateQueue = (key,value) => setQueue(prev => ({...prev,[key]:value,page:key === 'page' ? value : 1}));
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [alert, setAlert] = useState(null);

  // State Modal Cepat Update Status
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState('diproses'); // 'diproses' | 'selesai' | 'ditolak'
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const [request, setRequest] = useState({ statusFilter: 'all', search: '' });

  const fetchSubmissions = (override = {}) => {
    setLoading(true);
    setRequest({ statusFilter, search, ...override, ...(override.status !== undefined ? { statusFilter: override.status } : {}) });
  };

  const changeFilter = (value) => {
    setStatusFilter(value);
    setLoading(true);
    setRequest({ statusFilter: value, search });
  };

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await submissionAPI.getAllSubmissions({ status: request.statusFilter, search: request.search });
        if (active && res.success) {
          setSubmissions(res.data);
          setQueue(prev => ({...prev,page:1}));
        }
      } catch {
        if (active) { setAlert({ type: 'error', message: 'Gagal mengambil data permohonan surat.' }); }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [request]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSubmissions();
  };

  const handleOpenAction = (item, type, e) => {
    e.stopPropagation();
    setSelectedItem(item);
    setActionType(type);
    setNotes(type === 'ditolak' ? '' : 'Dokumen sedang diproses.');
    setModalOpen(true);
  };

  const handleConfirmStatus = async () => {
    if (!selectedItem) return;
    setUpdating(true);
    try {
      await submissionAPI.updateStatus(selectedItem.id, actionType, notes, {
        adminId: user?.id || user?.nip || 'admin',
        adminName: user?.name || 'Petugas Verifikator'
      });
      setAlert({
        type: 'success',
        message: `Status permohonan ${selectedItem.trackingCode} berhasil diubah menjadi ${actionType.toUpperCase()}.`
      });
      setModalOpen(false);
      fetchSubmissions();
    } catch {
      setAlert({ type: 'error', message: 'Gagal memperbarui status permohonan surat.' });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50  text-amber-700  border border-amber-200 ">
            <Clock className="w-3 h-3" />
            Menunggu
          </span>
        );
      case 'diproses':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50  text-blue-700  border border-blue-200 ">
            <RefreshCw className="w-3 h-3" />
            Diproses
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50  text-emerald-700  border border-emerald-200 ">
            <CheckCircle2 className="w-3 h-3" />
            Selesai
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50  text-red-700  border border-red-200 ">
            <XCircle className="w-3 h-3" />
            Ditolak
          </span>
        );
      default:
        return <span className="text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & New Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#292524]  tracking-tight">
            Permohonan Masuk
          </h2>
          <p className="text-xs text-[#78716c]  mt-1">
            Tinjau pengajuan warga dan kelola proses penerbitan surat.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => navigate('/admin/submissions/new')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#b32d32] hover:bg-[#92252a] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Permohonan</span>
          </button>

          <button
            type="button"
            onClick={() => fetchSubmissions()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white  border border-[#d9d5cb]  rounded-2xl text-xs font-semibold text-[#44403c]  hover:bg-[#f8f7f3]  transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Alert Notifikasi */}
      {alert && (
        <Alert
          type={alert.type}
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white  border border-[#e7e4dc] bg-white rounded-2xl p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-[#78716c] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Cari permohonan" placeholder="Cari nama, NIK, atau kode tracking..."
            className="w-full pl-9 pr-4 py-2 bg-[#f8f7f3]  border border-[#e7e4dc]  rounded-lg text-xs text-[#292524]  placeholder:text-[#78716c] focus:outline-none focus:border-[#b32d32] focus:ring-1 focus:ring-[#b32d32] transition-colors"
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#78716c] shrink-0" />
          <select
            aria-label="Filter status permohonan"
            value={statusFilter}
            onChange={(e) => changeFilter(e.target.value)}
            className="px-3 py-2 bg-[#f8f7f3]  border border-[#e7e4dc]  rounded-lg text-xs text-[#292524]  font-medium focus:outline-none focus:border-[#b32d32] cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu Verifikasi</option>
            <option value="diproses">Sedang Diproses</option>
            <option value="selesai">Selesai / Terbit</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      <section aria-label="Filter antrean" className="grid grid-cols-1 gap-4 rounded-2xl border border-[#e7e4dc] bg-white p-4   sm:grid-cols-2 sm:p-5 xl:grid-cols-4">
        <label className="space-y-1.5 text-xs font-medium text-[#57534e] ">
          <span className="block">Jenis surat</span>
          <select className="min-h-11 w-full min-w-0 px-3 py-2 bg-[#f8f7f3]  border border-[#e7e4dc]  rounded-lg text-xs text-[#292524]  focus:outline-none focus:border-[#b32d32] focus:ring-1 focus:ring-[#b32d32] transition-colors [color-scheme:light] " value={queue.type} onChange={e => updateQueue('type', e.target.value)}>
            <option value="">Semua jenis</option>
            {[...new Set(submissions.map(row => row.jenisSurat))].map(name => <option key={name}>{name}</option>)}
          </select>
        </label>
        <label className="space-y-1.5 text-xs font-medium text-[#57534e] ">
          <span className="block">Dari tanggal</span>
          <input className="min-h-11 w-full min-w-0 px-3 py-2 bg-[#f8f7f3]  border border-[#e7e4dc]  rounded-lg text-xs text-[#292524]  focus:outline-none focus:border-[#b32d32] focus:ring-1 focus:ring-[#b32d32] transition-colors [color-scheme:light] " type="date" value={queue.from} onChange={e => updateQueue('from', e.target.value)} />
        </label>
        <label className="space-y-1.5 text-xs font-medium text-[#57534e] ">
          <span className="block">Sampai tanggal</span>
          <input className="min-h-11 w-full min-w-0 px-3 py-2 bg-[#f8f7f3]  border border-[#e7e4dc]  rounded-lg text-xs text-[#292524]  focus:outline-none focus:border-[#b32d32] focus:ring-1 focus:ring-[#b32d32] transition-colors [color-scheme:light] " type="date" value={queue.to} onChange={e => updateQueue('to', e.target.value)} />
        </label>
        <label className="space-y-1.5 text-xs font-medium text-[#57534e] ">
          <span className="block">Urutan</span>
          <select className="min-h-11 w-full min-w-0 px-3 py-2 bg-[#f8f7f3]  border border-[#e7e4dc]  rounded-lg text-xs text-[#292524]  focus:outline-none focus:border-[#b32d32] focus:ring-1 focus:ring-[#b32d32] transition-colors [color-scheme:light] " value={queue.sort} onChange={e => updateQueue('sort', e.target.value)}>
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
          </select>
        </label>
      </section>
      {/* Table Data / Loading / Empty State */}
      <div className="bg-white  border border-[#e7e4dc] bg-white rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8">
            <Skeleton variant="card" count={3} />
          </div>
        ) : result.total === 0 ? (
          <EmptyState
            icon={FileText}
            title="Tidak Ada Permohonan Surat"
            description="Tidak ada data permohonan yang sesuai dengan filter atau kata kunci pencarian Anda."
            action={
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setQueue(prev => ({...prev,type:'',from:'',to:'',page:1}));
                  fetchSubmissions({status:'all',search:''});
                }}
                className="px-3.5 py-1.5 bg-[#f1efe8] hover:bg-[#e7e4dc]   text-[#44403c]  text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Reset Filter Pencarian
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f7f3]  border-b border-[#e7e4dc]  text-[#78716c]  font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-4 py-3">Kode Tracking</th>
                  <th className="px-4 py-3">Pemohon & NIK</th>
                  <th className="px-4 py-3">Jenis Surat</th>
                  <th className="px-4 py-3">Sumber</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tanggal Masuk</th>
                  <th className="px-4 py-3 text-right">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e4dc] ">
                {result.data.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/admin/submissions/${item.id}`)}
                    className="hover:bg-[#f8f7f3]  transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-[#292524] ">
                      {item.trackingCode}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-[#292524]  group-hover:text-[#b32d32]  transition-colors">
                        {item.nama}
                      </p>
                      <p className="text-xs font-mono text-[#78716c] ">
                        {item.nik}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-[#44403c] ">
                      <div>{item.jenisSurat}</div>
                      {item.nomorSurat && (
                        <div className="text-xs font-mono text-[#78716c]">
                          No: {item.nomorSurat}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {item.source === 'walk-in' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#fdf0ef]  text-[#876a30]  border border-[#e1d4b9] ">
                          Loket
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f1efe8]  text-[#57534e] ">
                          Online
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-3.5 text-[#78716c]  text-xs">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/submissions/${item.id}`)}
                          className="px-2.5 py-1 bg-[#f1efe8] hover:bg-[#e7e4dc]   text-[#44403c]  rounded font-semibold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Detail</span>
                        </button>
                        {item.status === 'pending' && (
                          <button
                            type="button"
                            onClick={(e) => handleOpenAction(item, 'diproses', e)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100   text-blue-700  rounded font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Proses
                          </button>
                        )}
                        {item.status === 'diproses' && (
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/submissions/${item.id}`)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100   text-emerald-700  rounded font-semibold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <FileCheck2 className="w-3 h-3" />
                            <span>Verifikasi</span>
                          </button>
                        )}
                        {item.status !== 'ditolak' && item.status !== 'selesai' && (
                          <button
                            type="button"
                            onClick={(e) => handleOpenAction(item, 'ditolak', e)}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100   text-red-700  rounded font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Tolak
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && (
          <div className="flex flex-col gap-3 border-t border-[#e7e4dc] bg-[#f8f7f3]/60 px-4 py-4   sm:flex-row sm:items-center sm:justify-between">
            <p role="status" aria-live="polite" className="text-xs text-[#78716c] ">
              <span className="font-semibold text-[#44403c] ">{result.total} hasil</span>
              <span className="mx-2" aria-hidden="true">·</span>
              Halaman {result.page} dari {result.pages}
            </p>
            <nav aria-label="Halaman antrean permohonan" className="flex items-center gap-2">
              <button type="button" className="min-h-11 flex-1 sm:flex-none px-3.5 py-2 rounded-lg border border-[#d9d5cb]  bg-white  text-xs font-semibold text-[#44403c]  hover:bg-[#f8f7f3]  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b32d32] focus-visible:ring-offset-2  disabled:cursor-not-allowed disabled:border-[#e7e4dc] disabled:bg-[#f8f7f3] disabled:text-[#78716c]    transition-colors" disabled={result.page <= 1} onClick={() => updateQueue('page', result.page - 1)}>Sebelumnya</button>
              <button type="button" className="min-h-11 flex-1 sm:flex-none px-3.5 py-2 rounded-lg border border-[#d9d5cb]  bg-white  text-xs font-semibold text-[#44403c]  hover:bg-[#f8f7f3]  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b32d32] focus-visible:ring-offset-2  disabled:cursor-not-allowed disabled:border-[#e7e4dc] disabled:bg-[#f8f7f3] disabled:text-[#78716c]    transition-colors" disabled={result.page >= result.pages} onClick={() => updateQueue('page', result.page + 1)}>Berikutnya</button>
            </nav>
          </div>
        )}
      </div>


      {/* Modal Dialog Konfirmasi Perubahan Status Cepat */}
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmStatus}
        loading={updating}
        type={actionType === 'ditolak' ? 'danger' : actionType === 'selesai' ? 'success' : 'primary'}
        title={`Konfirmasi Ubah Status ke ${actionType.toUpperCase()}`}
        message={
          <div className="space-y-3">
            <p>
              Anda akan mengubah status permohonan surat <strong>{selectedItem?.trackingCode}</strong> milik <strong>{selectedItem?.nama}</strong>.
            </p>
            <div>
              <label className="block text-xs font-semibold text-[#44403c]  mb-1">
                Catatan Petugas (Akan tampil pada Cek Status Warga):
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 bg-[#f8f7f3]  border border-[#d9d5cb]  rounded-lg text-xs text-[#292524]  focus:outline-none focus:border-[#b32d32]"
              />
            </div>
          </div>
        }
        confirmText={`Ya, ${actionType === 'selesai' ? 'Setujui Surat' : actionType === 'ditolak' ? 'Tolak Permohonan' : 'Proses Dokumen'}`}
        cancelText="Batalkan"
      />
    </div>
  );
}


