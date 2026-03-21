import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
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
            <Route path="/login" element={<Login />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/staff" element={<StaffDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
}

export default App;
