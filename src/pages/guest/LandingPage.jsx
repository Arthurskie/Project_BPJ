import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Settings,
  ShieldCheck,
  Activity,
  ChevronDown,
  Mail,
  ArrowRight,
  Briefcase
} from 'lucide-react';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('beranda');
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: 0.5 }); // Trigger when at least 50% of the section is visible

    const sections = ['beranda', 'layanan', 'prosedur', 'informasi'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getNavLinkClass = (id) => {
    return `transition-colors duration-300 relative py-1 ${activeSection === id
        ? 'text-primary-600 dark:text-primary-400'
        : 'hover:text-slate-900 dark:hover:text-white'
      }`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-50 font-sans selection:bg-primary-500/20 transition-colors duration-300">

      {/* --- AREA TOP: Navbar & Hero --- */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-slate-200 dark:border-neutral-800 shadow-sm' : 'bg-transparent border-transparent'}`}>
        <div className="w-full px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <a href="#beranda" onClick={(e) => scrollToSection(e, 'beranda')} className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-1.5 rounded">
                <Briefcase size={20} />
              </div>
              <span className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white">Portal e-Surat</span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-neutral-300">
              <a href="#beranda" onClick={(e) => scrollToSection(e, 'beranda')} className={getNavLinkClass('beranda')}>
                Beranda
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full transition-all duration-300 ease-out ${activeSection === 'beranda' ? 'w-full opacity-100' : 'w-0 opacity-0'}`}></span>
              </a>
              <a href="#layanan" onClick={(e) => scrollToSection(e, 'layanan')} className={getNavLinkClass('layanan')}>
                Spesifikasi Layanan
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full transition-all duration-300 ease-out ${activeSection === 'layanan' ? 'w-full opacity-100' : 'w-0 opacity-0'}`}></span>
              </a>
              <a href="#prosedur" onClick={(e) => scrollToSection(e, 'prosedur')} className={getNavLinkClass('prosedur')}>
                Prosedur
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full transition-all duration-300 ease-out ${activeSection === 'prosedur' ? 'w-full opacity-100' : 'w-0 opacity-0'}`}></span>
              </a>
              <a href="#informasi" onClick={(e) => scrollToSection(e, 'informasi')} className={getNavLinkClass('informasi')}>
                Informasi
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full transition-all duration-300 ease-out ${activeSection === 'informasi' ? 'w-full opacity-100' : 'w-0 opacity-0'}`}></span>
              </a>
            </nav>

            {/* CTAs */}
            <div className="flex items-center gap-4">
              <Link to="/" className="hidden md:block text-sm font-medium text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Login Administrator
              </Link>
              <Link
                to="/guest/submit"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 rounded transition-colors"
              >
                Form Pengajuan
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section id="beranda" className="relative min-h-screen flex flex-col justify-center pt-24 pb-20 overflow-hidden border-b border-slate-200 dark:border-neutral-900" ref={heroRef}>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
              Portal Pengajuan Administrasi <br className="hidden md:block" /> & Tata Usaha Terpusat
            </h1>

            <p className="text-base md:text-lg text-slate-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto">
              Digitalisasi layanan birokrasi untuk mempercepat proses pengajuan, pelacakan status, dan pengarsipan dokumen elektronik secara efisien dan transparan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/guest/submit"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded shadow-sm transition-all group"
              >
                Buat Pengajuan Baru
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#prosedur"
                onClick={(e) => scrollToSection(e, 'prosedur')}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-slate-700 dark:text-neutral-200 bg-white dark:bg-black border border-slate-300 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-900 rounded transition-all"
              >
                Panduan Prosedur
              </a>
            </div>

            {/* Wireframe/Dashboard Minimalist Concept */}
            <div className="mt-20 mx-auto max-w-4xl border border-slate-200 dark:border-neutral-800 rounded-t-xl overflow-hidden bg-white dark:bg-neutral-950 shadow-sm">
              <div className="border-b border-slate-100 dark:border-neutral-900 bg-slate-50 dark:bg-neutral-900 px-4 py-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-neutral-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-neutral-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-neutral-700"></div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-70">
                <div className="col-span-2 space-y-4">
                  <div className="h-6 w-1/3 bg-slate-200 dark:bg-neutral-800 rounded"></div>
                  <div className="h-4 w-full bg-slate-100 dark:bg-neutral-900 rounded"></div>
                  <div className="h-4 w-5/6 bg-slate-100 dark:bg-neutral-900 rounded"></div>
                  <div className="h-4 w-4/6 bg-slate-100 dark:bg-neutral-900 rounded"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-24 bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded p-4 flex flex-col justify-between">
                    <div className="h-3 w-1/2 bg-slate-200 dark:bg-neutral-800 rounded"></div>
                    <div className="h-6 w-1/4 bg-slate-300 dark:bg-neutral-700 rounded"></div>
                  </div>
                  <div className="h-24 bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded p-4 flex flex-col justify-between">
                    <div className="h-3 w-1/2 bg-slate-200 dark:bg-neutral-800 rounded"></div>
                    <div className="h-6 w-1/4 bg-slate-300 dark:bg-neutral-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- AREA MIDDLE: Feature Section & FAQ --- */}
        <section id="layanan" className="min-h-screen flex flex-col justify-center py-20 bg-slate-50 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Spesifikasi Layanan</h2>
              <p className="text-slate-600 dark:text-neutral-400 max-w-2xl text-sm">
                Infrastruktur persuratan digital yang dikembangkan dengan standar otomasi, transparansi, dan keamanan tingkat tinggi.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-neutral-900 p-6 border border-slate-200 dark:border-neutral-800 rounded transition-shadow hover:shadow-sm">
                <div className="mb-4 text-primary-600 dark:text-primary-400">
                  <Settings className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Otomatisasi Alur Kerja</h3>
                <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                  Proses registrasi dan disposisi dokumen diatur secara terdistribusi dan sistematis, memangkas red-tape birokrasi konvensional.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-neutral-900 p-6 border border-slate-200 dark:border-neutral-800 rounded transition-shadow hover:shadow-sm">
                <div className="mb-4 text-indigo-600 dark:text-indigo-400">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Pelacakan Real-time</h3>
                <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                  Transparansi penuh terhadap status dokumen pada setiap tahapan verifikasi, validasi, dan persetujuan otoritas.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-neutral-900 p-6 border border-slate-200 dark:border-neutral-800 rounded transition-shadow hover:shadow-sm">
                <div className="mb-4 text-green-600 dark:text-green-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Integritas Data Terjamin</h3>
                <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                  Seluruh lampiran dokumen diproses dan diarsipkan menggunakan basis data terenkripsi untuk mencegah modifikasi tidak sah.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="prosedur" className="min-h-screen flex flex-col justify-center py-20 border-b border-slate-200 dark:border-neutral-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Prosedur Pengajuan</h2>
              <p className="text-slate-600 dark:text-neutral-400 max-w-2xl mx-auto text-sm">
                Langkah-langkah sistematis dalam proses pengajuan dokumen administrasi.
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Registrasi', desc: 'Isi formulir elektronik dengan data yang valid dan unggah lampiran.' },
                { step: '02', title: 'Verifikasi', desc: 'Sistem dan petugas akan memverifikasi kelengkapan dokumen awal.' },
                { step: '03', title: 'Pemrosesan', desc: 'Dokumen diproses oleh pihak berwenang untuk persetujuan.' },
                { step: '04', title: 'Selesai', desc: 'Pengarsipan final dan notifikasi status ke email Anda.' }
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 dark:bg-neutral-900/50 p-6 rounded-xl border border-slate-200 dark:border-neutral-800 relative overflow-hidden group hover:border-primary-500 transition-colors">
                  <div className="text-5xl font-black text-slate-200 dark:text-neutral-800/50 absolute -right-2 -bottom-4 group-hover:text-primary-100 dark:group-hover:text-primary-900/20 transition-colors">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 relative z-10">{item.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-neutral-400 relative z-10">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="informasi" className="min-h-screen flex flex-col justify-center py-20 bg-slate-50 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Informasi Operasional</h2>
              <p className="text-slate-600 dark:text-neutral-400 text-sm max-w-2xl mx-auto">
                Ketentuan dan prosedur standar operasional (SOP) dalam penggunaan portal layanan persuratan.
              </p>
            </div>

            <div className="space-y-3">
              {/* FAQ Item 1 */}
              <details className="group border border-slate-200 dark:border-neutral-800 rounded bg-white dark:bg-neutral-900">
                <summary className="flex items-center justify-between p-5 cursor-pointer text-sm font-semibold text-slate-900 dark:text-white">
                  Siapa saja yang memiliki hak akses untuk menggunakan portal ini?
                  <ChevronDown className="w-4 h-4 text-slate-500 group-open:-rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-600 dark:text-neutral-400 border-t border-slate-100 dark:border-neutral-800 pt-3 mt-1">
                  Portal ini terbuka dan dapat diakses oleh pihak eksternal (tamu/klien) maupun staf internal yang membutuhkan layanan administrasi dari instansi terkait.
                </div>
              </details>

              {/* FAQ Item 2 */}
              <details className="group border border-slate-200 dark:border-neutral-800 rounded bg-white dark:bg-neutral-900">
                <summary className="flex items-center justify-between p-5 cursor-pointer text-sm font-semibold text-slate-900 dark:text-white">
                  Bagaimana spesifikasi teknis untuk unggahan dokumen lampiran?
                  <ChevronDown className="w-4 h-4 text-slate-500 group-open:-rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-600 dark:text-neutral-400 border-t border-slate-100 dark:border-neutral-800 pt-3 mt-1">
                  Dokumen lampiran wajib berformat PDF, DOC, atau DOCX. Ukuran maksimal per berkas dibatasi hingga 10 Megabyte (MB) guna menjaga stabilitas dan efisiensi ruang server.
                </div>
              </details>

              {/* FAQ Item 3 */}
              <details className="group border border-slate-200 dark:border-neutral-800 rounded bg-white dark:bg-neutral-900">
                <summary className="flex items-center justify-between p-5 cursor-pointer text-sm font-semibold text-slate-900 dark:text-white">
                  Berapa Service Level Agreement (SLA) untuk pemrosesan dokumen?
                  <ChevronDown className="w-4 h-4 text-slate-500 group-open:-rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-600 dark:text-neutral-400 border-t border-slate-100 dark:border-neutral-800 pt-3 mt-1">
                  SLA standar untuk verifikasi awal administratif adalah 1x24 jam pada hari kerja aktif, terhitung sejak sistem menerbitkan nomor tiket registrasi pengajuan.
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* --- AREA BOTTOM: CTA & Footer --- */}
        <section className="py-16 bg-slate-900 dark:bg-neutral-900 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Mulai Proses Pengajuan Dokumen
            </h2>
            <p className="text-sm text-slate-400 mb-8 max-w-xl mx-auto">
              Akses formulir elektronik sekarang untuk mendaftarkan permohonan Anda dan mendapatkan nomor pelacakan dokumen resmi dari sistem.
            </p>
            <Link
              to="/guest/submit"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded transition-colors"
            >
              Buka Form Pengajuan
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-black border-t border-slate-200 dark:border-neutral-800 pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="text-slate-900 dark:text-white w-5 h-5" />
                <span className="font-semibold text-base text-slate-900 dark:text-white tracking-tight">Portal e-Surat</span>
              </div>
              <p className="text-slate-500 dark:text-neutral-400 max-w-sm text-xs leading-relaxed">
                Sistem Informasi Manajemen Persuratan Terpadu. Platform resmi untuk pengelolaan administrasi, registrasi dokumen, dan pengarsipan digital instansi.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Tautan Sistem</h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-neutral-400">
                <li><a href="#layanan" onClick={(e) => scrollToSection(e, 'layanan')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Spesifikasi Layanan</a></li>
                <li><a href="#prosedur" onClick={(e) => scrollToSection(e, 'prosedur')} className="hover:text-slate-900 dark:hover:text-white transition-colors">SOP Pengajuan</a></li>
                <li><Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Portal Administrator</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Bantuan & Regulasi</h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-neutral-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pusat Bantuan</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Kebijakan Privasi</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Ketentuan Layanan</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-neutral-800 text-xs text-slate-500 dark:text-neutral-500 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Sistem Administrasi Terpadu. Hak cipta dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
