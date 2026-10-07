import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu, Bell, UserCircle, Check, LogOut, User, Settings } from 'lucide-react';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const notifications = [
    { id: 1, text: "New submission on 'Customer Survey'", time: "2m ago", read: false },
    { id: 2, text: "Your form 'Event Registration' reached 500 responses", time: "1h ago", read: false },
    { id: 3, text: "System maintenance scheduled for tonight", time: "3h ago", read: true },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-black transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Top Navbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-neutral-800 bg-white dark:bg-black z-10 sticky top-0 shadow-sm transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Form System Admin
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors relative group"
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary-600 rounded-full border-2 border-white transition-colors"></span>
              </button>

              {/* Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-black rounded-lg shadow-lg border border-slate-200 dark:border-neutral-800 overflow-hidden origin-top-right animate-dropdown">
                  <div className="p-4 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-center bg-slate-50/50 dark:bg-neutral-900/50">
                    <h3 className="font-semibold text-slate-800 dark:text-white">Notifications</h3>
                    <button className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-300">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className={`p-4 border-b border-slate-50 dark:border-neutral-800 hover:bg-slate-50/80 dark:hover:bg-neutral-900/80 transition-all duration-300 ease-in-out cursor-pointer flex gap-3 ${!notif.read ? 'bg-blue-50/30 dark:bg-primary-900/20' : ''}`}>
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 transition-all duration-500 ${!notif.read ? 'bg-primary-500 scale-100' : 'bg-transparent scale-0'}`}></div>
                        <div>
                          <p className={`text-sm transition-colors duration-300 ${!notif.read ? 'font-medium text-slate-800 dark:text-white' : 'text-slate-600 dark:text-neutral-400'}`}>{notif.text}</p>
                          <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors duration-300 cursor-pointer">
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">View all notifications</span>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={profileRef}>
              <div 
                className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-neutral-800 cursor-pointer group"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <UserCircle size={28} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                <div className="hidden md:block text-sm">
                  <p className="font-medium text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Admin User</p>
                  <p className="text-slate-500 dark:text-neutral-400 text-xs">admin@system.com</p>
                </div>
              </div>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black rounded-lg shadow-lg border border-slate-200 dark:border-neutral-800 overflow-hidden origin-top-right animate-dropdown">
                  <div className="py-1">
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-900 hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => setShowProfileMenu(false)}>
                      <User size={16} />
                      My Profile
                    </Link>
                    <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-900 hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => setShowProfileMenu(false)}>
                      <Settings size={16} />
                      Settings
                    </Link>
                    <div className="border-t border-slate-100 dark:border-neutral-800 my-1"></div>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" onClick={() => setShowProfileMenu(false)}>
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-black transition-colors duration-300">
          <div className="p-6 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
