import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu, LogOut, User, Settings, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  const handleSignOut = async () => {
    setShowProfileMenu(false);
    await logout();
    navigate('/login');
  };

  // Close sidebar & dropdown on mobile route change
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    setShowProfileMenu(false);
  }, [location.pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 font-sans">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16 border-b border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10 sticky top-0 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Toggle menu navigasi"
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white truncate">
                Panel Pelayanan e-Surat
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Tautan Cepat ke Portal Publik */}
            <Link
              to="/guest"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-neutral-400 hover:text-red-700 dark:hover:text-red-400 px-2.5 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
              title="Buka portal permohonan warga di tab baru"
            >
              <span>Portal Warga</span>
              <ExternalLink size={13} />
            </Link>

            <div className="h-4 w-px bg-slate-200 dark:border-neutral-800 hidden md:block" />

            {/* Profile Menu Trigger */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-left"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                    {user?.name || 'Petugas'}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">
                    {user?.nip ? user.nip.slice(0, 10) + '...' : 'Petugas Dinas'}
                  </p>
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-slate-200 dark:border-neutral-800 overflow-hidden origin-top-right animate-dropdown z-50 py-1.5 text-xs">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-neutral-800">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {user?.name || 'Petugas'}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-neutral-500 truncate mt-0.5">
                      {user?.email || 'admin@kelurahan.go.id'}
                    </p>
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded">
                      <ShieldCheck size={11} />
                      <span>{user?.role === 'super_admin' ? 'Super Admin' : 'Verifikator Loket'}</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/admin/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800/60 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <User size={14} className="text-slate-400" />
                      <span>Profil Saya</span>
                    </Link>
                    <Link
                      to="/admin/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800/60 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <Settings size={14} className="text-slate-400" />
                      <span>Pengaturan Sistem</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 dark:border-neutral-800 pt-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left cursor-pointer font-medium"
                    >
                      <LogOut size={14} />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-neutral-950">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
