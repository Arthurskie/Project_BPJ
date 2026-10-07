import React, { useState, useEffect, useRef } from 'react';
import { Database, Loader2 } from 'lucide-react';

export default function Submissions() {
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6" ref={containerRef}>
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">All Submissions</h2>
        <p className="text-slate-500 dark:text-neutral-400 text-sm mt-1">View and export form submissions data.</p>
      </div>

      <div className="bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl shadow-sm p-16 flex flex-col items-center justify-center text-center">
        {loading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
            <p className="text-sm text-slate-500 dark:text-neutral-400">Loading submissions data...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg flex items-center justify-center mb-6 shadow-sm">
              <Database size={24} className="text-slate-400 dark:text-neutral-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Submissions Database</h3>
            <p className="text-sm text-slate-500 dark:text-neutral-400 max-w-md">
              This area will contain all raw submission data from your active forms. You can filter, analyze, and export the data to CSV or Excel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
