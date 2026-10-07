import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Shield, Key, Bell, CheckCircle } from 'lucide-react';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('general');
  const tabContentRef = useRef(null);

  useEffect(() => {
    if (tabContentRef.current) {
      tabContentRef.current.style.opacity = '0.5';
      const timer = setTimeout(() => {
        if (tabContentRef.current) tabContentRef.current.style.opacity = '1';
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">My Profile</h2>
        <p className="text-slate-500 dark:text-neutral-400 text-sm mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar for Profile Tabs */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-black/50 p-4 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-neutral-700' 
                    : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-900/50 hover:text-slate-900 dark:hover:text-white border border-transparent'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8 flex-1 transition-opacity duration-200" ref={tabContentRef}>
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Personal Information</h3>
                
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 rounded-full bg-slate-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center text-2xl font-bold shadow-sm">
                    A
                  </div>
                  <div>
                    <button className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-700 text-slate-700 dark:text-neutral-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                      Change Avatar
                    </button>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-neutral-300">First Name</label>
                    <input type="text" defaultValue="Admin" className="w-full bg-white dark:bg-black border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-colors shadow-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-neutral-300">Last Name</label>
                    <input type="text" defaultValue="User" className="w-full bg-white dark:bg-black border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-colors shadow-sm" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-neutral-300">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
                      <input type="email" defaultValue="admin@system.com" className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-500 dark:text-neutral-400 rounded-lg pl-9 pr-3 py-2 text-sm cursor-not-allowed shadow-sm" disabled />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 flex justify-end">
                <button className="bg-slate-900 dark:bg-neutral-100 hover:bg-slate-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Update Password</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-neutral-300">Current Password</label>
                    <div className="relative">
                      <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
                      <input type="password" placeholder="••••••••" className="w-full bg-white dark:bg-black border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-colors shadow-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-neutral-300">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-white dark:bg-black border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-colors shadow-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-neutral-300">Confirm Password</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-white dark:bg-black border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-colors shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 flex justify-end">
                <button className="bg-slate-900 dark:bg-neutral-100 hover:bg-slate-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
                  Update Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Email Notifications</h3>
                <div className="space-y-3">
                  {['News and updates', 'Tips and tutorials', 'Offers and promotions'].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded border border-slate-300 dark:border-neutral-600 flex items-center justify-center bg-white dark:bg-neutral-900 cursor-pointer hover:border-slate-400 dark:hover:border-neutral-500 transition-colors">
                        {idx !== 2 && <CheckCircle size={14} className="text-slate-900 dark:text-white" />}
                      </div>
                      <span className="text-sm text-slate-700 dark:text-neutral-300 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400 bg-slate-50 dark:bg-neutral-900/50 p-3 rounded-lg border border-slate-200 dark:border-neutral-700/50">
                You can manage other system-wide notifications in the <a href="/settings" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Settings</a> page.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
