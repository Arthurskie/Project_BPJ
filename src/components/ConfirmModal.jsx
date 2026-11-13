import React, { useEffect, useRef } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { Spinner } from './Loading';

/**
 * ConfirmModal - Dialog konfirmasi aksi penting / sensitif (misal: Tolak Surat, Hapus, Keluar).
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Tindakan',
  message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  type = 'primary', // 'primary' | 'danger' | 'warning' | 'success'
  loading = false
}) {
  const modalRef = useRef(null);

  // Tutup dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    primary: {
      icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      bgIcon: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/40',
      btn: 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900'
    },
    danger: {
      icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
      bgIcon: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/40',
      btn: 'bg-red-700 hover:bg-red-800 text-white'
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bgIcon: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white'
    },
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bgIcon: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white'
    }
  };

  const currentType = typeConfig[type] || typeConfig.primary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="relative bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-xl z-10 animate-fade-in"
      >
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${currentType.bgIcon}`}>
            {currentType.icon}
          </div>

          <div className="flex-1 pr-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
            <div className="mt-1.5 text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
              {message}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup"
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 p-1 rounded-md transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer ${currentType.btn}`}
          >
            {loading && <Spinner size="xs" color="white" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

