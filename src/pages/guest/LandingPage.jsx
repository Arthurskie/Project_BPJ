import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  Building2,
  BookOpen,
  Stamp,
  Clock,
  Search,
  PhoneCall,
  MapPin,
  ArrowUp
} from 'lucide-react';
import GuestNavbar from '../../components/GuestNavbar';
import { GarudaLogo, FlagID } from '../../components/IndonesiaSeal';

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState('beranda');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const heroRef = useRef(null);

  const getHeaderOffset = () => 68;

  const scrollToSection = (e, id) => {
    if (e) e.preventDefault();
    setActiveSection(id);
    window.dispatchEvent(new CustomEvent('nav-gliding'));

    if (id === 'beranda') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
    const element = document.getElementById(id);
    if (!element) return;

    requestAnimationFrame(() => {
      const headerOffset = getHeaderOffset();
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: Math.max(0, Math.round(offsetPosition)),
        behavior: 'smooth'
      });
    });
  };

  // Selalu reset posisi scroll ke puncak (Beranda) saat refresh halaman
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }

    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Deteksi seksi aktif secara non-blocking menggunakan requestAnimationFrame
  useEffect(() => {
    let ticking = false;

    const computeActiveSection = () => {
      setShowScrollTop(window.scrollY > 300);

      const viewportCenter = window.scrollY + window.innerHeight / 2;
      const sections = ['beranda', 'layanan', 'prosedur', 'informasi'];
      let current = 'beranda';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const elTop = el.getBoundingClientRect().top + window.pageYOffset;
          const elBottom = elTop + el.offsetHeight;
          if (viewportCenter >= elTop && viewportCenter < elBottom) {
            current = id;
            break;
          }
        }
      }
      setActiveSection(current);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(computeActiveSection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Tunda penghitungan awal ke frame berikutnya agar tidak memblokir hydration awal
    const timer = setTimeout(() => {
      requestAnimationFrame(computeActiveSection);
    }, 120);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const handleTrack = (e) => {
    e?.preventDefault();
    if (!trackingCode.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setTrackingResult({
        kode: trackingCode.toUpperCase(),
        perihal: 'Permohonan Audiensi Pembahasan Program Kerja',
        pemohon: 'Bambang Sudrajat',
        tanggal: '28 Oktober 2026',
        tahap: 3,
        status: 'Disposisi Pimpinan',
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 font-sans snap-container relative selection:bg-red-500 selection:text-white">

      {/* ── Smart Sticky Navbar (Auto Hide & Reveal) ── */}
      <GuestNavbar activeSection={activeSection} onScrollToSection={scrollToSection} />

      {/* ── Indikator Titik Navigasi Samping (Floating Side Dots Indicator - Desktop Only) ── */}
      <div
        className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-3.5 pointer-events-auto"
        role="navigation"
        aria-label="Navigasi Seksi Cepat"
      >
        {[
          { id: 'beranda', label: 'Beranda' },
          { id: 'layanan', label: 'Jenis Layanan' },
          { id: 'prosedur', label: 'Prosedur Pengajuan' },
          { id: 'informasi', label: 'Pertanyaan Umum' },
        ].map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={(e) => scrollToSection(e, item.id)}
              className="group relative flex items-center justify-end p-1.5 focus:outline-none cursor-pointer"
              aria-label={`Pindah ke bagian ${item.label}`}
            >
              {/* Tooltip on hover */}
              <span className="absolute right-8 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-slate-900/95 dark:bg-slate-100 text-white dark:text-slate-900 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-lg translate-x-1 group-hover:translate-x-0 border border-slate-700/80 dark:border-slate-300">
                {item.label}
              </span>
              {/* Indicator Dot / Elongated Pill with Red Accent Ring */}
              <span
                className={`transition-all duration-300 rounded-full block ${
                  isActive
                    ? 'w-2.5 h-7 bg-red-600 shadow-md ring-4 ring-red-500/25'
                    : 'w-2.5 h-2.5 bg-slate-400/50 dark:bg-neutral-600 hover:bg-red-500 hover:scale-125'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* ── Tombol Melayang Kembali ke Atas (Floating Scroll-To-Top) ── */}
      <button
        onClick={() => scrollToSection(null, 'beranda')}
        className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 p-2.5 sm:p-3.5 rounded-full bg-red-700 hover:bg-red-800 active:scale-95 text-white shadow-xl shadow-red-950/30 border border-red-600/50 transition-all duration-300 flex items-center justify-center group cursor-pointer ${
          showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
        aria-label="Kembali ke puncak halaman"
      >
        <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-y-0.5 transition-transform" />
      </button>

      <main>

        {/* ── Beranda (Hero) ── */}
        <section
          id="beranda"
          ref={heroRef}
          className="snap-section relative min-h-[calc(100dvh-68px)] lg:min-h-[calc(100vh-68px)] flex flex-col justify-center items-center overflow-hidden bg-slate-900 scroll-mt-[68px] pt-6 pb-10 sm:py-12"
        >
          {/* Latar Belakang Hero: 100% Pure CSS Tanpa Gambar Eksternal (LCP Instan) */}
          <div className="absolute inset-0 bg-slate-950 overflow-hidden pointer-events-none">
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }}
            />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-700/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2.5 sm:mb-4 leading-snug sm:leading-tight">
              Portal Pelayanan Persuratan
              <br className="hidden sm:block" />
              <span className="text-red-300"> &amp; Administrasi Terpadu</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto mb-5 sm:mb-7 leading-relaxed px-1 sm:px-2">
              Ajukan surat masuk, lacak status dokumen, dan kelola administrasi
              persuratan secara digital tanpa perlu datang ke kantor.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 mb-5 sm:mb-8 w-full max-w-md sm:max-w-none mx-auto">
              <Link
                to="/guest/submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-red-700 hover:bg-red-800 active:scale-[0.98] rounded-lg shadow-lg transition-all group"
              >
                Buat Pengajuan Surat
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#prosedur"
                onClick={(e) => scrollToSection(e, 'prosedur')}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-xs sm:text-sm font-medium text-white bg-white/10 border border-white/20 hover:bg-white/20 active:scale-[0.98] rounded-lg transition-all"
              >
                Lihat Prosedur
              </a>
            </div>

            {/* Lacak Dokumen */}
            <div className="max-w-xl mx-auto bg-white/95 dark:bg-neutral-900/95 backdrop-blur border border-slate-200 dark:border-neutral-700 rounded-xl p-3.5 sm:p-5 shadow-xl text-left w-full">
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">
                Lacak Status Dokumen
              </p>
              <form onSubmit={handleTrack} className="flex gap-2">
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Masukkan nomor registrasi"
                  className="flex-1 min-w-0 px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-red-700 dark:hover:bg-red-800 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50 active:scale-[0.98] cursor-pointer"
                >
                  <Search size={14} className="shrink-0" />
                  <span>{isSearching ? 'Mencari...' : 'Lacak'}</span>
                </button>
              </form>

              {trackingResult && (
                <div className="mt-3.5 pt-3.5 border-t border-slate-200 dark:border-neutral-800 animate-fade-in">
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-[11px] font-mono font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded">
                        {trackingResult.kode}
                      </span>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mt-1 truncate">
                        {trackingResult.perihal}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {trackingResult.pemohon} &bull; {trackingResult.tanggal}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md shrink-0">
                      Tahap {trackingResult.tahap}/4
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-[9px] sm:text-[10px] font-semibold text-center">
                    <div className="bg-emerald-600 text-white py-1 rounded truncate px-0.5">Registrasi</div>
                    <div className="bg-emerald-600 text-white py-1 rounded truncate px-0.5">Verifikasi</div>
                    <div className="bg-amber-500 text-white py-1 rounded truncate px-0.5">Disposisi</div>
                    <div className="bg-slate-200 dark:bg-neutral-800 text-slate-500 py-1 rounded truncate px-0.5">Selesai</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Layanan ── */}
        <section
          id="layanan"
          className="snap-section py-10 sm:py-14 lg:py-0 lg:min-h-[calc(100vh-68px)] flex flex-col justify-center items-center bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 scroll-mt-[68px]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="mb-5 sm:mb-8 text-center sm:text-left">
              <h2 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2">
                Jenis Layanan
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 max-w-xl mx-auto sm:mx-0">
                Pilih jenis permohonan sesuai kebutuhan Anda. Seluruh layanan tidak dipungut biaya.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
              {[
                {
                  icon: Building2,
                  title: 'Permohonan Audiensi',
                  desc: 'Pengajuan pertemuan resmi atau konsultasi dengan pimpinan instansi.',
                  sla: '1 hari kerja',
                  color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40',
                },
                {
                  icon: BookOpen,
                  title: 'Izin Penelitian & Magang',
                  desc: 'Surat izin riset, skripsi/tesis, atau permohonan magang (PKL).',
                  sla: '2 hari kerja',
                  color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40',
                },
                {
                  icon: Stamp,
                  title: 'Surat Keterangan',
                  desc: 'Pengurusan surat keterangan, rekomendasi, atau surat pengantar resmi.',
                  sla: '1 hari kerja',
                  color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 transition-colors bg-white dark:bg-neutral-900/50 shadow-xs flex items-start sm:flex-col gap-3.5 sm:gap-0"
                >
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 sm:mb-4 ${item.color}`}>
                    <item.icon size={20} className="sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                      <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                        {item.title}
                      </h3>
                      <span className="self-start sm:self-auto text-[10px] font-medium text-slate-600 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                        <Clock size={10} />
                        <span>{item.sla}</span>
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 leading-relaxed sm:mb-3">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 sm:mt-8 text-center">
              <Link
                to="/guest/submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-red-700 hover:bg-red-800 active:scale-[0.98] rounded-lg transition-colors shadow-xs"
              >
                Buka Formulir Pengajuan
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Prosedur ── */}
        <section
          id="prosedur"
          className="snap-section py-10 sm:py-14 lg:py-0 lg:min-h-[calc(100vh-68px)] flex flex-col justify-center items-center bg-slate-50 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-900 scroll-mt-[68px]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center mb-5 sm:mb-8">
              <h2 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2">
                Prosedur Pengajuan
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 max-w-lg mx-auto">
                Alur pemrosesan surat dari awal pengajuan hingga dokumen selesai.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
              {[
                { step: '01', title: 'Isi Formulir', desc: 'Lengkapi data diri dan unggah berkas permohonan.' },
                { step: '02', title: 'Verifikasi', desc: 'Petugas Tata Usaha memeriksa kelengkapan berkas.' },
                { step: '03', title: 'Disposisi', desc: 'Surat diteruskan ke pimpinan untuk ditindaklanjuti.' },
                { step: '04', title: 'Selesai', desc: 'Surat balasan terbit dan dikirim ke email pemohon.' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-neutral-900 p-3.5 sm:p-5 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] sm:text-xs font-mono font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded">
                        Tahap {item.step}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs sm:text-base text-slate-900 dark:text-white mb-1 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] sm:text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Informasi / FAQ ── */}
        <section
          id="informasi"
          className="snap-section py-10 sm:py-14 lg:py-0 lg:min-h-[calc(100vh-68px)] flex flex-col justify-center items-center bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 scroll-mt-[68px]"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center mb-5 sm:mb-8">
              <h2 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2">
                Pertanyaan Umum
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400">
                Informasi seputar penggunaan portal pelayanan persuratan.
              </p>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {[
                {
                  q: 'Apakah layanan ini dikenakan biaya?',
                  a: 'Tidak. Seluruh layanan persuratan melalui portal ini sepenuhnya gratis dan tidak dipungut biaya dalam bentuk apapun.',
                },
                {
                  q: 'Berapa lama proses verifikasi dokumen?',
                  a: 'Verifikasi awal dilakukan maksimal 1×24 jam kerja sejak dokumen diterima. Proses disposisi pimpinan membutuhkan 1–3 hari kerja tergantung sifat surat.',
                },
                {
                  q: 'Format file apa yang diterima?',
                  a: 'Dokumen lampiran harus berformat PDF, DOC, atau DOCX dengan ukuran maksimal 10 MB per berkas.',
                },
                {
                  q: 'Bagaimana cara mengetahui status surat saya?',
                  a: 'Gunakan fitur "Lacak Status Dokumen" di halaman utama dengan memasukkan nomor registrasi yang Anda terima saat pengajuan.',
                },
              ].map((item, i) => (
                <details
                  key={i}
                  className="group border border-slate-200 dark:border-neutral-800 rounded-xl bg-slate-50 dark:bg-neutral-950 overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-3.5 sm:p-4 cursor-pointer text-xs sm:text-sm font-semibold text-slate-900 dark:text-white list-none select-none active:bg-slate-100 dark:active:bg-neutral-900">
                    <span>{item.q}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-2" />
                  </summary>
                  <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 text-xs sm:text-sm text-slate-600 dark:text-neutral-400 leading-relaxed border-t border-slate-200/50 dark:border-neutral-800/50 pt-2.5">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Kontak / CTA & Footer ── */}
        <section
          id="kontak"
          className="snap-section py-10 sm:py-14 lg:py-0 lg:min-h-[calc(100vh-68px)] flex flex-col justify-between bg-slate-950 text-white scroll-mt-[68px]"
        >
          {/* CTA Area */}
          <div className="py-8 sm:py-14 flex-1 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
            <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-3">Mulai Pengajuan Surat</h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 sm:mb-8 max-w-lg mx-auto leading-relaxed">
              Isi formulir pengajuan untuk mendaftarkan permohonan Anda.
              Anda akan menerima nomor registrasi untuk melacak status dokumen.
            </p>
            <Link
              to="/guest/submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 active:scale-[0.98] rounded-lg transition-colors shadow-md"
            >
              Buka Formulir Pengajuan
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Footer */}
          <footer className="w-full bg-slate-950 text-slate-400 pt-6 sm:pt-8 pb-6 border-t border-slate-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">

                <div>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <GarudaLogo className="w-7 h-7 sm:w-8 sm:h-8" />
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-bold text-red-500 uppercase tracking-wider leading-none">Republik Indonesia</p>
                      <p className="text-xs sm:text-sm font-bold text-white leading-tight">Portal e-Surat</p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed max-w-xs text-slate-400">
                    Sistem pelayanan persuratan dan administrasi terpadu
                    untuk pengelolaan naskah dinas secara elektronik.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2.5">Navigasi</h4>
                  <ul className="space-y-2 text-xs">
                    <li><Link to="/guest" className="hover:text-white transition-colors py-1 inline-block">Beranda</Link></li>
                    <li><Link to="/guest/submit" className="hover:text-white transition-colors py-1 inline-block">Form Pengajuan</Link></li>
                    <li><Link to="/guest/track" className="hover:text-white transition-colors py-1 inline-block">Cek Status Surat</Link></li>
                    <li><Link to="/login" className="hover:text-white transition-colors py-1 inline-block">Portal Administrator</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2.5">Kontak &amp; Informasi</h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-center gap-2">
                      <PhoneCall size={12} className="text-slate-500 shrink-0" />
                      <span>(021) 1500-XXX</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <MapPin size={12} className="text-slate-500 shrink-0 mt-0.5" />
                      <span>Jl. Medan Merdeka Barat No. 17, Jakarta Pusat</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock size={12} className="text-slate-500 shrink-0" />
                      <span>Senin–Jumat, 08.00–16.00 WIB</span>
                    </li>
                  </ul>
                </div>

              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500 text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <FlagID className="w-5 h-3.5" />
                  <span>&copy; {new Date().getFullYear()} Sistem Administrasi Terpadu. Hak cipta dilindungi.</span>
                </div>
              </div>
            </div>
          </footer>
        </section>

      </main>

    </div>
  );
}
