import { useState } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from 'src/components/ui/button';
import { Input } from "src/components/ui/input"
import { Label } from "src/components/ui/label"
import { GraduationCap, Loader2, ArrowLeft, User, Mail, Lock, Hash } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select"

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
        toast.error('System is not correctly configured.');
        return;
    }

    if (role === 'student') {
        const regRegex = /^[A-Z0-9\/]{5,}$/;
        if (!regRegex.test(regNumber)) {
            toast.error('Invalid Registration Number format. Use e.g. EB1/12345/21');
            return;
        }
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
    <div className="w-full min-h-screen flex items-stretch overflow-hidden bg-background">
      {/* Decorative Side */}
      <div className="hidden lg:flex flex-1 relative bg-primary items-center justify-center p-12 overflow-hidden">
        <div className="relative z-10 w-full max-w-[500px] space-y-12">
            <div className="space-y-4">
                <Badge className="bg-white/20 text-white border-none px-3 py-1 mb-4">Join ClearanceHub</Badge>
                <h2 className="text-5xl font-black text-white leading-tight text-balance">The Future of University Logistics.</h2>
                <p className="text-white/70 text-xl font-medium">Create your digital profile today and experience a seamless, automated clearance workflow.</p>
            </div>
            
            <div className="space-y-6">
                {[
                    "Eliminate physical paperwork forever",
                    "Track real-time departmental approvals",
                    "Instant digital certificate generation",
                    "Secure university-wide data syncing"
                ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3 text-white/90">
                        <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        </div>
                        <span className="font-bold">{text}</span>
                    </div>
                ))}
            </div>
        </div>
        
        {/* Background blobs */}
        <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-12 lg:px-20 relative z-10 bg-background">
        <div className="absolute top-8 right-8 md:top-12 md:right-12">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium">
                Back to Home <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
        </div>

        <div className="w-full max-w-[420px] space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-3 text-center md:text-left">
             <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-black text-2xl">
                <div className="bg-primary/10 p-2 rounded-xl">
                    <GraduationCap className="w-8 h-8" />
                </div>
                <span>ClearanceHub</span>
             </div>
            <h1 className="text-4xl font-black tracking-tight pt-4">Get Started</h1>
            <p className="text-muted-foreground text-lg font-medium text-balance">
              Create your account to access the clearance system.
            </p>
          </div>
          
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="full-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                        <User className="h-3 w-3" /> Full Name
                    </Label>
                    <Input 
                        id="full-name" 
                        placeholder="John Doe" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required 
                        className="h-12 bg-muted/30 border-none rounded-xl focus-visible:ring-primary/20"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                        Identity
                    </Label>
                    <Select onValueChange={(val: any) => setRole(val)} defaultValue={role}>
                        <SelectTrigger className="h-12 bg-muted/30 border-none rounded-xl focus-visible:ring-primary/20 font-bold">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-xl">
                            <SelectItem value="student" className="font-bold py-3">Student</SelectItem>
                            <SelectItem value="staff" className="font-bold py-3">Staff Member</SelectItem>
                            <SelectItem value="admin" className="font-bold py-3">Administrator</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="reg-number" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                    <Hash className="h-3 w-3" /> {role === 'student' ? 'Registration Number' : role === 'staff' ? 'Employee ID' : 'Admin ID'}
                </Label>
                <Input 
                    id="reg-number" 
                    placeholder={role === 'student' ? 'EB1/12345/21' : role === 'staff' ? 'STF/001' : 'ADM/001'} 
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    required 
                    className="h-12 bg-muted/30 border-none rounded-xl focus-visible:ring-primary/20"
                />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                <Mail className="h-3 w-3" /> University Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-muted/30 border-none rounded-xl focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-2 pb-4">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                <Lock className="h-3 w-3" /> Password
              </Label>
              <Input 
                id="password" 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="h-12 bg-muted/30 border-none rounded-xl focus-visible:ring-primary/20"
              />
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Create Account'}
            </Button>
          </form>

          <div className="text-center pt-2">
             <p className="text-muted-foreground font-medium">
                Already have an account? {' '}
                <Link to="/login" className="text-primary font-black hover:underline">
                  Sign In
                </Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className }: any) {
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>{children}</span>
}
