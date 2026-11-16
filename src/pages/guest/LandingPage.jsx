import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Users, GraduationCap, Stamp, Search, MapPin, Clock, ArrowUpRight, ShieldCheck } from 'lucide-react';
import GuestNavbar from '../../components/GuestNavbar';
import { GarudaLogo } from '../../components/IndonesiaSeal';
import CivicIllustration from '../../components/civic/CivicIllustration';
import './landing.css';

const services = [
  { title: 'Permohonan Audiensi', description: 'Sampaikan permohonan pertemuan, koordinasi, atau diskusi dengan pimpinan.', icon: Users },
  { title: 'Penelitian & Magang', description: 'Ajukan izin riset, penelitian akademik, atau praktik kerja lapangan.', icon: GraduationCap },
  { title: 'Surat Keterangan', description: 'Urus surat keterangan, rekomendasi, dan surat pengantar resmi.', icon: Stamp },
];
const steps = [
  ['Siapkan dokumen', 'Siapkan identitas dan surat permohonan beserta lampiran pendukung.'],
  ['Kirim pengajuan', 'Lengkapi formulir online dengan data yang benar dan unggah dokumen.'],
  ['Pantau proses', 'Simpan kode tracking. Gunakan NIK dan kode tersebut untuk melihat status.'],
  ['Terima hasil', 'Ikuti perkembangan verifikasi dan tindak lanjut melalui halaman pelacakan.'],
];

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState('beranda');
  const scrollToSection = (event, id) => {
    event?.preventDefault();
    setActiveSection(id);
    window.dispatchEvent(new CustomEvent('nav-gliding'));
    document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  };
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActiveSection(entry.target.id);
    }, { rootMargin: '-15% 0px -55% 0px' });
    for (const id of ['beranda', 'layanan', 'prosedur', 'informasi']) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);
  return <div className="landing-page">
    <a className="landing-skip" href="#konten-utama">Lewati navigasi</a>
    <GuestNavbar activeSection={activeSection} onScrollToSection={scrollToSection} />
    <main id="konten-utama">
      <section className="landing-hero landing-shell" id="beranda" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="landing-eyebrow"><span /> Portal Pelayanan Persuratan</p>
          <h1 id="hero-title">Urus surat Anda.<br /><span>Lebih mudah,</span><br />lebih terarah.</h1>
          <p className="hero-description">Ajukan permohonan dan pantau proses persuratan dalam satu portal. Layanan publik yang dapat Anda akses tanpa harus datang ke kantor.</p>
          <div className="hero-actions">
            <Link className="landing-button primary" to="/guest/submit">Ajukan Surat <ArrowRight size={18} aria-hidden="true" /></Link>
            <Link className="landing-button secondary" to="/guest/track"><Search size={18} aria-hidden="true" /> Lacak Pengajuan</Link>
          </div>
          <p className="hero-assurance"><ShieldCheck size={16} aria-hidden="true" /> Layanan persuratan tanpa biaya</p>
        </div>
        <CivicIllustration />
      </section>
      <div className="landing-service-bar"><div className="landing-shell service-bar-inner"><p><FileText aria-hidden="true" size={20} /><span><strong>Pengajuan secara online</strong> Akses formulir kapan pun Anda perlu</span></p><p><Search aria-hidden="true" size={20} /><span><strong>Proses dapat dipantau</strong> Gunakan NIK dan kode tracking Anda</span></p><p><Clock aria-hidden="true" size={20} /><span><strong>Jam pelayanan kantor</strong> Senin–Jumat, 08.00–16.00 WIB</span></p></div></div>
      <section id="layanan" className="landing-section landing-shell" aria-labelledby="services-title">
        <div className="section-heading"><div><p className="landing-eyebrow">Layanan Persuratan</p><h2 id="services-title">Apa yang Anda perlukan?</h2></div><p>Pilih kebutuhan Anda, lalu lengkapi pengajuan melalui formulir yang tersedia.</p></div>
        <div className="landing-services">{services.map(({ title, description, icon: Icon }, index) => <Link to="/guest/submit" key={title} className="landing-service"><div className="service-top"><Icon size={27} strokeWidth={1.5} aria-hidden="true" /><span>0{index + 1}</span></div><h3>{title}</h3><p>{description}</p><span className="service-link">Ajukan permohonan <ArrowUpRight size={18} aria-hidden="true" /></span></Link>)}</div>
      </section>
      <section id="prosedur" className="landing-procedure" aria-labelledby="procedure-title"><div className="landing-shell landing-section"><div className="section-heading"><div><p className="landing-eyebrow">Alur Pelayanan</p><h2 id="procedure-title">Dari pengajuan hingga tindak lanjut.</h2></div><p>Empat langkah sederhana untuk mengurus kebutuhan persuratan Anda.</p></div><ol className="landing-steps">{steps.map(([title, description], index) => <li key={title}><span className="step-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol><div className="tracking-note"><div><h3>Sudah mengirim pengajuan?</h3><p>Siapkan NIK dan kode tracking untuk melihat perkembangan surat Anda.</p></div><Link className="landing-text-link" to="/guest/track">Lacak status surat <ArrowRight size={18} aria-hidden="true" /></Link></div></div></section>
      <section id="informasi" className="landing-section landing-shell landing-info" aria-labelledby="info-title"><div><p className="landing-eyebrow">Informasi Layanan</p><h2 id="info-title">Sebelum Anda<br />mengajukan surat.</h2><p className="info-intro">Pastikan data dan dokumen Anda lengkap agar permohonan dapat ditindaklanjuti.</p><div className="office-note"><Clock size={20} aria-hidden="true" /><p><strong>Waktu pelayanan</strong><br />Senin–Jumat<br />08.00–16.00 WIB</p></div></div><div className="landing-faq">{[
        ['Apakah layanan ini berbayar?', 'Tidak. Layanan persuratan melalui portal ini tidak dipungut biaya.'],
        ['Apa yang perlu saya siapkan?', 'Siapkan identitas, surat permohonan, dan lampiran yang sesuai dengan kebutuhan pengajuan. Ikuti petunjuk dokumen pada formulir.'],
        ['Bagaimana cara melacak pengajuan?', 'Buka halaman Lacak Pengajuan, lalu masukkan NIK 16 digit dan kode tracking yang Anda terima setelah mengirim permohonan.'],
        ['Apa yang dilakukan jika data belum sesuai?', 'Periksa kembali identitas dan lampiran sebelum mengirim. Setelah pengajuan terkirim, pantau status dan catatan tindak lanjut pada halaman pelacakan.'],
      ].map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
      <section className="landing-cta"><div className="landing-shell"><div><p className="landing-eyebrow">Pelayanan dalam genggaman</p><h2>Mulai dari satu pengajuan.</h2><p>Siapkan dokumen Anda. Kami bantu arahkan prosesnya.</p></div><Link className="landing-button primary" to="/guest/submit">Ajukan Surat <ArrowRight size={18} aria-hidden="true" /></Link></div></section>
    </main>
    <footer className="landing-footer"><div className="landing-shell footer-main"><div><Link to="/guest" className="footer-brand"><GarudaLogo className="w-10 h-10" /><span><small>Republik Indonesia</small><strong>Portal e-Surat</strong></span></Link><p>Portal pelayanan persuratan<br />dan administrasi terpadu.</p></div><div><h3>Akses layanan</h3><Link to="/guest/submit">Pengajuan surat</Link><Link to="/guest/track">Lacak pengajuan</Link><Link to="/login">Portal administrator</Link></div><div><h3>Kantor pelayanan</h3><p className="footer-address"><MapPin size={18} aria-hidden="true" />Jl. Medan Merdeka Barat No. 17,<br />Jakarta Pusat</p><p>Senin–Jumat, 08.00–16.00 WIB</p></div></div><div className="landing-shell footer-bottom"><span>© {new Date().getFullYear()} Portal e-Surat</span><span>Melayani dengan tertib dan transparan.</span></div></footer>
  </div>;
}
