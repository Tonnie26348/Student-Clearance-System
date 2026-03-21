import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { useProfile } from './lib/useProfile';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { checkConfig } from './lib/supabase';
import './App.css';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole: 'student' | 'staff' | 'admin' }) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  
  if (authLoading || profileLoading) return (
    <div className="loading-screen">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="spinner"
      ></motion.div>
      <p>Verifying Access...</p>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;

  if (profile?.role !== requiredRole && profile?.role !== 'admin') {
    return <Navigate to={`/${profile?.role || 'student'}`} replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

function App() {
  const isConfigured = checkConfig();

  return (
    <AuthProvider>
      {!isConfigured && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#fee2e2', color: '#dc2626', padding: '1rem', textAlign: 'center',
          fontWeight: 800, borderBottom: '2px solid #ef4444'
        }}>
          ⚠️ Build v1.0.2: Configuration Missing. Please verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.
        </div>
      )}
      <Toaster position="top-right" richColors />
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/student" element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } />

            <Route path="/staff" element={
              <ProtectedRoute requiredRole="staff">
                <StaffDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
}

export default App;
