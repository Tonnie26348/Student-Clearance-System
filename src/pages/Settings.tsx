import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import { Lock, Palette, ShieldCheck, Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select"
import { Separator } from "src/components/ui/separator"
import { Switch } from "src/components/ui/switch"

export default function Settings() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) toast.error(error.message);
    else {
        toast.success('Password updated successfully!');
        setPassword('');
        setConfirmPassword('');
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and security settings.</p>
        </div>

        <div className="grid gap-6">
            {/* Security Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        <CardTitle>Security</CardTitle>
                    </div>
                    <CardDescription>Update your password to keep your account secure.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                        <div className="grid gap-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input 
                                id="new-password" 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min 6 characters"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input 
                                id="confirm-password" 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat new password"
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="gap-2">
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Update Password
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Preferences Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-primary" />
                        <CardTitle>Preferences</CardTitle>
                    </div>
                    <CardDescription>Customize your dashboard appearance and experience.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Theme</Label>
                            <p className="text-sm text-muted-foreground">Select your preferred color scheme.</p>
                        </div>
                        <Select defaultValue="light">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive updates about your clearance status via email.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Desktop Push</Label>
                            <p className="text-sm text-muted-foreground">Show real-time notifications on your desktop.</p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>

            {/* Privacy Section */}
            <Card className="border-red-100 bg-red-50/10">
                <CardHeader>
                    <div className="flex items-center gap-2 text-red-600">
                        <ShieldCheck className="h-5 w-5" />
                        <CardTitle>Privacy & Data</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-red-900">Delete Account</Label>
                            <p className="text-sm text-muted-foreground">Permanently remove your account and all clearance data.</p>
                        </div>
                        <Button variant="destructive">Delete Account</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
