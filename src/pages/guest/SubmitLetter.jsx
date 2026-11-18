import { Link } from 'react-router-dom';
import GuestNavbar from '../../components/GuestNavbar';
import DynamicSubmissionForm from '../../components/DynamicSubmissionForm';
import './landing.css';
import './submit-letter.css';
export default function SubmitLetter() {
 return <div className="landing-page submission-page min-h-screen flex flex-col"><GuestNavbar/><a href="#submission-form" className="landing-skip">Langsung ke formulir</a><section className="submission-intro" aria-labelledby="submission-title"><div className="submission-shell"><Link to="/guest" className="submission-back">Beranda / Pengajuan surat</Link><p className="submission-eyebrow">Layanan Persuratan</p><h1 id="submission-title">Pengajuan surat</h1><p>Lengkapi formulir sesuai jenis surat yang Anda perlukan.</p></div></section><main id="submission-form" className="submission-main flex-1" tabIndex={-1}><div className="submission-shell submission-layout"><aside className="submission-guidance"><p className="submission-eyebrow">Sebelum mengirim</p><h2>Siapkan data Anda</h2><p>Pastikan data benar sebelum mengirim. Simpan kode permohonan dan kode akses pada tanda terima untuk melacak status.</p><p>Data hanya dikirim ke layanan saat Anda mengonfirmasi pengajuan; tidak disimpan di penyimpanan browser.</p><Link to="/guest/track">Lacak permohonan</Link></aside><DynamicSubmissionForm/></div></main></div>;
}
