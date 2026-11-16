import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { PageLoader } from './Loading';

/**
 * Route Guard Component untuk memproteksi Dashboard Admin & RBAC
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <PageLoader
        text="Memuat halaman..."
        
      />
    );
  }

  // Jika belum login, redirect ke halaman Login dengan menyimpan path asal
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Jika role tidak memenuhi syarat wewenang (RBAC), alihkan ke halaman 403
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
