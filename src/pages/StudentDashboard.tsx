import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { Download, PlayCircle, Upload, FileText, CheckCircle2, Clock, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from "src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "src/components/ui/card"
import { Badge } from "src/components/ui/badge"
import { Input } from "src/components/ui/input"
import { Label } from "src/components/ui/label"
import { Progress } from "src/components/ui/progress"

interface ClearanceStatus {
  id: string; department: { name: string }; status: 'pending' | 'approved' | 'rejected'; comments: string | null; attachment_url?: string | null;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<ClearanceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [profile, setProfile] = useState({ full_name: '', reg_number: '' });
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (user) { 
      fetchClearanceData(); 
      fetchProfile();
      
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
    }
  }, [user]);

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
      setLoading(true);
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
      }
    } catch (error) {
      console.error('Error fetching clearance data:', error);
      toast.error('Failed to load clearance status');
    } finally {
      setLoading(false);
    }
  };

  const startClearance = async () => {
    if (!user) return;
    if (!profile.full_name || !profile.reg_number) {
        toast.error('Please complete your profile first (Name and Reg No)');
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
        loading: 'Initiating your clearance journey...', 
        success: 'Clearance started successfully!', 
        error: (err: any) => `Error: ${err.message || 'Could not start clearance'}` 
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
        toast.success('Document uploaded successfully');
    } catch (error: any) {
        toast.error('Upload failed: ' + error.message);
    } finally {
        setUploading(null);
    }
  }

  const progress = statuses.length ? Math.round((statuses.filter(s => s.status === 'approved').length / statuses.length) * 100) : 0;

  const downloadCertificate = () => {
    if (progress < 100) {
        toast.error('Clearance is still in progress.');
        return;
    }

    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    
    // Header
    doc.setFillColor(37, 99, 235); // Primary Blue
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('UNIVERSITY CLEARANCE', 105, 25, { align: 'center' });
    
    // Title
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16);
    doc.text('OFFICIAL CERTIFICATE OF COMPLETION', 105, 60, { align: 'center' });
    
    // Content
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('This document certifies that the student listed below has successfully', 105, 80, { align: 'center' });
    doc.text('completed all departmental clearance requirements.', 105, 87, { align: 'center' });
    
    // Details Box
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.rect(20, 100, 170, 60);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Student Name:', 30, 115);
    doc.setFont('helvetica', 'normal');
    doc.text(profile.full_name, 75, 115);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Registration No:', 30, 130);
    doc.setFont('helvetica', 'normal');
    doc.text(profile.reg_number, 75, 130);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Certificate ID:', 30, 145);
    doc.setFont('helvetica', 'normal');
    doc.text(`CLR-${requestId?.slice(0,8).toUpperCase()}-${new Date().getFullYear()}`, 75, 145);
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${date}`, 105, 200, { align: 'center' });
    doc.text('Valid Digital Document', 105, 207, { align: 'center' });
    
    doc.save(`Clearance_Certificate_${profile.reg_number.replace(/\//g, '_')}.pdf`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
      switch (status) {
        case 'approved': return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Approved</Badge>;
        case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
        default: return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
                <p className="text-muted-foreground">Manage your clearance process and track progress.</p>
            </div>
             {!requestId ? (
              <Button onClick={startClearance} size="lg" className="gap-2">
                <PlayCircle className="h-5 w-5" /> Start Clearance
              </Button>
            ) : progress === 100 && (
              <Button onClick={downloadCertificate} size="lg" className="gap-2 bg-green-600 hover:bg-green-700">
                <Download className="h-5 w-5" /> Download Certificate
              </Button>
            )}
        </div>

        {/* Profile Card */}
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Ensure your details are correct before starting clearance.</CardDescription>
            </CardHeader>
            <CardContent>
                 <form onSubmit={updateProfile} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="grid w-full gap-2">
                        <Label htmlFor="fullname">Full Name</Label>
                        <Input id="fullname" value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} placeholder="e.g. John Doe" />
                    </div>
                    <div className="grid w-full gap-2">
                        <Label htmlFor="regno">Registration Number</Label>
                        <Input id="regno" value={profile.reg_number} onChange={(e) => setProfile({...profile, reg_number: e.target.value})} placeholder="e.g. EB1/12345/21" />
                    </div>
                    <Button type="submit" variant="secondary">Save Details</Button>
                </form>
            </CardContent>
        </Card>

        {loading ? (
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="h-24 bg-muted/50" />
                        <CardContent className="h-32" />
                    </Card>
                ))}
             </div>
        ) : statuses.length > 0 ? (
            <div className="space-y-6">
                {/* Progress Section */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-primary">Clearance Progress</span>
                            <span className="font-bold text-xl text-primary">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                        <p className="text-xs text-muted-foreground mt-2">
                            {progress === 100 ? "All cleared! You can now download your certificate." : "Complete all departmental clearances to finish."}
                        </p>
                    </CardContent>
                </Card>

                {/* Status Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {statuses.map((s, index) => (
                        <motion.div
                            key={s.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="h-full flex flex-col">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg font-semibold">{s.department.name}</CardTitle>
                                        {getStatusIcon(s.status)}
                                    </div>
                                    <CardDescription>{getStatusBadge(s.status)}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 text-sm">
                                    {s.comments ? (
                                        <div className="p-3 bg-muted rounded-md text-muted-foreground italic">
                                            "{s.comments}"
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">No comments yet.</span>
                                    )}
                                </CardContent>
                                <CardFooter className="pt-2 border-t bg-muted/20">
                                    {s.attachment_url ? (
                                        <Button variant="ghost" size="sm" className="w-full justify-start text-primary" asChild>
                                            <a href={s.attachment_url} target="_blank" rel="noreferrer">
                                                <FileText className="mr-2 h-4 w-4" /> View Document
                                            </a>
                                        </Button>
                                    ) : (
                                        <div className="w-full">
                                            <input
                                                type="file"
                                                id={`file-${s.id}`}
                                                className="hidden"
                                                onChange={(e) => e.target.files && handleFileUpload(s.id, e.target.files[0])}
                                                disabled={uploading === s.id}
                                            />
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="w-full justify-start" 
                                                disabled={uploading === s.id}
                                                onClick={() => document.getElementById(`file-${s.id}`)?.click()}
                                            >
                                                {uploading === s.id ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Upload className="mr-2 h-4 w-4" />
                                                )}
                                                Upload Proof
                                            </Button>
                                        </div>
                                    )}
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg bg-muted/10">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <AlertCircle className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">No Active Clearance</h3>
                <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                    You haven't started your clearance process yet. Ensure your profile is updated and click "Start Clearance".
                </p>
                <Button onClick={startClearance} variant="default">Start Clearance Now</Button>
            </div>
        )}
      </div>
    </DashboardLayout>
  );
}
