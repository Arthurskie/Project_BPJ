import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Activity,
  FileText,
  X,
  LogOut,
  FilePlus2
} from 'lucide-react';
import { GarudaLogo } from './IndonesiaSeal';
import { useAuth } from '../contexts/useAuth';

export default function Sidebar({ isOpen, setIsOpen, onSignOut }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
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
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin', end: true },
    { name: 'Permohonan', icon: Inbox, path: '/admin/submissions', end: true },
    { name: 'Pengajuan Loket', icon: FilePlus2, path: '/admin/submissions/new' },
    { name: 'Jenis Surat', icon: FileText, path: '/admin/forms' },
    { name: 'Aktivitas', icon: Activity, path: '/admin/activity' }
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
        className={`admin-sidebar admin-sidebar-motion fixed lg:static inset-y-0 left-0 z-30 w-60 border-r border-slate-200  bg-white  transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        } flex flex-col`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-4 sm:px-5 border-b border-slate-200  shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#b32d32] flex items-center justify-center shrink-0 shadow-xs">
              <GarudaLogo className="w-5 h-5 text-[#ffffff]" />
            </div>
            <div className={`sidebar-collapse-label whitespace-nowrap overflow-hidden`}>
              <span className="admin-brand block">
                E-SURAT BPJ
              </span>
              <span className="text-[10px] text-slate-500  block -mt-0.5 truncate">
                Kelurahan Cikarang
              </span>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden p-1 text-slate-500 hover:text-slate-800   transition-colors cursor-pointer"
            onClick={() => setIsOpen(false)}
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section Label */}
        <div className={`px-5 pt-7 pb-3 text-[10px] font-bold text-slate-400  uppercase tracking-wider sidebar-collapse-label`}>
          Menu utama
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
                `admin-nav-link flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors group ${
                  (isActive || (item.path === '/admin/submissions' && pathname.startsWith('/admin/submissions/') && pathname !== '/admin/submissions/new'))
                    ? 'admin-nav-active font-semibold'
                    : 'text-slate-600  hover:bg-slate-50  hover:text-slate-900 '
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={17}
                    className={`shrink-0 transition-colors ${
                      (isActive || (item.path === '/admin/submissions' && pathname.startsWith('/admin/submissions/') && pathname !== '/admin/submissions/new'))
                        ? 'text-[#ffffff]'
                        : 'text-slate-400  group-hover:text-slate-600 '
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

        <div className="admin-sidebar-user p-4 border-t border-[#eeeae2]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#b32d32] text-white font-semibold" aria-hidden="true">{user?.name?.charAt(0)?.toUpperCase() || 'P'}</span>
            <div className="sidebar-collapse-label min-w-0" inert={!mobile && !isOpen}>
              <p className="truncate text-sm font-semibold text-[#292524]">{user?.name || 'Petugas'}</p>
              <p className="mt-1 text-xs text-slate-500">{user?.role === 'super_admin' ? 'Super Administrator' : 'Petugas Verifikator'}</p>
              <button type="button" onClick={onSignOut} className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-700"><LogOut size={13} /> Keluar</button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}




