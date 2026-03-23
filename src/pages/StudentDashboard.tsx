import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { Download, PlayCircle, Upload, FileText, CheckCircle2, Clock, XCircle, Loader2, Sparkles, User } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from "src/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "src/components/ui/card"
import { Badge } from "src/components/ui/badge"
import { Input } from "src/components/ui/input"
import { Label } from "src/components/ui/label"
import { cn } from "src/lib/utils"

interface ClearanceStatus {
  id: string; department: { name: string }; status: 'pending' | 'approved' | 'rejected'; comments: string | null; attachment_url?: string | null;
}

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [statuses, setStatuses] = useState<ClearanceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [profile, setProfile] = useState({ full_name: '', reg_number: '' });
  const [uploading, setUploading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      navigate('/login');
      return;
    }

    const loadData = async () => {
        try {
            setLoading(true);
            await Promise.allSettled([
                fetchProfile(),
                fetchClearanceData()
            ]);
        } catch (err) {
            console.error('Dashboard load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    loadData();
    
    const channel = supabase.channel('clearance_status_updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'clearance_status'
      }, () => {
        fetchClearanceData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, reg_number')
        .eq('id', user?.id)
        .maybeSingle();
      
      if (error) throw error;
      if (data) setProfile({ full_name: data.full_name || '', reg_number: data.reg_number || '' });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.full_name || !profile.reg_number) {
        toast.error('Please fill in all profile details');
        return;
    }
    const promise = async () => {
        const { error } = await supabase.from('profiles').update(profile).eq('id', user?.id);
        if (error) throw error;
    };
    toast.promise(promise(), { loading: 'Updating...', success: 'Profile Saved!', error: 'Failed to update' });
  }

  const fetchClearanceData = async () => {
    try {
      const { data: request, error: reqError } = await supabase
        .from('clearance_requests')
        .select('id')
        .eq('student_id', user?.id)
        .maybeSingle();

      if (reqError) throw reqError;

      if (request) {
        setRequestId(request.id);
        const { data, error: statusError } = await supabase
          .from('clearance_status')
          .select(`id, status, comments, attachment_url, department:departments(name)`)
          .eq('request_id', request.id);

        if (statusError) throw statusError;
        if (data) setStatuses(data as any);
      } else {
        setStatuses([]);
        setRequestId(null);
      }
    } catch (error) {
      console.error('Error fetching clearance data:', error);
    }
  };

  const startClearance = async () => {
    if (!user) return;
    if (!profile.full_name || !profile.reg_number) {
        toast.error('Please complete your profile first');
        return;
    }

    const promise = new Promise(async (resolve, reject) => {
        const { error: reqErr } = await supabase
            .from('clearance_requests')
            .insert({ student_id: user.id });

        if (reqErr) return reject(reqErr);

        await fetchClearanceData();
        resolve(true);
    });

    toast.promise(promise, { 
        loading: 'Initiating your clearance...', 
        success: 'Clearance started!', 
        error: (err: any) => `Error: ${err.message || 'Could not start'}` 
    });
  };

  const handleFileUpload = async (statusId: string, file: File) => {
    setUploading(statusId);
    const fileExt = file.name.split('.').pop();
    const filePath = `clearance-docs/${user?.id}/${statusId}-${Date.now()}.${fileExt}`;
    
    try {
        const { error: upErr } = await supabase.storage.from('documents').upload(filePath, file);
        if (upErr) throw upErr;
        
        const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);
        const { error: updateErr } = await supabase.from('clearance_status').update({ attachment_url: publicUrl }).eq('id', statusId);
        
        if (updateErr) throw updateErr;
        
        await fetchClearanceData();
        toast.success('Document uploaded!');
    } catch (error: any) {
        toast.error('Upload failed: ' + error.message);
    } finally {
        setUploading(null);
    }
  }

  const progress = statuses.length ? Math.round((statuses.filter(s => s.status === 'approved').length / statuses.length) * 100) : 0;

  const downloadCertificate = () => {
    if (progress < 100) {
        toast.error('Clearance in progress.');
        return;
    }

    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('UNIVERSITY CLEARANCE', 105, 25, { align: 'center' });
    
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16);
    doc.text('CERTIFICATE OF COMPLETION', 105, 60, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that:', 105, 80, { align: 'center' });
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(profile.full_name.toUpperCase(), 105, 95, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Reg No: ${profile.reg_number}`, 105, 105, { align: 'center' });
    doc.text('has been cleared by all university departments.', 105, 115, { align: 'center' });
    
    doc.setDrawColor(226, 232, 240);
    doc.line(40, 140, 170, 140);
    doc.text('Registrar (Academic Affairs)', 105, 150, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Generated on: ${date}`, 105, 200, { align: 'center' });
    
    doc.save(`Clearance_${profile.reg_number.replace(/\//g, '_')}.pdf`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Hero Welcome Section */}
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-10 md:px-12 md:py-16 text-primary-foreground shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left space-y-4">
              <Badge className="bg-white/20 text-white border-none hover:bg-white/30 px-3 py-1">
                Student Portal
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                Hello, {profile.full_name.split(' ')[0] || 'Student'}!
              </h1>
              <p className="text-primary-foreground/80 text-lg max-w-md">
                Welcome to your clearance dashboard. Track your progress and manage your exit process here.
              </p>
            </div>
            
            <div className="flex shrink-0">
               {!requestId ? (
                <Button 
                    onClick={startClearance} 
                    size="lg" 
                    variant="secondary"
                    className="h-14 px-8 text-lg font-bold rounded-full group"
                >
                  <PlayCircle className="mr-2 h-6 w-6 group-hover:scale-110 transition-transform" /> 
                  Start Clearance
                </Button>
              ) : progress === 100 ? (
                <Button 
                    onClick={downloadCertificate} 
                    size="lg" 
                    variant="secondary"
                    className="h-14 px-8 text-lg font-bold rounded-full bg-green-500 text-white hover:bg-green-600 border-none group"
                >
                  <Download className="mr-2 h-6 w-6 group-hover:translate-y-1 transition-transform" /> 
                  Download Certificate
                </Button>
              ) : (
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center">
                    <p className="text-xs uppercase tracking-widest font-bold mb-1 opacity-70">Progress</p>
                    <p className="text-4xl font-black">{progress}%</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Profile Info */}
            <div className="lg:col-span-1 space-y-6">
                <Card className="overflow-hidden border-none shadow-lg bg-card">
                    <CardHeader className="bg-muted/50 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Identity Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={updateProfile} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="fullname" className="text-xs uppercase font-bold text-muted-foreground">Full Name</Label>
                                <Input 
                                    id="fullname" 
                                    value={profile.full_name} 
                                    onChange={(e) => setProfile({...profile, full_name: e.target.value})} 
                                    className="bg-muted/30 border-none focus-visible:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="regno" className="text-xs uppercase font-bold text-muted-foreground">Reg Number</Label>
                                <Input 
                                    id="regno" 
                                    value={profile.reg_number} 
                                    onChange={(e) => setProfile({...profile, reg_number: e.target.value})}
                                    className="bg-muted/30 border-none focus-visible:ring-primary/20"
                                />
                            </div>
                            <Button type="submit" variant="outline" className="w-full font-bold">Update Profile</Button>
                        </form>
                    </CardContent>
                </Card>

                {requestId && (
                    <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg overflow-hidden relative">
                        <CardContent className="pt-6 pb-8 space-y-4 relative z-10">
                            <Sparkles className="h-10 w-10 opacity-20 absolute -top-2 -right-2 rotate-12" />
                            <h3 className="text-xl font-bold">Need Help?</h3>
                            <p className="text-sm text-white/80">If you encounter any issues with a specific department, please visit their offices with your original documents.</p>
                            <Button variant="secondary" size="sm" className="w-full bg-white dark:bg-slate-100 text-indigo-600 hover:bg-white/90 font-bold">
                                View Help Guide
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Clearance Statuses */}
            <div className="lg:col-span-2 space-y-6">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : statuses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {statuses.map((s, idx) => (
                            <motion.div
                                key={s.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className={cn(
                                    "group h-full border-none shadow-md transition-all hover:shadow-xl hover:-translate-y-1",
                                    s.status === 'approved' ? "bg-green-50/50" : s.status === 'rejected' ? "bg-red-50/50" : "bg-card"
                                )}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base font-bold">{s.department.name}</CardTitle>
                                                <Badge variant={s.status === 'approved' ? 'default' : s.status === 'rejected' ? 'destructive' : 'secondary'} className="text-[10px] h-5">
                                                    {s.status.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <div className={cn(
                                                "p-2 rounded-xl transition-colors",
                                                s.status === 'approved' ? "bg-green-100" : s.status === 'rejected' ? "bg-red-100" : "bg-muted"
                                            )}>
                                                {getStatusIcon(s.status)}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="text-sm py-2">
                                        <p className="text-muted-foreground line-clamp-2 italic">
                                            {s.comments ? `"${s.comments}"` : "No feedback provided yet."}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="pt-2">
                                        {s.attachment_url ? (
                                            <Button variant="ghost" size="sm" className="w-full justify-center text-primary font-bold hover:bg-primary/5" asChild>
                                                <a href={s.attachment_url} target="_blank" rel="noreferrer">
                                                    <FileText className="mr-2 h-4 w-4" /> View Proof
                                                </a>
                                            </Button>
                                        ) : (
                                            <div className="w-full">
                                                <input
                                                    type="file"
                                                    id={`file-${s.id}`}
                                                    className="hidden"
                                                    onChange={(e) => e.target.files && handleFileUpload(s.id, e.target.files[0])}
                                                />
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="w-full justify-center font-bold text-muted-foreground hover:text-primary hover:bg-primary/5" 
                                                    disabled={!!uploading}
                                                    onClick={() => document.getElementById(`file-${s.id}`)?.click()}
                                                >
                                                    {uploading === s.id ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="mr-2 h-4 w-4" />
                                                    )}
                                                    Upload Document
                                                </Button>
                                            </div>
                                        )}
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : !requestId ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                        <div className="bg-primary/10 p-6 rounded-full mb-6">
                            <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-bold">Ready to Start?</h3>
                        <p className="text-muted-foreground max-w-sm mt-2 mb-8 text-lg">
                            Your clearance journey is just a click away. Click the button above to begin.
                        </p>
                    </div>
                ) : (
                    <div className="text-center p-12">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                        <p className="mt-4 text-muted-foreground font-medium">Initializing clearance points...</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
