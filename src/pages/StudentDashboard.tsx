import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/ProgressBar';
import StatusCard from '../components/StatusCard';
import { Download, PlayCircle, User, Upload, FileText, History, Info } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface ClearanceStatus {
  id: string; department: { name: string }; status: 'pending' | 'approved' | 'rejected'; comments: string | null; attachment_url?: string | null;
}

const Skeleton = () => (
    <div className="skeleton-grid">
        {[1,2,3,4,5,6].map(i => (
            <div key={i} className="skeleton-card">
                <div className="skeleton h-6 w-3/4 mb-4" />
                <div className="skeleton h-4 w-1/2" />
            </div>
        ))}
    </div>
);

export default function StudentDashboard() {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<ClearanceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [profile, setProfile] = useState({ full_name: '', reg_number: '' });

  useEffect(() => {
    if (user) { 
      fetchClearanceData(); 
      fetchProfile();
      
      // Real-time listening for clearance status updates
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
    const { data } = await supabase.from('profiles').select('full_name, reg_number').eq('id', user?.id).single();
    if (data) setProfile({ full_name: data.full_name || '', reg_number: data.reg_number || '' });
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
    setLoading(true);
    const { data: request } = await supabase.from('clearance_requests').select('id').eq('student_id', user?.id).single();
    if (request) {
      setRequestId(request.id);
      const { data } = await supabase.from('clearance_status').select(`id, status, comments, attachment_url, department:departments(name)`).eq('request_id', request.id);
      if (data) setStatuses(data as any);
    }
    setLoading(false);
  };

  const startClearance = async () => {
    if (!user) return;
    if (!profile.full_name || !profile.reg_number) {
        toast.error('Please complete your profile first (Name and Reg No)');
        return;
    }

    const promise = new Promise(async (resolve, reject) => {
        // 1. Create the main request
        const { data: req, error: reqErr } = await supabase.from('clearance_requests').insert({ student_id: user.id }).select().single();
        if (reqErr) return reject(reqErr);

        // 2. Get all available departments
        const { data: depts, error: deptErr } = await supabase.from('departments').select('id');
        if (deptErr) return reject(deptErr);

        if (depts && depts.length > 0) {
            // 3. Create status entries for each department
            const { error: statusErr } = await supabase.from('clearance_status').insert(
                depts.map(d => ({ 
                    request_id: req.id, 
                    department_id: d.id, 
                    status: 'pending' 
                }))
            );
            if (statusErr) return reject(statusErr);
        } else {
            return reject(new Error('No departments found in the system.'));
        }

        await fetchClearanceData();
        resolve(true);
    });

    toast.promise(promise, { 
        loading: 'Initiating your clearance journey...', 
        success: 'Clearance started successfully!', 
        error: (err) => `Error: ${err.message || 'Could not start clearance'}` 
    });
  };

  const handleFileUpload = async (statusId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `clearance-docs/${user?.id}/${statusId}-${Date.now()}.${fileExt}`;
    
    const promise = new Promise(async (resolve, reject) => {
        const { error: upErr } = await supabase.storage.from('documents').upload(filePath, file);
        if (upErr) return reject(upErr);
        
        const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);
        const { error: updateErr } = await supabase.from('clearance_status').update({ attachment_url: publicUrl }).eq('id', statusId);
        
        if (updateErr) return reject(updateErr);
        
        await fetchClearanceData();
        resolve(true);
    });
    
    toast.promise(promise, { loading: 'Uploading proof...', success: 'Document uploaded!', error: 'Upload failed' });
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
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('UNIVERSITY OF EXCELLENCE', 105, 25, { align: 'center' });
    
    // Title
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(18);
    doc.text('OFFICIAL CLEARANCE CERTIFICATE', 105, 60, { align: 'center' });
    
    // Content
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that the student named below has fulfilled all departmental', 105, 80, { align: 'center' });
    doc.text('obligations and is fully cleared for graduation.', 105, 87, { align: 'center' });
    
    // Details Box
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.rect(20, 100, 170, 60);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Student Name:', 30, 115);
    doc.setFont('helvetica', 'normal');
    doc.text(profile.full_name, 70, 115);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Reg Number:', 30, 130);
    doc.setFont('helvetica', 'normal');
    doc.text(profile.reg_number, 70, 130);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Certificate ID:', 30, 145);
    doc.setFont('helvetica', 'normal');
    doc.text(`CLR-${requestId?.slice(0,8).toUpperCase()}-${new Date().getFullYear()}`, 70, 145);
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${date}`, 105, 200, { align: 'center' });
    doc.text('Verified Digital Document', 105, 207, { align: 'center' });
    
    // Stamp-like element
    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(1);
    doc.circle(160, 240, 20);
    doc.setTextColor(22, 163, 74);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('APPROVED', 160, 242, { align: 'center' });
    
    doc.save(`Clearance_Certificate_${profile.reg_number.replace(/\//g, '_')}.pdf`);
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <main className="content animate-fade-in">
        <header className="page-header-premium">
          <div className="header-main">
            <h1>Student Hub</h1>
            <p>Managing clearance for {profile.full_name || user?.email}</p>
          </div>
          <div className="header-actions">
            {!requestId ? (
              <button onClick={startClearance} className="btn-premium"><PlayCircle size={18} /> Start Clearance</button>
            ) : progress === 100 && (
              <button onClick={downloadCertificate} className="btn-premium success"><Download size={18} /> Download Certificate</button>
            )}
          </div>
        </header>

        <div className="dashboard-layout">
            <div className="dashboard-main">
                <section className="glass-card p-6 mb-8">
                    <div className="section-header mb-6">
                        <User size={20} className="text-primary" />
                        <h2 className="text-lg font-bold">Profile Details</h2>
                    </div>
                    <form onSubmit={updateProfile} className="profile-grid">
                        <div className="input-field">
                            <label>Full Name</label>
                            <input type="text" value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} placeholder="Full Name" />
                        </div>
                        <div className="input-field">
                            <label>Reg Number</label>
                            <input type="text" value={profile.reg_number} onChange={(e) => setProfile({...profile, reg_number: e.target.value})} placeholder="Reg No" />
                        </div>
                        <button type="submit" className="btn-save">Update</button>
                    </form>
                </section>

                {loading ? <Skeleton /> : statuses.length > 0 ? (
                    <div className="status-section">
                        <div className="progress-overview glass-card mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold">Completion Progress</span>
                                <span className="text-primary font-black">{progress}%</span>
                            </div>
                            <ProgressBar percentage={progress} />
                        </div>
                        <div className="status-grid-premium">
                            {statuses.map((s) => (
                                <div key={s.id} className="status-card-wrapper glass-card">
                                    <StatusCard department={s.department.name} status={s.status} comment={s.comments || undefined} />
                                    <div className="card-footer">
                                        {s.attachment_url ? (
                                            <a href={s.attachment_url} target="_blank" rel="noreferrer" className="link-doc"><FileText size={14} /> View Document</a>
                                        ) : (
                                            <label className="upload-label"><Upload size={14} /> Upload Proof<input type="file" hidden onChange={(e) => e.target.files && handleFileUpload(s.id, e.target.files[0])} /></label>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="glass-card empty-state-box">
                        <div className="icon-circle"><Info size={32} /></div>
                        <h3>No Active Request</h3>
                        <p>Your clearance journey hasn't started yet. Click the button above to begin.</p>
                    </div>
                )}
            </div>

            <aside className="dashboard-side">
                <div className="glass-card p-6">
                    <div className="section-header mb-4">
                        <History size={18} className="text-primary" />
                        <h3 className="font-bold">Next Steps</h3>
                    </div>
                    <ul className="guide-list">
                        <li className="done">Account Setup</li>
                        <li className={requestId ? 'done' : 'next'}>Initiate Request</li>
                        <li className={statuses.length ? 'next' : ''}>Department Approval</li>
                        <li className={progress === 100 ? 'done' : ''}>Digital Download</li>
                    </ul>
                </div>
            </aside>
        </div>
      </main>

      <style>{`
        .page-header-premium { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; gap: 1rem; flex-wrap: wrap; }
        .page-header-premium h1 { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.02em; margin: 0; }
        .page-header-premium p { color: var(--text-muted); margin: 0.25rem 0 0; font-weight: 500; }

        .dashboard-layout { display: grid; grid-template-columns: 1fr 320px; gap: 2rem; }
        @media (max-width: 1100px) { .dashboard-layout { grid-template-columns: 1fr; } }

        .profile-grid { display: flex; gap: 1.5rem; align-items: flex-end; flex-wrap: wrap; }
        .input-field { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 0.5rem; }
        .input-field label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); }
        .input-field input { padding: 0.75rem 1rem; border-radius: 12px; border: 1.5px solid var(--border-main); background: var(--bg-app); font-weight: 600; }
        .btn-save { padding: 0.75rem 1.5rem; border-radius: 12px; border: none; background: var(--primary-light); color: var(--primary); font-weight: 800; cursor: pointer; }

        .status-grid-premium { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .status-card-wrapper { display: flex; flex-direction: column; overflow: hidden; }
        .card-footer { padding: 1rem; background: var(--bg-app); display: flex; justify-content: flex-end; border-top: 1px solid var(--border-light); }
        .upload-label, .link-doc { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); cursor: pointer; text-decoration: none; }
        .upload-label:hover, .link-doc:hover { color: var(--primary); }

        .guide-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }
        .guide-list li { display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; font-weight: 600; color: var(--text-light); }
        .guide-list li::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--border-main); }
        .guide-list li.done { color: var(--success); }
        .guide-list li.done::before { background: var(--success); }
        .guide-list li.next { color: var(--primary); }
        .guide-list li.next::before { background: var(--primary); }

        .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .skeleton-card { background: var(--bg-card); padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border-light); }
        .skeleton { background: var(--border-light); }
        .h-6 { height: 1.5rem; } .h-4 { height: 1rem; } .w-3\/4 { width: 75%; } .w-1\/2 { width: 50%; } .mb-4 { margin-bottom: 1rem; } .mb-6 { margin-bottom: 1.5rem; } .p-6 { padding: 1.5rem; } .mb-8 { margin-bottom: 2rem; } .flex { display: flex; } .justify-between { justify-content: space-between; } .items-center { align-items: center; } .font-bold { font-weight: 700; } .text-primary { color: var(--primary); } .font-black { font-weight: 900; } .text-lg { font-size: 1.125rem; }

        .empty-state-box { padding: 4rem; text-align: center; }
        .icon-circle { width: 64px; height: 64px; background: var(--primary-light); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
      `}</style>
    </div>
  );
}
