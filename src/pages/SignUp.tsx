import { useState } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from 'src/components/ui/button';
import { Input } from "src/components/ui/input"
import { Label } from "src/components/ui/label"
import { GraduationCap, Loader2 } from "lucide-react"
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
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      {/* Form Side */}
      <div className="flex items-center justify-center py-12 px-6">
        <div className="mx-auto grid w-full max-w-[400px] gap-8">
          <div className="flex flex-col gap-2 text-center">
             <div className="flex items-center justify-center gap-2 text-primary font-bold text-2xl mb-4">
                <GraduationCap className="w-8 h-8" />
                <span>ClearanceHub</span>
             </div>
            <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
            <p className="text-muted-foreground text-sm">
              Enter your information to get started
            </p>
          </div>
          
          <form onSubmit={handleSignUp} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input 
                id="full-name" 
                placeholder="John Doe" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
                className="h-11"
              />
            </div>
            
            <div className="grid gap-2">
                <Label htmlFor="role">I am a...</Label>
                <Select onValueChange={(val: any) => setRole(val)} defaultValue={role}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="staff">Staff Member</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
            </div>

            {role === 'student' && (
                <div className="grid gap-2">
                  <Label htmlFor="reg-number">Registration Number</Label>
                  <Input
                    id="reg-number"
                    placeholder="e.g. CIT/123/2023"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
            )}

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
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
            
          </form>
          
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
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
            <h2 className="text-4xl font-bold tracking-tight">Join ClearanceHub Today</h2>
             <p className="text-lg text-primary-foreground/80 leading-relaxed">
                Create your account to access the digital clearance system. Fast, secure, and paperless.
            </p>
        </div>
      </div>
    </div>
  );
}
