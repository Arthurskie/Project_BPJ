import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Alert - Komponen pesan notifikasi & peringatan serbaguna.
 * 
 * Props:
 * - type: 'info' | 'success' | 'warning' | 'error' (default: 'info')
 * - title: string (opsional judul tebal)
 * - children: React.ReactNode (isi pesan)
 * - onClose: function (jika diberikan, menampilkan tombol silang untuk menutup)
 * - className: string
 */
export default function Alert({
  type = 'info',
  title,
  children,
  onClose,
  className = ''
}) {
  const styles = {
    info: {
      container: 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200',
      icon: <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
    },
    success: {
      container: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
    },
    warning: {
      container: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
    },
    error: {
      container: 'bg-red-50/80 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200',
      icon: <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
    }
  };

  const current = styles[type] || styles.info;

  return (
    <div
      role="alert"
      className={`border rounded-xl p-3.5 flex items-start gap-3 text-xs leading-relaxed transition-all ${current.container} ${className}`}
    >
      {current.icon}
      
      <div className="flex-1">
        {title && (
          <p className="font-semibold text-xs tracking-tight mb-0.5">
            {title}
          </p>
        )}
        <div className="text-slate-700 dark:text-neutral-300">
          {children}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup pemberitahuan"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 p-0.5 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

