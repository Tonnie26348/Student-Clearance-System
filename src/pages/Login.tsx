import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, Mail, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role === 'staff') navigate('/staff');
        else if (profile?.role === 'admin') navigate('/admin');
        else navigate('/student');
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-visual">
        <div className="visual-content">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="visual-logo">
                <GraduationCap size={48} />
            </motion.div>
            <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                Seamless Graduation <br/>Clearance.
            </motion.h1>
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                Experience the future of university administration. <br/>Efficient, transparent, and completely digital.
            </motion.p>
        </div>
        <div className="visual-footer">
            <div className="trusted-badge">
                <ShieldCheck size={16} /> <span>Official University System</span>
            </div>
        </div>
      </div>

      <div className="auth-form-side">
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="form-container">
            <div className="form-header">
                <h2>Welcome Back</h2>
                <p>Sign in to manage your clearance</p>
            </div>

            <form onSubmit={handleLogin} className="premium-form">
                <div className="input-group-premium">
                    <label><Mail size={16} /> Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gmail.com" required />
                </div>

                <div className="input-group-premium">
                    <label><Lock size={16} /> Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                </div>

                <button type="submit" disabled={loading} className="btn-auth-premium">
                    {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
                </button>
            </form>

            <div className="form-footer">
                <p>New to the system? <Link to="/signup">Create Account</Link></p>
                <p>Trouble signing in? <a href="#">Contact Support</a></p>
            </div>
        </motion.div>
      </div>

      <style>{`
        .auth-wrapper { display: flex; min-height: 100vh; background: white; }
        @media (max-width: 900px) { .auth-visual { display: none; } }

        .auth-visual {
            flex: 1.2; background: var(--primary); color: white; padding: 4rem;
            display: flex; flex-direction: column; justify-content: center; position: relative;
            background-image: radial-gradient(circle at top right, rgba(255,255,255,0.1), transparent);
        }
        .visual-logo { width: 80px; height: 80px; background: rgba(255,255,255,0.15); border-radius: 24px; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; }
        .visual-content h1 { font-size: 3.5rem; font-weight: 800; line-height: 1.1; margin-bottom: 1.5rem; color: white; letter-spacing: -0.02em; }
        .visual-content p { font-size: 1.25rem; color: rgba(255,255,255,0.8); font-weight: 500; }
        .visual-footer { position: absolute; bottom: 3rem; left: 4rem; }
        .trusted-badge { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(255,255,255,0.1); border-radius: 99px; font-weight: 700; font-size: 0.85rem; }

        .auth-form-side { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; background: var(--bg-app); }
        .form-container { width: 100%; max-width: 420px; background: white; padding: 3rem; border-radius: 24px; box-shadow: var(--shadow-lg); }
        
        .form-header h2 { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
        .form-header p { color: var(--text-muted); margin-bottom: 2.5rem; font-weight: 500; }

        .premium-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .input-group-premium { display: flex; flex-direction: column; gap: 0.5rem; }
        .input-group-premium label { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.85rem; color: var(--text-main); }
        .input-group-premium input { padding: 0.85rem 1rem; border-radius: 12px; border: 1.5px solid var(--border-main); font-size: 1rem; transition: all 0.2s; font-family: var(--font-main); }
        .input-group-premium input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-light); outline: none; }

        .btn-auth-premium {
            margin-top: 1rem; background: var(--primary); color: white; border: none;
            padding: 1rem; border-radius: 12px; font-weight: 800; font-size: 1rem;
            display: flex; align-items: center; justify-content: center; gap: 0.75rem;
            cursor: pointer; transition: all 0.2s;
        }
        .btn-auth-premium:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 8px 20px -4px rgba(79, 70, 229, 0.4); }
        .btn-auth-premium:active { transform: translateY(0); }

        .form-footer { margin-top: 2rem; text-align: center; }
        .form-footer p { font-size: 0.9rem; color: var(--text-muted); font-weight: 500; }
        .form-footer a { color: var(--primary); text-decoration: none; font-weight: 700; }
      `}</style>
    </div>
  );
}
