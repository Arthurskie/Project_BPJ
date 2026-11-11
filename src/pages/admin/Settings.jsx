import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const { darkMode, toggleDarkMode } = useTheme();
  const [autoSave, setAutoSave] = useState(true);
  const settingsRef = useRef(null);

  useEffect(() => {
    if (settingsRef.current) {
      settingsRef.current.style.opacity = '0';
      settingsRef.current.style.transform = 'translateY(10px)';
      const timer = setTimeout(() => {
        if (settingsRef.current) {
          settingsRef.current.style.transition = 'all 0.4s ease-out';
          settingsRef.current.style.opacity = '1';
          settingsRef.current.style.transform = 'translateY(0)';
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">System Settings</h2>
        <p className="text-slate-500 dark:text-neutral-400 text-xs sm:text-sm mt-1">Manage your preferences and system configuration.</p>
      </div>

      <div className="bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl shadow-sm p-4 sm:p-6 md:p-8 max-w-3xl" ref={settingsRef}>
        <div className="space-y-6 sm:space-y-8">
          
          {/* Section 1 */}
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-neutral-800 pb-2 mb-3 sm:mb-4">Preferences</h3>
            <div className="space-y-3 sm:space-y-4">
              
              <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-slate-50 dark:bg-neutral-900/50 rounded-lg border border-slate-200 dark:border-neutral-800">
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">Email Notifications</h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Receive an email every time a form is submitted.</p>
                </div>
                <button 
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`w-10 h-5 rounded-full transition-colors duration-300 relative shrink-0 ${emailNotifications ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-neutral-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 bg-white dark:bg-black w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${emailNotifications ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-slate-50 dark:bg-neutral-900/50 rounded-lg border border-slate-200 dark:border-neutral-800">
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">Dark Mode (Demo)</h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Toggle dark mode interface.</p>
                </div>
                <button 
                  onClick={toggleDarkMode}
                  className={`w-10 h-5 rounded-full transition-colors duration-300 relative shrink-0 ${darkMode ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-neutral-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 bg-white dark:bg-black w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${darkMode ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
              </div>

            </div>
          </div>

          {/* Section 2 */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-neutral-800 pb-2 mb-3 sm:mb-4">Form Defaults</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-slate-50 dark:bg-neutral-900/50 rounded-lg border border-slate-200 dark:border-neutral-800">
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">Auto-save drafts</h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Automatically save forms while editing.</p>
                </div>
                <button 
                  onClick={() => setAutoSave(!autoSave)}
                  className={`w-10 h-5 rounded-full transition-colors duration-300 relative shrink-0 ${autoSave ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-neutral-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 bg-white dark:bg-black w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${autoSave ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button className="w-full sm:w-auto bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors text-sm">
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
