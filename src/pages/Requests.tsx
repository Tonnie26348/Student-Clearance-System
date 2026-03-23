import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useProfile } from '../lib/useProfile';
import { DashboardLayout } from '../components/DashboardLayout';
import { FileText, Clock, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "src/components/ui/card"
import { Badge } from "src/components/ui/badge"

interface Request {
  id: string;
  status: string;
  created_at: string;
}

export default function Requests() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      fetchRequests();
    }
  }, [user, profile]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let query = supabase.from('clearance_requests').select('*');
      
      if (profile?.role === 'student') {
        query = query.eq('student_id', user?.id);
      }
      // For admin/staff, they might want to see all or filter. 
      // Keeping it simple: students see their history, others see all.
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500">Completed</Badge>;
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Clearance Requests</h1>
            <p className="text-muted-foreground">Historical record of all your clearance attempts.</p>
        </div>

        {loading ? (
             <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : requests.length > 0 ? (
            <div className="space-y-4">
                {requests.map((req) => (
                    <Card key={req.id}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">Request #{req.id.slice(0, 8).toUpperCase()}</CardTitle>
                                </div>
                                {getStatusBadge(req.status)}
                            </div>
                            <CardDescription>
                                Submitted on {new Date(req.created_at).toLocaleDateString()} at {new Date(req.created_at).toLocaleTimeString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {req.status === 'completed' 
                                    ? "This clearance request has been fully processed and approved by all departments." 
                                    : "This request is currently being reviewed by university departments."}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="text-center p-12 border-2 border-dashed rounded-lg bg-muted/10">
                <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No requests found</h3>
                <p className="text-muted-foreground">You haven't initiated any clearance processes yet.</p>
            </div>
        )}
      </div>
    </DashboardLayout>
  );
}
