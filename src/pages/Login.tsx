import { useState } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from 'src/components/ui/button';
import { Input } from "src/components/ui/input"
import { Label } from "src/components/ui/label"
import { GraduationCap, Loader2 } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConfigured) {
        toast.error('System is not correctly configured. Please check your credentials in the .env file.');
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
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2 bg-muted/30">
      <div className="flex items-center justify-center py-12 px-6 relative">
        {/* Mobile background flourish */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent lg:hidden pointer-events-none" />
        
        <div className="mx-auto grid w-full max-w-[400px] gap-8 relative z-10 bg-background p-8 rounded-2xl shadow-xl border border-border/50 lg:shadow-none lg:border-none lg:p-0">
          <div className="flex flex-col gap-2 text-center">
             <div className="flex items-center justify-center gap-2 text-primary font-bold text-2xl mb-4">
                <GraduationCap className="w-8 h-8" />
                <span>ClearanceHub</span>
             </div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-sm">
              Enter your email below to login to your account
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="ml-auto inline-block text-sm text-primary hover:underline font-medium"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            
             <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button variant="outline" className="w-full h-11" type="button">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      
      {/* Decorative Side */}
      <div className="hidden bg-primary lg:flex flex-col items-center justify-center p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-blue-900/90"></div>
        
        <div className="relative z-10 max-w-[500px] text-center space-y-6">
            <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl border border-white/10">
                <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight">Streamline Your Clearance Process</h2>
            <p className="text-lg text-primary-foreground/80 leading-relaxed">
                Experience a modern, efficient way to manage student clearance. No more long queues and paperwork.
            </p>
            
             <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20 mt-8">
                <div>
                    <h3 className="text-2xl font-bold">100%</h3>
                    <p className="text-xs text-primary-foreground/60 uppercase tracking-wider mt-1">Digital</p>
                </div>
                 <div>
                    <h3 className="text-2xl font-bold">24/7</h3>
                    <p className="text-xs text-primary-foreground/60 uppercase tracking-wider mt-1">Access</p>
                </div>
                 <div>
                    <h3 className="text-2xl font-bold">Fast</h3>
                    <p className="text-xs text-primary-foreground/60 uppercase tracking-wider mt-1">Processing</p>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}
