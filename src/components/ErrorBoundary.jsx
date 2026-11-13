import React, { Component } from 'react';
import { RefreshCw, Home, ShieldAlert } from 'lucide-react';

/**
 * ErrorBoundary - Menangkap error runtime React yang tidak tertangani
 * dan menampilkan fallback UI resmi alih-alih layar putih kosong (white screen of death).
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm text-center">
            
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="inline-block text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider bg-red-50 dark:bg-red-950/40 px-2.5 py-0.5 rounded mb-2">
              Kendala Sistem (500)
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Terjadi Kesalahan Aplikasi
            </h2>

            <p className="text-xs text-slate-600 dark:text-neutral-400 mt-2 mb-6 leading-relaxed">
              Sistem mendeteksi galat saat memproses antarmuka. Anda dapat mencoba memuat ulang halaman atau kembali ke beranda utama.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-6">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Muat Ulang Halaman</span>
              </button>

              <a
                href="/guest"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-200 hover:bg-slate-200 dark:hover:bg-neutral-700 text-xs font-semibold rounded-lg transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Beranda Warga</span>
              </a>
            </div>

            {/* Error Details (Khusus Mode Pengembangan) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left text-[11px] bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg p-3 text-slate-700 dark:text-neutral-300 overflow-x-auto">
                <summary className="font-semibold cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-neutral-200">
                  Rincian Error Teknis (Debug)
                </summary>
                <p className="font-mono text-red-600 dark:text-red-400 mt-2 font-semibold">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="font-mono text-[10px] text-slate-500 mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
