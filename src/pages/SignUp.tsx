import { useState } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, Mail, Lock, User, Hash, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [role, setRole] = useState<'student' | 'staff' | 'admin'>('student');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConfigured) {
        toast.error('System is not correctly configured. Please check your credentials.');
        return;
    }

    setLoading(true);

    try {
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    full_name: fullName,
                    reg_number: regNumber,
                    role: role
                }
            }
        });

        if (signUpError) {
            toast.error(signUpError.message);
            setLoading(false);
        } else if (user) {
            toast.success('Account created! Please check your email for verification.');
            navigate('/login');
        }
    } catch (err: any) {
        console.error('Sign up error:', err);
        toast.error(err.message || 'An unexpected error occurred during sign up');
        setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-visual signup-visual">
        <div className="visual-content">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="visual-logo">
                <GraduationCap size={48} />
            </motion.div>
            <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                Join the <br/>Clearance Revolution.
            </motion.h1>
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                Create your account and start your digital clearance process.
            </motion.p>
        </div>
      </div>

      <div className="auth-form-side">
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="form-container">
            <div className="form-header">
                <h2>Create Account</h2>
                <p>Register to start using the system</p>
            </div>

            <form onSubmit={handleSignUp} className="premium-form">
                <div className="input-group-premium">
                    <label><User size={16} /> Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
                </div>

                <div className="input-group-premium">
                    <label><ShieldCheck size={16} /> Account Type</label>
                    <select 
                        value={role} 
                        onChange={(e) => setRole(e.target.value as any)}
                        className="role-selector-premium"
                    >
                        <option value="student">Student</option>
                        <option value="staff">Staff Member</option>
                        <option value="admin">Administrator</option>
                    </select>
                </div>

                {role === 'student' && (
                    <div className="input-group-premium">
                        <label><Hash size={16} /> Registration Number</label>
                        <input type="text" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} placeholder="CIT/123/2023" required />
                    </div>
                )}

                <div className="input-group-premium">
                    <label><Mail size={16} /> Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gmail.com" required />
                </div>

                <div className="input-group-premium">
                    <label><Lock size={16} /> Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                </div>

                <button type="submit" disabled={loading} className="btn-auth-premium">
                    {loading ? 'Creating Account...' : 'Sign Up'} <ArrowRight size={18} />
                </button>
            </form>

            <div className="form-footer">
                <p>Already have an account? <Link to="/login">Sign In</Link></p>
            </div>
        </motion.div>
      </div>

      <style>{`
        .auth-wrapper { display: flex; min-height: 100vh; background: white; }
        @media (max-width: 900px) { .auth-visual { display: none; } }

        .auth-visual {
            flex: 1.2; background: #4f46e5; color: white; padding: 4rem;
            display: flex; flex-direction: column; justify-content: center; position: relative;
            background-image: radial-gradient(circle at top right, rgba(255,255,255,0.1), transparent);
        }
        .signup-visual { background: #4338ca; }

        .visual-logo { width: 80px; height: 80px; background: rgba(255,255,255,0.15); border-radius: 24px; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; }
        .visual-content h1 { font-size: 3.5rem; font-weight: 800; line-height: 1.1; margin-bottom: 1.5rem; color: white; letter-spacing: -0.02em; }
        .visual-content p { font-size: 1.25rem; color: rgba(255,255,255,0.8); font-weight: 500; }

        .auth-form-side { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; background: #f8fafc; }
        .form-container { width: 100%; max-width: 460px; background: white; padding: 3rem; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
        
        .form-header h2 { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
        .form-header p { color: #64748b; margin-bottom: 2rem; font-weight: 500; }

        .premium-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .input-group-premium { display: flex; flex-direction: column; gap: 0.4rem; }
        .input-group-premium label { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.85rem; color: #1e293b; }
        .input-group-premium input { padding: 0.8rem 1rem; border-radius: 12px; border: 1.5px solid #e2e8f0; font-size: 1rem; transition: all 0.2s; }
        .input-group-premium input:focus { border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); outline: none; }

        .role-selector-premium {
            padding: 0.8rem 1rem; border-radius: 12px; border: 1.5px solid #e2e8f0;
            font-size: 1rem; font-weight: 600; color: #1e293b; background: white;
            cursor: pointer; transition: all 0.2s; outline: none;
        }
        .role-selector-premium:focus { border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }

        .btn-auth-premium {
            margin-top: 1rem; background: #4f46e5; color: white; border: none;
            padding: 1rem; border-radius: 12px; font-weight: 800; font-size: 1rem;
            display: flex; align-items: center; justify-content: center; gap: 0.75rem;
            cursor: pointer; transition: all 0.2s;
        }
        .btn-auth-premium:hover { background: #4338ca; transform: translateY(-2px); }

        .form-footer { margin-top: 2rem; text-align: center; }
        .form-footer p { font-size: 0.9rem; color: #64748b; font-weight: 500; }
        .form-footer a { color: #4f46e5; text-decoration: none; font-weight: 700; }
      `}</style>
    </div>
  );
}
