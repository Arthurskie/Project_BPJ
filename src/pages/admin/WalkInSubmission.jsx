import { Link } from 'react-router-dom';
import DynamicSubmissionForm from '../../components/DynamicSubmissionForm';
export default function WalkInSubmission() {
 return <div className="max-w-5xl mx-auto space-y-6"><div><Link to="/admin/submissions" className="text-sm text-slate-600 hover:text-red-700">Kembali ke permohonan</Link><h1 className="text-2xl font-bold text-slate-900 mt-2">Pengajuan Loket</h1><p className="text-sm text-slate-500 mt-1">Catat permohonan warga. Status awal menunggu dan mengikuti alur persetujuan yang sama.</p></div><DynamicSubmissionForm walkIn/></div>;
}
