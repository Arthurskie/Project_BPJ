import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

export default function Register() {
  const { passwordRecovery } = useAuth();
  if (passwordRecovery) return <Navigate to="/forgot-password?mode=invite" replace />;
  return <div className="max-w-md mx-auto bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-6 sm:p-8">
    <h2 className="text-xl font-bold">Akun Petugas Melalui Undangan</h2>
    <p className="mt-3 text-sm text-slate-600 dark:text-neutral-300">Pendaftaran mandiri tidak tersedia. Hubungi administrator instansi untuk menerima undangan dan penetapan hak akses.</p>
    <Link to="/login" className="inline-block mt-5 text-sm underline">Kembali ke halaman masuk</Link>
  </div>;
}
