import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Forms from './pages/admin/Forms';
import Activity from './pages/admin/Activity';
import Settings from './pages/admin/Settings';
import Submissions from './pages/admin/Submissions';
import Profile from './pages/admin/Profile';
import CreateForm from './pages/admin/CreateForm';
import SubmitLetter from './pages/guest/SubmitLetter';
import LandingPage from './pages/guest/LandingPage';
import { ThemeProvider } from './contexts/ThemeContext';
import { FormProvider } from './contexts/FormContext';

function App() {
  return (
    <ThemeProvider>
      <FormProvider>
        <Routes>
          {/* Guest Routes */}
          <Route path="/guest" element={<LandingPage />} />
          <Route path="/guest/submit" element={<SubmitLetter />} />
          
          {/* Admin Routes */}
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="forms" element={<Forms />} />
            <Route path="forms/new" element={<CreateForm />} />
            <Route path="activity" element={<Activity />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="submissions" element={<Submissions />} />
          </Route>
        </Routes>
      </FormProvider>
    </ThemeProvider>
  );
}

export default App;
