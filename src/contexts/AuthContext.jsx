import React, { useState, useEffect } from 'react';
import authAPI from '../services/authAPI';
import { AuthContext } from './useAuth.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordRecovery, setPasswordRecovery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.slice(1));
    return ['recovery', 'invite'].includes(params.get('mode')) || ['recovery', 'invite'].includes(hash.get('type'));
  });

  useEffect(() => {
    let active = true;
    let version = 0;
    const refresh = async () => {
      const current = ++version;
      try {
        const response = await authAPI.getMe();
        if (active && current === version) { setUser(response.user); setError(null); }
      } catch (err) {
        if (active && current === version) { setUser(null); setError(err.message); }
      } finally { if (active && current === version) setLoading(false); }
    };
    let unsubscribe = () => {};
    try {
      unsubscribe = authAPI.onAuthStateChange((event) => {
        if (!active) return;
        if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
        if (event === 'SIGNED_OUT') { ++version; setUser(null); setLoading(false); }
        else setTimeout(() => { if (active) refresh(); }, 0);
      });
      refresh();
    } catch (err) {
      Promise.resolve().then(() => { if (active) { setError(err.message); setLoading(false); } });
    }
    return () => { active = false; unsubscribe(); };
  }, []);

  const invoke = async (method, ...args) => {
    setError(null);
    try { return await authAPI[method](...args); }
    catch (err) { setError(err.message); throw err; }
  };
  const login = async (email, password) => {
    const response = await invoke('login', email, password);
    setUser(response.user);
    return response;
  };
  const logout = async () => { await invoke('logout'); setUser(null); };
  const updatePassword = async (password) => {
    await invoke('updatePassword', password);
    await logout();
    setPasswordRecovery(false);
  };
  return <AuthContext.Provider value={{
    user: passwordRecovery ? null : user, loading, error, login, logout, passwordRecovery, updatePassword,
    register: (data) => invoke('register', data),
    forgotPassword: (email) => invoke('forgotPassword', email),
    isAuthenticated: !!user && !passwordRecovery,
    isSuperAdmin: !passwordRecovery && user?.role === 'super_admin',
    isVerifikator: !passwordRecovery && ['verifikator', 'super_admin'].includes(user?.role)
  }}>{children}</AuthContext.Provider>;
}

