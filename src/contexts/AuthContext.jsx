import React, { useState, useEffect } from 'react';
import authAPI from '../services/authAPI';

import { AuthContext } from './useAuth.js';



export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Periksa sesi aktif pada saat aplikasi pertama kali dimuat
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const response = await authAPI.getMe();
        if (isMounted && response?.success && response?.user) {
          setUser(response.user);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authAPI.login(email, password);
      if (response.success && response.user) {
        setUser(response.user);
        return { success: true, user: response.user };
      }
      throw new Error(response.message || 'Login gagal.');
    } catch (err) {
      const msg = err.message || 'Terjadi kesalahan saat login.';
      setError(msg);
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await authAPI.register(userData);
      return response;
    } catch (err) {
      const msg = err.message || 'Terjadi kesalahan saat registrasi.';
      setError(msg);
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    setError(null);
    try {
      const response = await authAPI.forgotPassword(email);
      return response;
    } catch (err) {
      const msg = err.message || 'Terjadi kesalahan saat memproses permintaan.';
      setError(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('[Logout Error]:', err);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    forgotPassword,
    logout,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'super_admin',
    isVerifikator: user?.role === 'verifikator' || user?.role === 'super_admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


