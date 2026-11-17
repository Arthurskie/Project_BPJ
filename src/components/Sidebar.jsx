import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Activity,
  FileText,
  Settings,
  X,
  Shield
} from 'lucide-react';
import { GarudaLogo } from './IndonesiaSeal';
import { useAuth } from '../contexts/useAuth';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user } = useAuth();
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 1023px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 1023px)');
    const change = () => setMobile(query.matches);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (!mobile || !isOpen) return;
    const panel = document.getElementById('admin-sidebar');
    const previous = document.activeElement;
    panel?.querySelector('button')?.focus();
    const keydown = event => {
      if (event.key === 'Escape') { event.preventDefault(); setIsOpen(false); }
      if (event.key !== 'Tab') return;
      const controls = [...panel.querySelectorAll('a[href], button:not([disabled])')];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [mobile, isOpen, setIsOpen]);

  const menuItems = [
    { name: 'Dasbor Utama', icon: LayoutDashboard, path: '/admin', end: true },
    { name: 'Permohonan Masuk', icon: Inbox, path: '/admin/submissions' },
    { name: 'Log Aktivitas', icon: Activity, path: '/admin/activity' },
    { name: 'Master Jenis Surat', icon: FileText, path: '/admin/forms' },
    { name: 'Pengaturan', icon: Settings, path: '/admin/settings' }
  ];

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {(
        <div
          aria-hidden="true"
          className={`fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-20 lg:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside id="admin-sidebar" inert={mobile && !isOpen} aria-label="Navigasi admin"
        data-open={isOpen}
        className={`admin-sidebar-motion fixed lg:static inset-y-0 left-0 z-30 w-60 border-r border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        } flex flex-col`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-4 sm:px-5 border-b border-slate-200 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-slate-900 dark:bg-neutral-800 flex items-center justify-center shrink-0 shadow-xs">
              <GarudaLogo className="w-5 h-5 text-white" />
            </div>
            <div className={`sidebar-collapse-label whitespace-nowrap overflow-hidden`}>
              <span className="font-semibold text-base text-slate-900 dark:text-white tracking-tight block">
                e-Surat BPJ
              </span>
              <span className="text-[10px] text-slate-500 dark:text-neutral-400 block -mt-0.5 truncate">
                Kelurahan Cikarang
              </span>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden p-1 text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
            onClick={() => setIsOpen(false)}
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section Label */}
        <div className={`px-5 pt-7 pb-3 text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider sidebar-collapse-label`}>
          Ruang kerja
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-1 px-3 overflow-y-auto overflow-x-hidden flex flex-col gap-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              aria-label={item.name}
              title={!isOpen ? item.name : undefined}
              to={item.path}
              end={item.end}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors group ${
                  isActive
                    ? 'bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800/60 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={17}
                    className={`shrink-0 transition-colors ${
                      isActive
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-slate-400 dark:text-neutral-500 group-hover:text-slate-600 dark:group-hover:text-neutral-300'
                    }`}
                  />
                  <span className={`sidebar-collapse-label whitespace-nowrap`}>
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* User Card Footer */}
        <div className={`p-3.5 border-t border-slate-200 dark:border-neutral-800 sidebar-collapse-label`}>
          <div className="px-1 py-2">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-red-700 dark:text-red-400 shrink-0" />
              <p className="text-[11px] font-semibold text-slate-900 dark:text-white truncate">
                {user?.role === 'super_admin' ? 'Super Administrator' : 'Petugas Verifikator'}
              </p>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-neutral-400 mt-1 font-mono truncate">
              {user?.name || 'Petugas'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}




