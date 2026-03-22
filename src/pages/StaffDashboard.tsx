import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import Navbar from '../components/Navbar';
import { Search, UserCheck, UserX, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface StudentRequest {
  id: string; // clearance_status id
  status: 'pending' | 'approved' | 'rejected';
  comments: string | null;
  attachment_url: string | null;
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
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.department_id) {
        fetchPendingRequests();
        
        // Real-time listening for new or updated requests in this department
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

  const [deptName, setDeptName] = useState<string>('');

  useEffect(() => {
      if (profile?.department_id) {
          supabase.from('departments').select('name').eq('id', profile.department_id).single()
              .then(({ data }) => { if (data) setDeptName(data.name); });
      }
  }, [profile?.department_id]);

  const fetchPendingRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clearance_status')
      .select(`
        id,
        status,
        comments,
        attachment_url,
        request:clearance_requests(
          student_id,
          student:profiles(email, full_name, reg_number)
        )
      `)
      .eq('department_id', profile?.department_id)
      .order('updated_at', { ascending: false });

    if (!error) {
      setRequests(data as any);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, studentId: string, newStatus: 'approved' | 'rejected', comments: string = '') => {
    setUpdatingId(id);
    const promise = new Promise(async (resolve, reject) => {
        const { error: updateError } = await supabase
            .from('clearance_status')
            .update({ 
                status: newStatus, 
                comments,
                approved_by: profile?.id,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) return reject(updateError);

        // Notify Student
        await supabase.from('notifications').insert({
            user_id: studentId,
            title: `Clearance ${newStatus.toUpperCase()}: ${deptName}`,
            message: newStatus === 'approved' 
                ? 'Your clearance has been approved! One step closer to graduation.' 
                : `Clearance rejected. Reason: ${comments || 'Please contact the department for more details.'}`,
            type: newStatus === 'approved' ? 'success' : 'error'
        });

        resolve(true);
    });

    toast.promise(promise, {
        loading: `Updating status to ${newStatus}...`,
        success: () => {
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, comments } : r));
            return `Student ${newStatus} successfully!`;
        },
        error: 'Update failed'
    });
    setUpdatingId(null);
  };

  const filteredRequests = requests.filter(r => 
    r.request.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.request.student.reg_number && r.request.student.reg_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.request.student.full_name && r.request.student.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="staff-dashboard">
      <Navbar />
      <main className="content">
        <header className="page-header">
          <div>
            <h1>Department Clearance</h1>
            <p className="subtitle">Managing: <strong>{deptName || 'No Department Assigned'}</strong></p>
          </div>
        </header>

        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name, reg no or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading">Fetching requests...</div>
        ) : (
          <div className="table-container animate-fade-in">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Status</th>
                  <th>Documents</th>
                  <th>Comments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id} className={req.status === 'pending' ? 'row-pending' : ''}>
                    <td>
                      <div className="student-info">
                        <span className="student-name">{req.request.student.full_name || 'No Name Provided'}</span>
                        <span className="student-email">{req.request.student.email}</span>
                        <span className="student-reg">{req.request.student.reg_number || 'No Reg No'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill pill-${req.status}`}>
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                        {req.attachment_url ? (
                            <a href={req.attachment_url} target="_blank" rel="noreferrer" className="doc-link">
                                <FileText size={16} /> View Proof
                            </a>
                        ) : (
                            <span className="no-doc">No Attachment</span>
                        )}
                    </td>
                    <td>
                      <div className="comment-cell">
                         {req.comments || <span className="no-comment">No comments yet</span>}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          title="Approve"
                          onClick={() => updateStatus(req.id, req.request.student_id, 'approved')}
                          disabled={updatingId === req.id || req.status === 'approved'}
                          className="btn-approve"
                        >
                          <UserCheck size={18} />
                        </button>
                        <button 
                          title="Reject with Reason"
                          onClick={() => {
                            const comment = prompt('Enter reason for rejection:', req.comments || '');
                            if (comment !== null && comment.trim() !== '') {
                                updateStatus(req.id, req.request.student_id, 'rejected', comment);
                            } else if (comment !== null) {
                                toast.error('A reason is required for rejection');
                            }
                          }}
                          disabled={updatingId === req.id}
                          className="btn-reject"
                        >
                          <UserX size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                    <tr>
                        <td colSpan={5} className="empty-row">No requests found matching your search.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <style>{`
        .staff-dashboard { min-height: 100vh; background-color: #f8fafc; }
        .content { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .page-header { margin-bottom: 2rem; }
        h1 { margin: 0; color: #1e293b; font-size: 1.875rem; font-weight: 800; }
        .subtitle { color: #64748b; margin-top: 0.5rem; font-weight: 500; }
        .subtitle strong { color: #4f46e5; }
        
        .search-bar {
          display: flex;
          align-items: center;
          background: white;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
          gap: 0.75rem;
          border: 1px solid #f1f5f9;
        }
        .search-icon { color: #94a3b8; }
        .search-bar input { border: none; flex: 1; font-size: 1rem; outline: none; }
        
        .table-container { background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #f1f5f9; }
        .requests-table { width: 100%; border-collapse: collapse; text-align: left; }
        .requests-table th { background-color: #f8fafc; padding: 1rem; font-weight: 700; color: #475569; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.025em; border-bottom: 1px solid #f1f5f9; }
        .requests-table td { padding: 1.25rem 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        
        .row-pending { background-color: #fffbeb; }
        
        .student-info { display: flex; flex-direction: column; gap: 0.2rem; }
        .student-name { font-weight: 700; color: #1e293b; font-size: 1rem; }
        .student-email, .student-reg { font-size: 0.8rem; color: #64748b; font-weight: 500; }
        
        .status-pill { padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.65rem; font-weight: 800; letter-spacing: 0.05em; display: inline-block; }
        .pill-pending { background: #fef3c7; color: #d97706; }
        .pill-approved { background: #dcfce7; color: #16a34a; }
        .pill-rejected { background: #fee2e2; color: #dc2626; }
        
        .doc-link { display: flex; align-items: center; gap: 0.4rem; color: #4f46e5; text-decoration: none; font-size: 0.85rem; font-weight: 600; }
        .doc-link:hover { text-decoration: underline; }
        .no-doc { color: #94a3b8; font-size: 0.8rem; font-style: italic; }

        .comment-cell { max-width: 250px; font-size: 0.85rem; color: #475569; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; }
        .no-comment { color: #cbd5e1; font-style: italic; }
        
        .action-buttons { display: flex; gap: 0.75rem; }
        .action-buttons button {
          padding: 0.6rem; border-radius: 10px; border: 1.5px solid #f1f5f9; cursor: pointer; transition: all 0.2s; background: white; color: #64748b;
          display: flex; align-items: center; justify-content: center;
        }
        .btn-approve:hover:not(:disabled) { background-color: #dcfce7; color: #16a34a; border-color: #16a34a; transform: scale(1.05); }
        .btn-reject:hover:not(:disabled) { background-color: #fee2e2; color: #dc2626; border-color: #dc2626; transform: scale(1.05); }
        .action-buttons button:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .empty-row { padding: 3rem; text-align: center; color: #94a3b8; font-weight: 500; font-style: italic; }
        .loading { padding: 4rem; text-align: center; color: #64748b; font-weight: 500; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
