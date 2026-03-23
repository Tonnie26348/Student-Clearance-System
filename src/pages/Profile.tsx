import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useProfile } from '../lib/useProfile';
import { DashboardLayout } from '../components/DashboardLayout';
import { User, Mail, Shield, Building, Loader2, Save } from 'lucide-react';
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
  const { profile, loading: profileLoading, refreshProfile } = useProfile();
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

  if (profileLoading) {
    return (
        <DashboardLayout>
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and account settings.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
            {/* Identity Card */}
            <Card className="md:col-span-1">
                <CardHeader className="text-center">
                    <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold mb-2">
                        {fullName.substring(0, 2).toUpperCase() || '??'}
                    </div>
                    <CardTitle>{fullName || 'Student Name'}</CardTitle>
                    <CardDescription>{profile?.role?.toUpperCase()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline">{profile?.role}</Badge>
                    </div>
                    {profile?.role === 'staff' && (
                         <div className="flex items-center gap-2 text-sm">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>Department Admin</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Form */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Personal Details</CardTitle>
                    <CardDescription>Update your information as it will appear on the clearance certificate.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input 
                                id="full_name" 
                                value={fullName} 
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reg_number">Registration Number</Label>
                            <Input 
                                id="reg_number" 
                                value={regNumber} 
                                onChange={(e) => setRegNumber(e.target.value)}
                                placeholder="e.g. EB1/12345/21"
                                disabled={profile?.role !== 'student'}
                            />
                        </div>
                        <div className="grid gap-2">
                             <Label>Email Address</Label>
                             <Input 
                                value={user?.email || ''} 
                                disabled 
                                className="bg-muted"
                             />
                             <p className="text-xs text-muted-foreground italic">Email cannot be changed manually. Contact admin for assistance.</p>
                        </div>
                        <Button type="submit" disabled={updating} className="gap-2">
                            {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
