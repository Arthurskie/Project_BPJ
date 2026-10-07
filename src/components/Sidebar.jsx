import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, Database, Activity, X } from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Forms', icon: FileText, path: '/forms' },
    { name: 'Submissions', icon: Database, path: '/submissions' },
    { name: 'Activity', icon: Activity, path: '/activity' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 border-r border-slate-200 dark:border-neutral-800 bg-white dark:bg-black transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        } flex flex-col`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-neutral-100 flex items-center justify-center">
              <FileText size={18} className="text-white dark:text-neutral-900" />
            </div>
            <span className={`font-bold text-lg text-slate-800 dark:text-white tracking-tight ${!isOpen && 'lg:hidden'} whitespace-nowrap`}>
              Formify
            </span>
          </div>
          <button 
            className="lg:hidden text-slate-500 hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 py-6 px-3 overflow-y-auto overflow-x-hidden flex flex-col gap-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                  isActive 
                    ? 'bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white font-semibold' 
                    : 'text-slate-500 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-900/50 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <item.icon size={20} className="shrink-0" />
              <span className={`text-sm ${!isOpen && 'lg:hidden'} whitespace-nowrap`}>
                {item.name}
              </span>
            </NavLink>
          ))}
        </div>

        <div className={`p-4 border-t border-slate-200 dark:border-neutral-800 ${!isOpen && 'lg:hidden'}`}>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-700/50">
            <p className="text-xs text-slate-500 dark:text-neutral-400 mb-2 font-medium">Storage Used</p>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-slate-900 dark:bg-neutral-300 rounded-full"></div>
            </div>
            <p className="text-xs text-slate-700 dark:text-neutral-300 mt-2 font-semibold">75% (15GB / 20GB)</p>
          </div>
        </div>
      </aside>
    </>
  );
}
