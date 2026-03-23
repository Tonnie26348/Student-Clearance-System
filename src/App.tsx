import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Requests from './pages/Requests';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import FAQ from './pages/FAQ';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { isConfigured } from './lib/supabase';
import './App.css';

function App() {
  console.log('App Rendering. Configured?', isConfigured);

  return (
    <AuthProvider>
      {!isConfigured && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#fee2e2', color: '#dc2626', padding: '1rem', textAlign: 'center',
          fontWeight: 800, borderBottom: '2px solid #ef4444'
        }}>
          ⚠️ System Configuration Incomplete: Check Vercel Environment Variables.
        </div>
      )}
      <Toaster position="top-right" richColors />
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/features" element={<Features />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
}

export default App;
