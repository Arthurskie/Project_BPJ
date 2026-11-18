import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Search, MapPin, Clock, ArrowUpRight, ShieldCheck } from 'lucide-react';
import GuestNavbar from '../../components/GuestNavbar';
import { GarudaLogo } from '../../components/IndonesiaSeal';
import CivicIllustration from '../../components/civic/CivicIllustration';
import './landing.css';
import letterTypeAPI from '../../services/letterTypeAPI';
import { shouldResetLandingOnReload, landingSections, getSectionScrollTop, getActiveLandingSection } from '../../domain/landingNavigation';

const documentNavigation = window.performance?.getEntriesByType?.('navigation')?.[0];
let reloadResetPending = shouldResetLandingOnReload(
  new URL(documentNavigation?.name || window.location.href).pathname,
  documentNavigation?.type,
);

const steps = [
  ['Siapkan dokumen', 'Siapkan identitas dan surat permohonan beserta lampiran pendukung.'],
  ['Kirim pengajuan', 'Lengkapi formulir online dengan data yang benar dan unggah dokumen.'],
  ['Pantau proses', 'Simpan kode permohonan dan kode akses untuk melihat status.'],
  ['Terima hasil', 'Ikuti perkembangan verifikasi dan tindak lanjut melalui halaman pelacakan.'],
];

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState('beranda');
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState('');
  useEffect(() => {
    let active = true;
    letterTypeAPI.getActive().then(items => {
      if (active) setServices(items);
    }).catch(() => {
      if (active) setServicesError('Daftar layanan belum dapat dimuat. Silakan coba lagi nanti.');
    }).finally(() => {
      if (active) setServicesLoading(false);
    });
    return () => { active = false; };
  }, []);
  const location = useLocation();
  const navigate = useNavigate();
  const resetOnReload = useRef(reloadResetPending);
  const navigationTarget = useRef(null);
  const navigationFrame = useRef(0);
  const settleTimer = useRef(0);
  const pageRef = useRef(null);
  const headerHeight = () => {
    const height = document.querySelector('[data-guest-navbar]')?.getBoundingClientRect().height || 0;
    pageRef.current?.style.setProperty('--landing-navbar-height', `${height}px`);
    return height;
  };
  useLayoutEffect(() => {
    const navbar = pageRef.current?.querySelector('[data-guest-navbar]');
    if (!navbar) return;
    const measure = () => headerHeight();
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(navbar);
    return () => observer.disconnect();
  }, []);
  const scrollToSection = useCallback((event, id) => {
    event?.preventDefault();
    if (!landingSections.includes(id)) return;
    navigationTarget.current = id;
    setActiveSection(id);
    window.dispatchEvent(new CustomEvent('nav-gliding', { detail: { active: true } }));
    cancelAnimationFrame(navigationFrame.current);
    navigationFrame.current = requestAnimationFrame(() => {
      const section = document.getElementById(id);
      if (!section) return;
      const top = getSectionScrollTop(section.getBoundingClientRect().top + window.scrollY,
        headerHeight(), document.documentElement.scrollHeight - window.innerHeight, id === 'beranda');
      window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      window.dispatchEvent(new Event('landing-navigation-start'));
    });
  }, []);
  useLayoutEffect(() => {
    if (!resetOnReload.current) return;
    const previousRestoration = window.history.scrollRestoration;
    const scrollHome = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    window.history.scrollRestoration = 'manual';
    scrollHome();
    window.addEventListener('pageshow', scrollHome, { once: true });
    return () => {
      window.removeEventListener('pageshow', scrollHome);
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);
  useLayoutEffect(() => {
    const reset = resetOnReload.current;
    const requested = location.state?.section || location.hash.slice(1);
    const section = ['beranda', 'layanan', 'prosedur', 'informasi'].includes(requested) ? requested : null;
    if (!reset && !section && !location.hash && !location.state?.section) return;
    const frame = requestAnimationFrame(() => {
      if (reset) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        setActiveSection('beranda');
        resetOnReload.current = false;
        reloadResetPending = false;
      } else if (section) {
        scrollToSection(null, section);
      }
      if (location.hash || location.state?.section) {
        const state = { ...location.state };
        delete state.section;
        navigate({ pathname: location.pathname, search: location.search, hash: '' }, { replace: true, state: Object.keys(state).length ? state : null });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [location.hash, location.pathname, location.search, location.state, navigate, scrollToSection]);
  useEffect(() => {
    let frame = 0;
    const updateSection = () => {
      frame = 0;
      if (navigationTarget.current) return;
      const sections = landingSections.map(id => ({ id, top: document.getElementById(id)?.getBoundingClientRect().top + window.scrollY }));
      setActiveSection(getActiveLandingSection(sections, window.scrollY, headerHeight(), document.documentElement.scrollHeight - window.innerHeight));
    };
    const finishNavigation = () => {
      clearTimeout(settleTimer.current);
      navigationTarget.current = null;
      window.dispatchEvent(new CustomEvent('nav-gliding', { detail: { active: false } }));
      updateSection();
    };
    const scheduleFinish = () => {
      clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(finishNavigation, 180);
    };
    const onScroll = () => {
      if (navigationTarget.current) scheduleFinish();
      else if (!frame) frame = requestAnimationFrame(updateSection);
    };
    const interrupt = () => { if (navigationTarget.current) finishNavigation(); };
    const onKeyDown = event => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) interrupt();
    };
    updateSection();
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scrollend', finishNavigation);
    window.addEventListener('landing-navigation-start', scheduleFinish);
    window.addEventListener('wheel', interrupt, { passive: true });
    window.addEventListener('touchstart', interrupt, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(navigationFrame.current);
      clearTimeout(settleTimer.current);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', finishNavigation);
      window.removeEventListener('landing-navigation-start', scheduleFinish);
      window.removeEventListener('wheel', interrupt);
      window.removeEventListener('touchstart', interrupt);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return <div className="landing-page" ref={pageRef}>
    <a className="landing-skip" href="#konten-utama">Lewati navigasi</a>
    <GuestNavbar activeSection={activeSection} onScrollToSection={scrollToSection} />
    <main id="konten-utama">
      <section className="landing-home" id="beranda" aria-labelledby="hero-title">
      <div className="landing-hero landing-shell">
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
      </div>
      <div className="landing-service-bar"><div className="landing-shell service-bar-inner"><p><FileText aria-hidden="true" size={20} /><span><strong>Pengajuan secara online</strong> Akses formulir kapan pun Anda perlu</span></p><p><Search aria-hidden="true" size={20} /><span><strong>Proses dapat dipantau</strong> Gunakan NIK dan kode tracking Anda</span></p><p><Clock aria-hidden="true" size={20} /><span><strong>Jam pelayanan kantor</strong> Senin–Jumat, 08.00–16.00 WIB</span></p></div></div>
      </section>
      <section id="layanan" className="landing-section landing-shell" aria-labelledby="services-title">
        <div className="section-heading"><div><p className="landing-eyebrow">Layanan Persuratan</p><h2 id="services-title">Apa yang Anda perlukan?</h2></div><p>Pilih kebutuhan Anda, lalu lengkapi pengajuan melalui formulir yang tersedia.</p></div>
        <div aria-live="polite">{servicesLoading ? <p role="status">Memuat layanan...</p> : servicesError ? <p role="alert">{servicesError}</p> : services.length === 0 ? <p>Belum ada jenis surat yang tersedia untuk pengajuan.</p> : null}</div>
        <div className="landing-services">{services.map(({ id, nama, name, deskripsi }, index) => <Link to="/guest/submit" key={id} className="landing-service"><div className="service-top"><FileText size={27} strokeWidth={1.5} aria-hidden="true" /><span>0{index + 1}</span></div><h3>{nama || name}</h3><p>{deskripsi}</p><span className="service-link">Ajukan permohonan <ArrowUpRight size={18} aria-hidden="true" /></span></Link>)}</div>
      </section>
      <section id="prosedur" className="landing-procedure" aria-labelledby="procedure-title"><div className="landing-shell landing-section"><div className="section-heading"><div><p className="landing-eyebrow">Alur Pelayanan</p><h2 id="procedure-title">Dari pengajuan hingga tindak lanjut.</h2></div><p>Empat langkah sederhana untuk mengurus kebutuhan persuratan Anda.</p></div><ol className="landing-steps">{steps.map(([title, description], index) => <li key={title}><span className="step-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol><div className="tracking-note"><div><h3>Sudah mengirim pengajuan?</h3><p>Siapkan kode permohonan dan kode akses untuk melihat perkembangan surat Anda.</p></div><Link className="landing-text-link" to="/guest/track">Lacak status surat <ArrowRight size={18} aria-hidden="true" /></Link></div></div></section>
      <section id="informasi" className="landing-section landing-shell landing-info" aria-labelledby="info-title"><div><p className="landing-eyebrow">Informasi Layanan</p><h2 id="info-title">Sebelum Anda<br />mengajukan surat.</h2><p className="info-intro">Pastikan data dan dokumen Anda lengkap agar permohonan dapat ditindaklanjuti.</p><div className="office-note"><Clock size={20} aria-hidden="true" /><p><strong>Waktu pelayanan</strong><br />Senin–Jumat<br />08.00–16.00 WIB</p></div></div><div className="landing-faq">{[
        ['Apakah layanan ini berbayar?', 'Tidak. Layanan persuratan melalui portal ini tidak dipungut biaya.'],
        ['Apa yang perlu saya siapkan?', 'Siapkan identitas, surat permohonan, dan lampiran yang sesuai dengan kebutuhan pengajuan. Ikuti petunjuk dokumen pada formulir.'],
        ['Bagaimana cara melacak pengajuan?', 'Buka halaman Lacak Pengajuan, lalu masukkan kode permohonan dan kode akses yang Anda terima setelah mengirim permohonan.'],
        ['Apa yang dilakukan jika data belum sesuai?', 'Periksa kembali identitas dan lampiran sebelum mengirim. Setelah pengajuan terkirim, pantau status dan catatan tindak lanjut pada halaman pelacakan.'],
      ].map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
      <section className="landing-cta"><div className="landing-shell"><div><p className="landing-eyebrow">Pelayanan dalam genggaman</p><h2>Mulai dari satu pengajuan.</h2><p>Siapkan dokumen Anda. Kami bantu arahkan prosesnya.</p></div><Link className="landing-button primary" to="/guest/submit">Ajukan Surat <ArrowRight size={18} aria-hidden="true" /></Link></div></section>
    </main>
    <footer className="landing-footer landing-footer-refined">
      <div className="landing-shell footer-layout">
        <div className="footer-identity"><Link to="/guest" onClick={(event) => scrollToSection(event, 'beranda')} className="footer-brand"><GarudaLogo className="footer-seal" /><span><small>Republik Indonesia</small><strong>Portal e-Surat</strong></span></Link><p>Portal pelayanan persuratan<br />dan administrasi terpadu.</p></div>
        <nav className="footer-navigation" aria-label="Layanan di footer"><h3>Akses layanan</h3><Link to="/guest/submit">Pengajuan surat</Link><Link to="/guest/track">Lacak pengajuan</Link><Link to="/login">Portal administrator</Link></nav>
        <nav className="footer-navigation" aria-label="Panduan di footer"><h3>Panduan pengajuan</h3><button type="button" onClick={(event) => scrollToSection(event, 'layanan')}>Jenis layanan</button><button type="button" onClick={(event) => scrollToSection(event, 'prosedur')}>Alur pelayanan</button><button type="button" onClick={(event) => scrollToSection(event, 'informasi')}>Informasi layanan</button></nav>
        <div className="footer-office"><h3>Kantor pelayanan</h3><p className="footer-office-detail"><MapPin size={17} aria-hidden="true" /><span>Jl. Medan Merdeka Barat No. 17,<br />Jakarta Pusat</span></p><p className="footer-office-detail"><Clock size={17} aria-hidden="true" /><span>Senin–Jumat<br />08.00–16.00 WIB</span></p></div>
      </div>
      <div className="landing-shell footer-colophon"><span>© {new Date().getFullYear()} Portal e-Surat</span><button type="button" onClick={(event) => scrollToSection(event, 'beranda')}>Kembali ke atas <span aria-hidden="true">↑</span></button></div>
    </footer>
  </div>;
}
