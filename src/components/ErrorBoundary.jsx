import React, { Component } from 'react';


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
      return <main className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 px-6 text-slate-900 dark:text-white">
        <div className="w-full max-w-md">
          <p className="text-sm text-slate-500">Kesalahan aplikasi</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Halaman gagal ditampilkan</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-neutral-400">Coba muat ulang halaman. Jika masalah berulang, hubungi pengelola.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={this.handleReset} className="min-h-11 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white dark:bg-white dark:text-neutral-900">Muat ulang</button>
            <a href="/guest" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-medium dark:border-neutral-700">Ke beranda</a>
          </div>
        </div>
      </main>;
    }

    return this.props.children;
  }
}
