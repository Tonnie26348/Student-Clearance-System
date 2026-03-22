import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import { DashboardLayout } from '../components/DashboardLayout';
import { Search, UserCheck, UserX, FileText, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "src/components/ui/button"
import { Input } from "src/components/ui/input"
import { Badge } from "src/components/ui/badge"
import {
  Card,
  CardContent,
} from "src/components/ui/card"

interface StudentRequest {
  id: string; // clearance_status id
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
  const { profile } = useProfile();
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptName, setDeptName] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.department_id) {
        fetchPendingRequests();
        
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
    }
  }, [profile]);

  useEffect(() => {
      if (profile?.department_id) {
          supabase.from('departments').select('name').eq('id', profile.department_id).single()
              .then(({ data }) => { if (data) setDeptName(data.name); });
      }
  }, [profile?.department_id]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
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
                ? 'Your clearance has been approved! One step closer to graduation.' 
                : `Clearance rejected. Reason: ${comments || 'Please contact the department for more details.'}`,
            type: newStatus === 'approved' ? 'success' : 'error'
        });

        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, comments } : r));
        toast.success(`Student ${newStatus} successfully!`);
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Department Clearance</h1>
                <p className="text-muted-foreground">Manage clearance requests for <strong>{deptName || '...'}</strong></p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchPendingRequests}>
                    Refresh
                </Button>
            </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-1/2 lg:w-1/3">
            <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search" 
                    placeholder="Search by name, reg no or email..." 
                    className="w-full pl-9 bg-background"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
            </Button>
        </div>

        <Card>
            <CardContent className="p-0">
                <div className="rounded-md border">
                    <div className="w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Student Info</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Attachment</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Comments</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-muted-foreground">Loading requests...</td>
                                    </tr>
                                ) : filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">No requests found.</td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((req) => (
                                        <tr key={req.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td className="p-4 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{req.request.student.full_name || 'N/A'}</span>
                                                    <span className="text-xs text-muted-foreground">{req.request.student.reg_number}</span>
                                                    <span className="text-xs text-muted-foreground">{req.request.student.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                {getStatusBadge(req.status)}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {req.attachment_url ? (
                                                    <a href={req.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline font-medium">
                                                        <FileText className="h-3 w-3" /> View
                                                    </a>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs italic">No file</span>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle max-w-[200px] truncate text-muted-foreground" title={req.comments || ''}>
                                                {req.comments || '-'}
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex justify-end gap-2">
                                                    {req.status !== 'approved' && (
                                                        <Button 
                                                            size="sm" 
                                                            variant="default"
                                                            className="bg-green-600 hover:bg-green-700 h-8 px-2"
                                                            onClick={() => updateStatus(req.id, req.request.student_id, 'approved')}
                                                            disabled={updatingId === req.id}
                                                        >
                                                            <UserCheck className="h-4 w-4 mr-1" /> Approve
                                                        </Button>
                                                    )}
                                                    {req.status !== 'rejected' && (
                                                        <Button 
                                                            size="sm" 
                                                            variant="destructive"
                                                            className="h-8 px-2"
                                                            onClick={() => {
                                                                const comment = prompt('Reason for rejection:');
                                                                if (comment) updateStatus(req.id, req.request.student_id, 'rejected', comment);
                                                            }}
                                                            disabled={updatingId === req.id}
                                                        >
                                                            <UserX className="h-4 w-4 mr-1" /> Reject
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
