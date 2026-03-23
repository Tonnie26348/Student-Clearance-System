import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useProfile } from '../lib/useProfile';
import { DashboardLayout } from '../components/DashboardLayout';
import { Mail, Shield, Loader2, Save, User as UserIcon, Hash, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "src/components/ui/button"
import { Input } from "src/components/ui/input"
import { Label } from "src/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "src/components/ui/card"
import { Badge } from "src/components/ui/badge"

export default function Profile() {
  const { user } = useAuth();
  const { profile, refreshProfile } = useProfile();
  const [fullName, setFullName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setRegNumber(profile.reg_number || '');
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setUpdating(true);
    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                reg_number: regNumber,
            })
            .eq('id', user.id);

        if (error) throw error;
        
        toast.success('Profile updated successfully!');
        refreshProfile();
    } catch (error: any) {
        toast.error('Failed to update profile: ' + error.message);
    } finally {
        setUpdating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div>
            <h1 className="text-4xl font-black tracking-tight">Account Profile</h1>
            <p className="text-muted-foreground text-lg">Manage your identity and public information.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-12">
            {/* Identity Card */}
            <Card className="md:col-span-4 border-none shadow-xl bg-primary text-primary-foreground overflow-hidden relative h-fit">
                <CardHeader className="text-center pb-8 pt-10 relative z-10">
                    <div className="mx-auto h-24 w-24 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-4xl font-black mb-4 shadow-inner">
                        {fullName.substring(0, 2).toUpperCase() || '??'}
                    </div>
                    <CardTitle className="text-2xl font-black">{fullName || 'User Name'}</CardTitle>
                    <Badge className="mt-2 bg-white/20 text-white border-none hover:bg-white/30 uppercase tracking-widest font-bold text-[10px]">
                        {profile?.role}
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10 bg-white/10 backdrop-blur-sm p-6">
                    <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-white/10 rounded-lg"><Mail className="h-4 w-4" /></div>
                        <span className="truncate font-medium">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-white/10 rounded-lg"><Hash className="h-4 w-4" /></div>
                        <span className="font-medium">{profile?.reg_number || 'No ID set'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-white/10 rounded-lg"><Calendar className="h-4 w-4" /></div>
                        <span className="font-medium text-white/80">Member since 2026</span>
                    </div>
                </CardContent>
                
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
            </Card>

            {/* Edit Form */}
            <Card className="md:col-span-8 border-none shadow-lg bg-card">
                <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="text-xl font-bold">Personal Details</CardTitle>
                    <CardDescription>This information is used for your official clearance certificate.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="full_name" className="text-xs font-black uppercase text-muted-foreground tracking-wider">Full Name</Label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="full_name" 
                                        value={fullName} 
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Full legal name"
                                        className="pl-10 h-12 bg-muted/30 border-none rounded-xl focus-visible:ring-primary/20 font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reg_number" className="text-xs font-black uppercase text-muted-foreground tracking-wider">
                                    {profile?.role === 'student' ? 'Registration Number' : 'Staff ID'}
                                </Label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="reg_number" 
                                        value={regNumber} 
                                        onChange={(e) => setRegNumber(e.target.value)}
                                        placeholder="e.g. EB1/12345/21"
                                        disabled={profile?.role !== 'student'}
                                        className="pl-10 h-12 bg-muted/30 border-none rounded-xl focus-visible:ring-primary/20 font-medium disabled:opacity-50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <Label className="text-xs font-black uppercase text-muted-foreground tracking-wider text-balance">Official Email</Label>
                             <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    value={user?.email || ''} 
                                    disabled 
                                    className="pl-10 h-12 bg-muted/50 border-none rounded-xl font-medium"
                                />
                             </div>
                             <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                                <Shield className="h-3 w-3" /> EMAIL CANNOT BE CHANGED MANUALLY. CONTACT ADMIN.
                             </p>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" disabled={updating} className="h-12 px-8 rounded-xl font-black shadow-lg shadow-primary/20 gap-2 transition-transform active:scale-95">
                                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Update Profile
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
