import React from 'react';
import { GarudaLogo } from './IndonesiaSeal';

/**
 * Komponen Loading Spinner modular & serbaguna.
 * 
 * Props:
 * - size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * - color: 'primary' | 'white' | 'slate' (default: 'primary')
 * - text: string (opsional keterangan di bawah spinner)
 * - fullScreen: boolean (menampilkan layar penuh di tengah viewport)
 * - className: string tambahan
 */
export function Spinner({
  size = 'md',
  color = 'primary',
  className = ''
}) {
  const sizeClasses = {
    xs: 'w-3.5 h-3.5 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-9 h-9 border-3',
    xl: 'w-12 h-12 border-4'
  };

  const colorClasses = {
    primary: 'border-red-700/20 border-t-red-700 dark:border-red-500/20 dark:border-t-red-500',
    white: 'border-white/30 border-t-white',
    slate: 'border-slate-300 border-t-slate-800 dark:border-neutral-700 dark:border-t-white'
  };

  return (
    <div
      role="status"
      aria-label="Memuat data"
      className={`rounded-full animate-spin shrink-0 ${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.primary} ${className}`}
    >
      <span className="sr-only">Memuat...</span>
    </div>
  );
}

/**
 * Komponen PageLoader / Layar Penuh untuk Transisi Halaman & Proteksi Rute
 */
export function PageLoader({
  text = 'Memuat sistem pelayanan...',
  subtext = 'Mohon tunggu beberapa saat',
  fullScreen = true
}) {
  return (
    <div
      className={`flex items-center justify-center p-6 ${
        fullScreen
          ? 'fixed inset-0 z-50 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xs'
          : 'min-h-[320px] w-full'
      }`}
      role="status"
    >
      <div className="flex flex-col items-center max-w-xs text-center">
        {/* Garuda Watermark & Spinner */}
        <div className="relative mb-4 flex items-center justify-center">
          <GarudaLogo className="w-12 h-12 opacity-80" />
          <div className="absolute -inset-2 rounded-full border-2 border-red-700/20 border-t-red-700 dark:border-red-500/20 dark:border-t-red-500 animate-spin" />
        </div>

        <p className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
          {text}
        </p>
        {subtext && (
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Skeleton Loader untuk memuat kartu data, tabel, atau form
 */
export function Skeleton({ className = '', variant = 'text', count = 1 }) {
  const baseClasses = 'bg-slate-200 dark:bg-neutral-800 animate-pulse rounded';

  const variantClasses = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'w-10 h-10 rounded-full',
    thumbnail: 'w-16 h-16 rounded-lg',
    card: 'h-32 w-full rounded-xl',
    button: 'h-10 w-28 rounded-lg'
  };

  return (
    <div className="space-y-2.5 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`${baseClasses} ${variantClasses[variant] || ''} ${className}`}
        />
      ))}
    </div>
  );
}

/**
 * Default Loading Component
 */
export default function Loading({
  variant = 'spinner',
  size = 'md',
  text,
  fullScreen = false,
  className = ''
}) {
  if (variant === 'page' || fullScreen) {
    return <PageLoader text={text} fullScreen={fullScreen} />;
  }

  if (variant === 'skeleton') {
    return <Skeleton className={className} />;
  }

  return (
    <div className={`flex items-center gap-2.5 text-xs text-slate-500 dark:text-neutral-400 ${className}`}>
      <Spinner size={size} />
      {text && <span>{text}</span>}
    </div>
  );
}

