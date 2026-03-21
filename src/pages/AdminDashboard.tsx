import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { Users, Building2, Download, Plus, Trash2, PieChart, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  full_name: string | null;
  role: 'student' | 'staff' | 'admin';
  reg_number: string | null;
  department_id: string | null;
  email: string | null;
}

interface Department {
  id: string;
  name: string;
  description: string | null;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'depts' | 'stats'>('stats');
  const [newDeptName, setNewDeptName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: depts } = await supabase.from('departments').select('*');
    
    if (profiles) setUsers(profiles as UserProfile[]);
    if (depts) setDepartments(depts as Department[]);
    setLoading(false);
  };

  const updateRole = async (userId: string, role: string, deptId: string | null = null) => {
    const promise = supabase
      .from('profiles')
      .update({ role, department_id: deptId })
      .eq('id', userId);

    toast.promise(promise, {
        loading: 'Updating permissions...',
        success: () => { fetchData(); return 'User permissions updated!'; },
        error: 'Failed to update'
    });
  };

  const addDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName) return;
    const { error } = await supabase.from('departments').insert({ name: newDeptName });
    if (error) toast.error(error.message);
    else {
        toast.success('Department added!');
        setNewDeptName('');
        fetchData();
    }
  };

  const deleteDepartment = async (id: string) => {
    if (!confirm('Are you sure? This will affect all clearance requests linked to this department.')) return;
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
        toast.success('Department removed');
        fetchData();
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Reg Number', 'Role', 'Status'];
    const rows = users.map(u => [
        u.full_name || 'N/A',
        u.email || 'N/A',
        u.reg_number || 'N/A',
        u.role,
        'N/A' // In a full implementation, we'd join with clearance status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_clearance_report.csv");
    document.body.appendChild(link);
    link.click();
    toast.success('Report exported successfully!');
  };

  const stats = {
    totalStudents: users.filter(u => u.role === 'student').length,
    totalStaff: users.filter(u => u.role === 'staff').length,
    totalDepts: departments.length
  };

  return (
    <div className="admin-container">
      <Navbar />
      <main className="content">
        <header className="page-header">
          <div>
            <h1>Administrative Console</h1>
            <p className="subtitle">Global university oversight and configuration</p>
          </div>
          <button onClick={exportToCSV} className="btn-export">
            <Download size={18} />
            <span>Export Report</span>
          </button>
        </header>

        <div className="admin-tabs">
            <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>
                <PieChart size={18} /> Overview
            </button>
            <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                <Users size={18} /> User Access
            </button>
            <button className={activeTab === 'depts' ? 'active' : ''} onClick={() => setActiveTab('depts')}>
                <Building2 size={18} /> Departments
            </button>
        </div>

        {activeTab === 'stats' && (
            <div className="stats-section animate-fade-in">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon blue"><Users /></div>
                        <div><h3>{stats.totalStudents}</h3><p>Active Students</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon purple"><ShieldCheck /></div>
                        <div><h3>{stats.totalStaff}</h3><p>Authorized Staff</p></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green"><Building2 /></div>
                        <div><h3>{stats.totalDepts}</h3><p>Clearance Points</p></div>
                    </div>
                </div>
                
                <div className="info-box">
                    <h3>System Health</h3>
                    <p>All departmental nodes are active. Supabase Realtime is monitoring clearance events.</p>
                </div>
            </div>
        )}

        {activeTab === 'users' && (
            <section className="management-section animate-fade-in">
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Identity</th>
                                <th>Role</th>
                                <th>Department Assignment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="user-info">
                                            <strong>{u.full_name || 'No Name'}</strong>
                                            <span>{u.email}</span>
                                        </div>
                                    </td>
                                    <td><span className={`role-badge badge-${u.role}`}>{u.role}</span></td>
                                    <td>
                                        {u.role === 'staff' ? (
                                            <select 
                                                className="admin-select"
                                                value={u.department_id || ''} 
                                                onChange={(e) => updateRole(u.id, u.role, e.target.value)}
                                            >
                                                <option value="">No Department</option>
                                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                            </select>
                                        ) : <span className="text-muted">N/A</span>}
                                    </td>
                                    <td>
                                        <select 
                                            className="admin-select"
                                            value={u.role} 
                                            onChange={(e) => updateRole(u.id, e.target.value, u.department_id)}
                                        >
                                            <option value="student">Student</option>
                                            <option value="staff">Staff</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        )}

        {activeTab === 'depts' && (
            <section className="management-section animate-fade-in">
                <form onSubmit={addDepartment} className="add-dept-form">
                    <input 
                        type="text" 
                        placeholder="New Department Name (e.g. Health Services)" 
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                    />
                    <button type="submit" className="btn-add"><Plus size={18} /> Add</button>
                </form>

                <div className="dept-grid">
                    {departments.map(d => (
                        <div key={d.id} className="dept-card">
                            <div className="dept-info">
                                <h3>{d.name}</h3>
                                <p>Standard clearance point</p>
                            </div>
                            <button onClick={() => deleteDepartment(d.id)} className="btn-delete">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        )}
      </main>

      <style>{`
        .admin-container { min-height: 100vh; background: #f8fafc; }
        .content { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
        h1 { margin: 0; color: #1e293b; font-size: 2rem; font-weight: 800; }
        .subtitle { color: #64748b; font-weight: 500; }

        .btn-export {
            display: flex; align-items: center; gap: 0.5rem; background: white; color: #1e293b;
            border: 1px solid #e2e8f0; padding: 0.6rem 1.25rem; border-radius: 10px; font-weight: 700;
            cursor: pointer; transition: all 0.2s;
        }
        .btn-export:hover { background: #f1f5f9; border-color: #cbd5e1; }

        .admin-tabs { display: flex; gap: 0.5rem; margin-bottom: 2rem; background: #f1f5f9; padding: 0.4rem; border-radius: 12px; width: fit-content; }
        .admin-tabs button {
            border: none; background: none; padding: 0.6rem 1.25rem; border-radius: 8px; font-weight: 700;
            color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s;
        }
        .admin-tabs button.active { background: white; color: #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .stat-card { background: white; padding: 1.75rem; border-radius: 16px; display: flex; align-items: center; gap: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
        .stat-icon.blue { background: #3b82f6; }
        .stat-icon.purple { background: #8b5cf6; }
        .stat-icon.green { background: #10b981; }
        .stat-card h3 { margin: 0; font-size: 1.75rem; font-weight: 800; }
        .stat-card p { margin: 0; color: #64748b; font-weight: 600; font-size: 0.9rem; }

        .info-box { background: #eff6ff; border: 1px solid #bfdbfe; padding: 1.5rem; border-radius: 16px; color: #1e40af; }
        .info-box h3 { margin-top: 0; font-size: 1.1rem; }

        .add-dept-form { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .add-dept-form input { flex: 1; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 1rem; }
        .btn-add { background: #2563eb; color: white; border: none; padding: 0 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }

        .dept-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .dept-card { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; }
        .dept-card:hover { transform: translateY(-2px); border-color: #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .dept-info h3 { margin: 0; font-size: 1.1rem; color: #1e293b; }
        .dept-info p { margin: 0.25rem 0 0; font-size: 0.85rem; color: #64748b; }
        .btn-delete { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0.5rem; border-radius: 8px; transition: all 0.2s; }
        .btn-delete:hover { color: #ef4444; background: #fef2f2; }

        .admin-table th { background: #f8fafc; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; color: #64748b; }
        .admin-select { padding: 0.4rem; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 0.85rem; font-weight: 600; color: #475569; }
        .text-muted { color: #cbd5e1; font-style: italic; font-size: 0.85rem; }

        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
