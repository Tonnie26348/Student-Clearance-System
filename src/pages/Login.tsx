import { useState } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from 'src/components/ui/button';
import { Input } from "src/components/ui/input"
import { Label } from "src/components/ui/label"
import { GraduationCap, Loader2, ArrowLeft, ShieldCheck, Zap, Globe } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConfigured) {
        toast.error('System is not correctly configured.');
        return;
    }

    setLoading(true);

    try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            toast.error(error.message);
            setLoading(false);
            return;
        } 
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if (profile?.role === 'staff') navigate('/staff');
            else if (profile?.role === 'admin') navigate('/admin');
            else navigate('/student');
        }
    } catch (err: any) {
        toast.error(err.message || 'An unexpected error occurred');
        setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-stretch overflow-hidden bg-background">
      {/* Left side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-12 lg:px-20 relative z-10 bg-background">

        <div className="absolute top-8 left-8 md:top-12 md:left-12">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium">
                <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
        </div>

        <div className="w-full max-w-[420px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-3 text-center md:text-left">
             <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-black text-2xl">
                <div className="bg-primary/10 p-2 rounded-xl">
                    <GraduationCap className="w-8 h-8" />
                </div>
                <span>ClearanceHub</span>
             </div>
            <h1 className="text-4xl font-black tracking-tight pt-4">Welcome Back</h1>
            <p className="text-muted-foreground text-lg font-medium">
              Ready to continue your clearance journey?
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">University Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 px-4 bg-muted/30 border-none rounded-2xl focus-visible:ring-primary/20 text-base"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline font-bold"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="h-14 px-4 bg-muted/30 border-none rounded-2xl focus-visible:ring-primary/20 text-base"
              />
            </div>
            <Button type="submit" className="w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Log In'}
            </Button>
          </form>

          <div className="text-center pt-4">
             <p className="text-muted-foreground font-medium">
                Don't have an account? {' '}
                <Link to="/signup" className="text-primary font-black hover:underline">
                  Create Account
                </Link>
             </p>
          </div>
        </div>
      </div>

      {/* Right side: Decorative Illustration */}
      <div className="hidden lg:flex flex-1 relative bg-primary items-center justify-center p-12 overflow-hidden">
        <div className="relative z-10 w-full max-w-[500px] space-y-12">
            <div className="space-y-4">
                <h2 className="text-5xl font-black text-white leading-tight">Fast, Reliable & Paperless Clearance.</h2>
                <p className="text-white/70 text-xl font-medium">Join thousands of students who have simplified their university exit process through our digital platform.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
                {[
                    { icon: ShieldCheck, title: "Secure", desc: "Data encrypted" },
                    { icon: Zap, title: "Fast", desc: "Real-time updates" },
                    { icon: Globe, title: "Global", desc: "Access anywhere" },
                    { icon: GraduationCap, title: "Official", desc: "Certified docs" }
                ].map((item, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-3xl space-y-2">
                        <item.icon className="h-6 w-6 text-white" />
                        <h4 className="font-bold text-white text-lg">{item.title}</h4>
                        <p className="text-white/60 text-sm leading-tight">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
        
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
