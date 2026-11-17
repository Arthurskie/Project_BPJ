import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './admin.css';
import { Menu, LogOut, User, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';

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

  const [previousPath, setPreviousPath] = useState(location.pathname);
  if (previousPath !== location.pathname) {
    setPreviousPath(location.pathname);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
    setShowProfileMenu(false);
  }

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
    function handleEscape(event) { if (event.key === "Escape" && profileRef.current?.contains(document.activeElement)) { setShowProfileMenu(false); profileRef.current?.querySelector("button")?.focus(); } }
    document.addEventListener("keydown", handleEscape);
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="admin-interface flex h-screen overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onSignOut={handleSignOut} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="admin-header flex items-center justify-between px-4 sm:px-6 h-20 border-b border-slate-200  bg-white  z-10 sticky top-0 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="admin-menu-toggle p-1.5 rounded-lg text-slate-500 hover:text-slate-900   hover:bg-slate-100  transition-colors cursor-pointer"
              aria-label="Buka atau tutup menu navigasi" aria-expanded={isSidebarOpen} aria-controls="admin-sidebar"
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="admin-page-title truncate">

                {location.pathname === '/admin' ? 'Dasbor' : location.pathname.includes('/submissions/new') ? 'Loket Pelayanan' : location.pathname.includes('/submissions/') ? 'Verifikasi Permohonan' : location.pathname.includes('/submissions') ? 'Permohonan Masuk' : location.pathname.includes('/forms') ? 'Master Jenis Surat' : location.pathname.includes('/profile') ? 'Profil' : location.pathname.includes('/activity') ? 'Log Aktivitas' : location.pathname.includes('/settings') ? 'Informasi layanan' : 'Admin'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Tautan Cepat ke Portal Publik */}
            <Link
              to="/guest"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-600  hover:text-[#292524] px-2.5 py-1.5 rounded-md hover:bg-slate-50  transition-colors"
              title="Buka portal permohonan warga di tab baru"
            >
              <span>Portal Warga</span>
              <ExternalLink size={13} />
            </Link>

            <div className="h-4 w-px bg-slate-200  hidden md:block" />

            {/* Profile Menu Trigger */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                aria-label="Menu akun" aria-expanded={showProfileMenu}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-slate-50  transition-colors cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-full bg-[#b32d32] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-xs font-semibold text-slate-900  truncate max-w-[140px]">
                    {user?.name || 'Petugas'}
                  </p>
                  <p className="text-[10px] text-slate-400  font-mono">
                    {user?.nip ? user.nip.slice(0, 10) + '...' : 'Petugas Dinas'}
                  </p>
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white  rounded-xl shadow-lg border border-slate-200  overflow-hidden origin-top-right animate-dropdown z-50 py-1.5 text-xs">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 ">
                    <p className="font-semibold text-slate-900  truncate">
                      {user?.name || 'Petugas'}
                    </p>
                    <p className="text-[11px] text-slate-400  truncate mt-0.5">
                      {user?.email || 'admin@kelurahan.go.id'}
                    </p>
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#92252a] bg-[#fdf0ef]  px-2 py-0.5 rounded">
                      <ShieldCheck size={11} />
                      <span>{user?.role === 'super_admin' ? 'Super Admin' : 'Verifikator Loket'}</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/admin/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700  hover:bg-slate-50  hover:text-slate-900  transition-colors"
                    >
                      <User size={14} className="text-slate-400" />
                      <span>Profil Saya</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100  pt-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-red-600  hover:bg-red-50  transition-colors text-left cursor-pointer font-medium"
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
        <main className="admin-workspace flex-1 overflow-x-hidden overflow-y-auto ">
          <div className="admin-content p-4 sm:p-6 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}



