import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import { DashboardLayout } from '../components/DashboardLayout';
import { Search, UserCheck, UserX, FileText, Filter, Users, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "src/components/ui/button"
import { Input } from "src/components/ui/input"
import { Badge } from "src/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "src/components/ui/card"
import { useNavigate } from 'react-router-dom';

interface StudentRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  comments: string | null;
  attachment_url: string | null;
  updated_at: string;
  request: {
    student_id: string;
    student: {
      email: string;
      full_name: string;
      reg_number: string;
    };
  };
}

export default function StaffDashboard() {
  const { profile, loading: profileLoading } = useProfile();
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deptName, setDeptName] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (profileLoading) return;

    if (!profile || profile.role !== 'staff') {
        if (profile?.role === 'student') navigate('/student');
        else if (profile?.role === 'admin') navigate('/admin');
        else navigate('/login');
        setLoading(false);
        return;
    }

    const loadStaffData = async () => {
        try {
            setLoading(true);
            await fetchPendingRequests();
            const { data: deptData } = await supabase.from('departments').select('name').eq('id', profile.department_id).single();
            if (deptData) setDeptName(deptData.name);
        } catch (err) {
            console.error('Staff dashboard load failed:', err);
        } finally {
            setLoading(false);
        }
    };

    if (profile.department_id) {
        loadStaffData();
        
        const channel = supabase.channel(`dept_${profile.department_id}_updates`)
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'clearance_status',
                filter: `department_id=eq.${profile.department_id}`
            }, () => {
                fetchPendingRequests();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    } else {
        setLoading(false);
    }
  }, [profile, profileLoading, navigate]);

  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('clearance_status')
        .select(`
          id,
          status,
          comments,
          attachment_url,
          updated_at,
          request:clearance_requests(
            student_id,
            student:profiles(email, full_name, reg_number)
          )
        `)
        .eq('department_id', profile?.department_id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (data) setRequests(data as any);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, studentId: string, newStatus: 'approved' | 'rejected', comments: string = '') => {
    setUpdatingId(id);
    
    try {
        const { error: updateError } = await supabase
            .from('clearance_status')
            .update({ 
                status: newStatus, 
                comments,
                approved_by: profile?.id,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) throw updateError;

        await supabase.from('notifications').insert({
            user_id: studentId,
            title: `Clearance ${newStatus.toUpperCase()}: ${deptName}`,
            message: newStatus === 'approved' 
                ? 'Your clearance has been approved!' 
                : `Clearance rejected. Reason: ${comments}`,
            type: newStatus === 'approved' ? 'success' : 'error'
        });

        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, comments } : r));
        toast.success(`Student ${newStatus}!`);
    } catch (error) {
        toast.error('Update failed');
    } finally {
        setUpdatingId(null);
    }
  };

  const filteredRequests = requests.filter(r => 
    r.request.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.request.student.reg_number && r.request.student.reg_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.request.student.full_name && r.request.student.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Department Portal</h1>
                <p className="text-muted-foreground text-lg">Managing <strong>{deptName || 'Department'}</strong></p>
            </div>
            <Button variant="outline" className="rounded-full px-6 shadow-sm bg-card" onClick={fetchPendingRequests}>
                Refresh Data
            </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-md bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total Requests</CardTitle>
                    <Users className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black">{stats.total}</div>
                </CardContent>
            </Card>
            <Card className="border-none shadow-md bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Pending Action</CardTitle>
                    <Clock className="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black">{stats.pending}</div>
                </CardContent>
            </Card>
            <Card className="border-none shadow-md bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Approved</CardTitle>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black">{stats.approved}</div>
                </CardContent>
            </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search students..." 
                    className="pl-10 h-12 bg-card border-none shadow-sm rounded-xl focus-visible:ring-primary/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button variant="ghost" className="rounded-xl h-12 px-4 text-muted-foreground hover:bg-card hover:text-primary transition-all">
                <Filter className="h-4 w-4 mr-2" /> Filters
            </Button>
        </div>

        {/* List/Table */}
        <div className="space-y-4">
            {loading ? (
                <div className="grid gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />)}
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="text-center p-20 bg-card rounded-3xl shadow-sm border-2 border-dashed border-border">
                    <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold">No Students Found</h3>
                    <p className="text-muted-foreground mt-1">No requests currently match your search criteria.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredRequests.map((req) => (
                        <Card key={req.id} className="group border-none shadow-sm transition-all hover:shadow-md bg-card overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row items-stretch md:items-center p-6 gap-6">
                                    <div className="flex-1 min-w-0 flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                            {req.request.student.full_name?.substring(0, 2).toUpperCase() || 'ST'}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-lg truncate">{req.request.student.full_name}</h3>
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground font-medium">
                                                <span className="bg-muted px-2 py-0.5 rounded text-[10px]">{req.request.student.reg_number}</span>
                                                <span className="truncate">{req.request.student.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-4 px-0 md:px-6">
                                        <Badge variant={req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : 'secondary'} className="px-3 rounded-full h-7 font-bold">
                                            {req.status.toUpperCase()}
                                        </Badge>
                                        {req.attachment_url && (
                                            <a href={req.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline font-bold text-sm shrink-0">
                                                <FileText className="h-4 w-4" /> <span className="hidden sm:inline">View Proof</span>
                                            </a>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 md:flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                                        {req.status !== 'approved' && (
                                            <Button 
                                                size="sm" 
                                                className="bg-green-600 hover:bg-green-700 h-10 px-4 rounded-xl font-bold shadow-lg shadow-green-600/20 transition-transform active:scale-95"
                                                onClick={() => updateStatus(req.id, req.request.student_id, 'approved')}
                                                disabled={updatingId === req.id}
                                            >
                                                <UserCheck className="h-4 w-4 mr-2" /> Approve
                                            </Button>
                                        )}
                                        {req.status !== 'rejected' && (
                                            <Button 
                                                size="sm" 
                                                variant="destructive"
                                                className="h-10 px-4 rounded-xl font-bold shadow-lg shadow-red-600/20 transition-transform active:scale-95"
                                                onClick={() => {
                                                    const comment = prompt('Reason for rejection:');
                                                    if (comment) updateStatus(req.id, req.request.student_id, 'rejected', comment);
                                                }}
                                                disabled={updatingId === req.id}
                                            >
                                                <UserX className="h-4 w-4 mr-2" /> Reject
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {req.comments && (
                                    <div className="px-6 pb-4 pt-0">
                                        <div className="bg-muted/50 p-3 rounded-xl text-xs text-muted-foreground italic border-l-4 border-primary/30">
                                            "{req.comments}"
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}
