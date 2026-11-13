import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { PageLoader } from './components/Loading';
import { ThemeProvider } from './contexts/ThemeContext';
import { FormProvider } from './contexts/FormContext';
import { AuthProvider } from './contexts/AuthContext';

// Eager load LandingPage for instant initial render
import LandingPage from './pages/guest/LandingPage';

// Lazy load other routes on-demand to optimize initial bundle size & FCP
const SubmitLetter = lazy(() => import('./pages/guest/SubmitLetter'));
const TrackStatus = lazy(() => import('./pages/guest/TrackStatus'));

const AuthLayout = lazy(() => import('./layouts/AuthLayout'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));

const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Forms = lazy(() => import('./pages/admin/Forms'));
const CreateForm = lazy(() => import('./pages/admin/CreateForm'));
const Activity = lazy(() => import('./pages/admin/Activity'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const Profile = lazy(() => import('./pages/admin/Profile'));
const Submissions = lazy(() => import('./pages/admin/Submissions'));

const NotFound = lazy(() => import('./pages/NotFound'));
const Forbidden = lazy(() => import('./pages/Forbidden'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <FormProvider>
            <Suspense fallback={<PageLoader text="Memuat sistem..." fullScreen={false} />}>
              <Routes>
                {/* Guest / Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/guest" element={<LandingPage />} />
                <Route path="/guest/submit" element={<SubmitLetter />} />
                <Route path="/guest/track" element={<TrackStatus />} />

                {/* Auth Routes with AuthLayout */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>

                {/* Protected Admin Routes (Wajib Login & RBAC) */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="forms" element={<Forms />} />
                    <Route path="forms/new" element={<CreateForm />} />
                    <Route path="activity" element={<Activity />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="submissions" element={<Submissions />} />
                  </Route>
                </Route>

                {/* Error & Access Pages */}
                <Route path="/403" element={<Forbidden />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </FormProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
