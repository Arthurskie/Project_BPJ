import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, FileText, LogIn } from 'lucide-react';
import { GarudaLogo, RedWhiteRibbon } from './IndonesiaSeal';

/**
 * GuestNavbar — Navigasi portal pelayanan persuratan resmi dengan Smart Sticky (Auto Hide & Reveal).
 */
export default function GuestNavbar({ activeSection, onScrollToSection }) {
  const [scrolled, setScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);
  const isProgrammaticScroll = useRef(false);
  const location = useLocation();
  const isLanding = location.pathname === '/guest';

  // Sinkronisasi status navbar saat terjadi navigasi smooth glide
  useEffect(() => {
    const onNavGliding = () => {
      setNavVisible(true);
      isProgrammaticScroll.current = true;
      setTimeout(() => {
        isProgrammaticScroll.current = false;
        lastScrollY.current = window.scrollY;
      }, 900);
    };

    window.addEventListener('nav-gliding', onNavGliding);
    return () => window.removeEventListener('nav-gliding', onNavGliding);
  }, []);

  // Smart Sticky Scroll Listener (Auto Hide saat scroll ke bawah, Reveal saat scroll ke atas)
  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;

      // Jangan sembunyikan jika sedang dalam glide navigasi programmatic
      if (isProgrammaticScroll.current) {
        lastScrollY.current = currentScrollY;
        return;
      }

      // Selalu tampilkan saat berada di bagian paling atas halaman
      if (currentScrollY <= 20) {
        setNavVisible(true);
        setScrolled(false);
        lastScrollY.current = currentScrollY;
        return;
      }

      setScrolled(true);

      // Jangan auto-hide jika menu mobile sedang dibuka
      if (mobileOpen) {
        lastScrollY.current = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastScrollY.current;
      if (Math.abs(diff) < 6) return;

      if (diff > 0 && currentScrollY > 68) {
        // Scroll ke bawah: meluncur ke atas (-translate-y-full)
        setNavVisible(false);
      } else if (diff < 0) {
        // Scroll ke atas: meluncur kembali (translate-y-0)
        setNavVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mobileOpen]);

  const handleNav = (e, id) => {
    if (e) e.preventDefault();
    if (isLanding && onScrollToSection) {
      setMobileOpen(false);
      setNavVisible(true);
      isProgrammaticScroll.current = true;
      setTimeout(() => {
        isProgrammaticScroll.current = false;
        lastScrollY.current = window.scrollY;
      }, 900);
      onScrollToSection(e, id);
    }
  };

  const handleLogoClick = (e) => {
    if (isLanding) {
      e.preventDefault();
      setMobileOpen(false);
      setNavVisible(true);
      isProgrammaticScroll.current = true;
      setTimeout(() => {
        isProgrammaticScroll.current = false;
        lastScrollY.current = window.scrollY;
      }, 900);
      if (onScrollToSection) {
        onScrollToSection(e, 'beranda');
      }
    }
  };

  const navItems = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'layanan', label: 'Layanan' },
    { id: 'prosedur', label: 'Prosedur' },
    { id: 'informasi', label: 'Informasi' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-transform duration-300 ease-in-out border-b border-slate-200 dark:border-neutral-800 ${
        (navVisible || mobileOpen) ? 'translate-y-0' : '-translate-y-full'
      } ${
        scrolled
          ? 'bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-md'
          : 'bg-white dark:bg-neutral-900'
      }`}
    >
      {/* Pita Merah Putih */}
      <RedWhiteRibbon />

      {/* Main nav */}
      <div className="border-b border-slate-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              to="/guest"
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 sm:gap-3 shrink-0 group py-1 rounded-md transition-opacity hover:opacity-90 active:scale-95"
            >
              <GarudaLogo className="w-8 h-8 sm:w-9 sm:h-9" />
              <div className="flex flex-col">
                <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-red-700 dark:text-red-400 uppercase leading-none">
                  Republik Indonesia
                </span>
                <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Portal e-Surat
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                const linkClass = `px-3.5 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 relative select-none flex items-center justify-center cursor-pointer active:scale-95 ${isActive
                  ? 'text-red-700 dark:text-red-400 bg-red-50/90 dark:bg-red-950/40 shadow-xs'
                  : 'text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-neutral-800/60'
                  }`;

                return isLanding ? (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => handleNav(e, item.id)}
                    className={linkClass}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-red-600 dark:bg-red-500 rounded-full" />
                    )}
                  </a>
                ) : (
                  <Link
                    key={item.id}
                    to={`/guest#${item.id}`}
                    className={linkClass}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                to="/guest/submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-red-700 hover:bg-red-800 active:scale-95 rounded-md shadow-xs transition-all"
              >
                Ajukan Surat
              </Link>
              <Link
                to="/"
                className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 active:scale-95 rounded-md flex items-center gap-1 transition-all"
              >
                Masuk
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Mobile toggle & quick CTA */}
            <div className="flex lg:hidden items-center gap-2">
              <Link
                to="/guest/submit"
                className="px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-white bg-red-700 hover:bg-red-800 active:scale-95 rounded-lg transition-colors shadow-sm whitespace-nowrap"
              >
                Ajukan Surat
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`relative p-2 rounded-lg transition-all duration-200 active:scale-90 ${
                  mobileOpen
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                    : 'text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800'
                }`}
                aria-label={mobileOpen ? 'Tutup Menu' : 'Buka Menu'}
                aria-expanded={mobileOpen}
              >
                <span className={`block transition-transform duration-200 ${mobileOpen ? 'rotate-90' : 'rotate-0'}`}>
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-50 lg:hidden bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 animate-dropdown shadow-2xl rounded-b-2xl max-h-[calc(100dvh-72px)] overflow-y-auto">

            {/* Navigasi Seksi */}
            <div className="px-3 pt-3 pb-2">
              <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">
                Navigasi
              </p>
              <div className="flex flex-col gap-0.5">
                {navItems.map((item) => {
                  const isActive = activeSection === item.id;
                  const mobileLinkClass = `px-3.5 py-3 rounded-xl text-[13px] font-semibold transition-all flex items-center justify-between cursor-pointer active:scale-[0.98] ${isActive
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 shadow-sm ring-1 ring-red-200/60 dark:ring-red-800/40'
                    : 'text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-800/60'
                    }`;

                  return isLanding ? (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => handleNav(e, item.id)}
                      className={mobileLinkClass}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 ring-4 ring-red-100 dark:ring-red-950/60" />
                      )}
                    </a>
                  ) : (
                    <Link
                      key={item.id}
                      to={`/guest#${item.id}`}
                      onClick={() => setMobileOpen(false)}
                      className={mobileLinkClass}
                    >
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Aksi Cepat */}
            <div className="px-3 pb-4 pt-2">
              <div className="border-t border-slate-100 dark:border-neutral-800 pt-3 flex flex-col gap-2">
                <Link
                  to="/guest/submit"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-red-700 hover:bg-red-800 active:scale-[0.97] rounded-xl shadow-sm transition-all"
                >
                  <FileText size={16} />
                  Ajukan Surat Sekarang
                </Link>
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 dark:text-neutral-200 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 active:scale-[0.97] rounded-xl transition-colors"
                >
                  <LogIn size={16} />
                  Masuk sebagai Administrator
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
