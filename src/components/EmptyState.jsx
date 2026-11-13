import React from 'react';
import { FileText } from 'lucide-react';

/**
 * EmptyState - Komponen resmi & elegan untuk menampilkan keadaan data kosong,
 * hasil pencarian nihil, atau antrean belum ada permohonan.
 */
export default function EmptyState({
  icon: Icon = FileText,
  title = 'Tidak Ada Data Ditemukan',
  description = 'Saat ini belum ada data yang sesuai dengan kriteria atau filter yang Anda pilih.',
  action = null,
  compact = false,
  className = ''
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-neutral-800 rounded-xl bg-slate-50/50 dark:bg-neutral-900/30 ${
        compact ? 'p-6' : 'p-10 sm:p-14'
      } ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-center text-slate-400 dark:text-neutral-500 mb-3 shadow-xs">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>

      <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mt-1 leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}
