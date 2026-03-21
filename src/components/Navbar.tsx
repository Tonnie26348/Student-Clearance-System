import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useProfile } from '../lib/useProfile';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LogOut, GraduationCap, LayoutDashboard, 
  Bell, CheckCircle, XCircle, Info, Menu, X, Shield, Building, Moon, Sun
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string; title: string; message: string; type: 'success' | 'error' | 'info'; is_read: boolean; created_at: string;
}

export default function Navbar() {
  const { signOut, user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    if (user) {
        fetchNotifications();
        const channel = supabase.channel('schema-db-changes').on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
            (payload) => setNotifications(prev => [payload.new as Notification, ...prev])
        ).subscribe();
        return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  const fetchNotifications = async () => {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(5);
    if (data) setNotifications(data);
  };

  const markAsRead = async () => {
    if (notifications.some(n => !n.is_read)) {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user?.id);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
    setShowNotifs(!showNotifs);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <aside className="sidebar-desktop">
        <div className="sidebar-brand">
            <div className="brand-logo"><GraduationCap size={28} /></div>
            <div className="brand-info">
                <span>ClearanceHub</span>
                <small>University Portal</small>
            </div>
        </div>

        <nav className="sidebar-nav">
            <Link to="/student" className={`nav-item ${isActive('/student') ? 'active' : ''}`}>
                <LayoutDashboard size={20} /> <span>Student Hub</span>
            </Link>
            {profile?.role === 'staff' && (
                <Link to="/staff" className={`nav-item ${isActive('/staff') ? 'active' : ''}`}>
                    <Building size={20} /> <span>Staff Panel</span>
                </Link>
            )}
            {profile?.role === 'admin' && (
                <Link to="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`}>
                    <Shield size={20} /> <span>Admin Console</span>
                </Link>
            )}
        </nav>

        <div className="sidebar-footer">
            <button className="nav-item theme-toggle-btn" onClick={toggleTheme}>
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <div className="user-pill">
                <div className="user-avatar">{user?.email?.[0].toUpperCase()}</div>
                <div className="user-meta">
                    <span className="email-truncate">{user?.email}</span>
                    <span className="role-label">{profile?.role || 'student'}</span>
                </div>
            </div>
            <button onClick={() => { signOut(); navigate('/login'); }} className="btn-logout-sidebar">
                <LogOut size={18} /> <span>Sign Out</span>
            </button>
        </div>
      </aside>

      <header className="mobile-header">
        <div className="brand-mobile">
            <GraduationCap size={24} />
            <span>ClearanceHub</span>
        </div>
        <div className="mobile-actions">
            <button className="btn-icon-mobile" onClick={toggleTheme}>
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button className="btn-icon-mobile" onClick={markAsRead}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="dot-mobile" />}
            </button>
            <button className="btn-icon-mobile" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu size={24} />
            </button>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mobile-menu-overlay">
                <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="mobile-menu-content">
                    <div className="mobile-menu-header">
                        <span className="menu-title">Navigation</span>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="btn-close-menu"><X size={24} /></button>
                    </div>
                    <div className="mobile-menu-links">
                        <Link to="/student" onClick={() => setIsMobileMenuOpen(false)} className="mobile-link">Dashboard</Link>
                        {profile?.role === 'staff' && <Link to="/staff" onClick={() => setIsMobileMenuOpen(false)} className="mobile-link">Staff Panel</Link>}
                        {profile?.role === 'admin' && <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="mobile-link">Administration</Link>}
                        <div className="divider" />
                        <button onClick={() => { signOut(); navigate('/login'); }} className="mobile-link logout">Sign Out</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNotifs && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="notif-popup">
                <div className="notif-popup-header">Latest Updates</div>
                <div className="notif-popup-list">
                    {notifications.length > 0 ? notifications.map(n => (
                        <div key={n.id} className={`notif-popup-item ${!n.is_read ? 'unread' : ''}`}>
                            <div className={`n-icon ${n.type}`}>{n.type === 'success' ? <CheckCircle size={14} /> : n.type === 'error' ? <XCircle size={14} /> : <Info size={14} />}</div>
                            <div className="n-body">
                                <strong>{n.title}</strong>
                                <p>{n.message}</p>
                            </div>
                        </div>
                    )) : <div className="n-empty">All caught up!</div>}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .sidebar-desktop { position: fixed; left: 0; top: 0; bottom: 0; width: 280px; background: var(--bg-sidebar); border-right: 1px solid var(--border-light); display: flex; flex-direction: column; padding: 2rem 1.5rem; z-index: 100; }
        @media (max-width: 1024px) { .sidebar-desktop { display: none; } }
        .sidebar-brand { display: flex; align-items: center; gap: 1rem; margin-bottom: 3rem; }
        .brand-logo { width: 44px; height: 44px; background: var(--primary); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px -2px rgba(79, 70, 229, 0.3); }
        .brand-info span { display: block; font-weight: 800; font-size: 1.25rem; color: var(--text-main); letter-spacing: -0.02em; }
        .brand-info small { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .sidebar-nav { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
        .nav-item { display: flex; align-items: center; gap: 1rem; padding: 0.85rem 1rem; text-decoration: none; color: var(--text-muted); border-radius: 12px; font-weight: 600; transition: all 0.2s; border: none; background: none; width: 100%; cursor: pointer; text-align: left; }
        .nav-item:hover { background: var(--bg-app); color: var(--primary); }
        .nav-item.active { background: var(--primary-light); color: var(--primary); }
        .sidebar-footer { padding-top: 1.5rem; border-top: 1px solid var(--border-light); display: flex; flex-direction: column; gap: 1rem; }
        .user-pill { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; }
        .user-avatar { width: 40px; height: 40px; background: var(--primary-light); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--primary); }
        .user-meta { display: flex; flex-direction: column; overflow: hidden; }
        .email-truncate { font-size: 0.85rem; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .role-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-light); }
        .btn-logout-sidebar { display: flex; align-items: center; gap: 0.75rem; background: none; border: none; color: var(--danger); font-weight: 700; cursor: pointer; font-size: 0.9rem; padding: 0.5rem 1rem; }
        .mobile-header { position: fixed; top: 0; left: 0; right: 0; height: 64px; background: var(--bg-card); border-bottom: 1px solid var(--border-light); display: none; align-items: center; justify-content: space-between; padding: 0 1.25rem; z-index: 100; }
        @media (max-width: 1024px) { .mobile-header { display: flex; } }
        .brand-mobile { display: flex; align-items: center; gap: 0.5rem; font-weight: 800; color: var(--primary); font-size: 1.1rem; }
        .btn-icon-mobile { background: none; border: none; color: var(--text-muted); padding: 0.5rem; cursor: pointer; position: relative; }
        .mobile-menu-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); z-index: 1000; backdrop-filter: blur(4px); }
        .mobile-menu-content { position: absolute; right: 0; top: 0; bottom: 0; width: 80%; max-width: 320px; background: var(--bg-card); padding: 2rem; }
        .mobile-menu-links { display: flex; flex-direction: column; gap: 1rem; }
        .mobile-link { text-decoration: none; color: var(--text-main); font-weight: 700; font-size: 1.1rem; padding: 0.5rem 0; background: none; border: none; text-align: left; }
        .notif-popup { position: fixed; top: 80px; right: 2rem; width: 320px; background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); border: 1px solid var(--border-light); z-index: 1000; }
        .notif-popup-item.unread { background: var(--primary-light); }
      `}</style>
    </>
  );
}
