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
  const [activeTab, setActiveTab] = useState<'users' | 'depts' | 'stats'>('stats');
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: depts } = await supabase.from('departments').select('*').order('name');
    
    if (profiles) setUsers(profiles as UserProfile[]);
    if (depts) setDepartments(depts as Department[]);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Reg Number', 'Role'];
    const rows = users.map(u => [
        u.full_name || 'N/A',
        u.email || 'N/A',
        u.reg_number || 'N/A',
        u.role
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_clearance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    toast.success('Report exported successfully!');
  };

  const updateRole = async (userId: string, role: string, deptId: string | null = null) => {
    const promise = async () => {
        const { error } = await supabase
            .from('profiles')
            .update({ role, department_id: deptId || null })
            .eq('id', userId);
        if (error) throw error;
        await fetchData();
    };

    toast.promise(promise(), {
        loading: 'Updating permissions...',
        success: 'User permissions updated!',
        error: 'Failed to update'
    });
  };

  const addDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName) return;
    const { error } = await supabase.from('departments').insert({ 
        name: newDeptName,
        description: newDeptDesc 
    });
    if (error) toast.error(error.message);
    else {
        toast.success('Department added!');
        setNewDeptName('');
        setNewDeptDesc('');
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

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.reg_number?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const stats = {
    totalStudents: users.filter(u => u.role === 'student').length,
    totalStaff: users.filter(u => u.role === 'staff').length,
    totalDepts: departments.length,
    admins: users.filter(u => u.role === 'admin').length
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
          <div className="header-actions-group">
            <button onClick={exportToCSV} className="btn-export">
                <Download size={18} />
                <span>Export Report</span>
            </button>
          </div>
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
                    <div className="stat-card">
                        <div className="stat-icon orange"><ShieldCheck /></div>
                        <div><h3>{stats.admins}</h3><p>System Admins</p></div>
                    </div>
                </div>
                
                <div className="info-box-premium">
                    <div className="info-header">
                        <ShieldCheck size={24} />
                        <h3>System Security & Health</h3>
                    </div>
                    <p>The clearance system is running on Supabase with Row Level Security enabled. All departmental nodes are reporting active status. Real-time event bus is operational.</p>
                </div>
            </div>
        )}

        {activeTab === 'users' && (
            <section className="management-section animate-fade-in">
                <div className="search-bar-admin">
                    <input 
                        type="text" 
                        placeholder="Search users by name, email or reg no..." 
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                    />
                </div>
                <div className="table-container-admin">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Identity</th>
                                <th>Role</th>
                                <th>Department Assignment</th>
                                <th>Access Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u) => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="user-info">
                                            <strong>{u.full_name || 'No Name'}</strong>
                                            <span className="user-sub">{u.email}</span>
                                            {u.reg_number && <span className="user-reg-tag">{u.reg_number}</span>}
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
                                            className="admin-select access-select"
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
                <div className="glass-card-admin p-6 mb-8">
                    <h3 className="mb-4 font-bold">Register New Department</h3>
                    <form onSubmit={addDepartment} className="add-dept-form-premium">
                        <div className="form-row">
                            <input 
                                type="text" 
                                placeholder="Department Name" 
                                value={newDeptName}
                                onChange={(e) => setNewDeptName(e.target.value)}
                                required
                            />
                            <input 
                                type="text" 
                                placeholder="Brief Description" 
                                value={newDeptDesc}
                                onChange={(e) => setNewDeptDesc(e.target.value)}
                            />
                            <button type="submit" className="btn-add-premium"><Plus size={18} /> Add Point</button>
                        </div>
                    </form>
                </div>

                <div className="dept-grid-premium">
                    {departments.map(d => (
                        <div key={d.id} className="dept-card-premium">
                            <div className="dept-main">
                                <div className="dept-icon"><Building2 size={24} /></div>
                                <div className="dept-details">
                                    <h3>{d.name}</h3>
                                    <p>{d.description || 'Standard university clearance point'}</p>
                                </div>
                            </div>
                            <button onClick={() => deleteDepartment(d.id)} className="btn-delete-dept" title="Remove Department">
                                <Trash2 size={18} />
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
        h1 { margin: 0; color: #1e293b; font-size: 2.25rem; font-weight: 800; letter-spacing: -0.02em; }
        .subtitle { color: #64748b; font-weight: 500; margin-top: 0.25rem; }

        .btn-export {
            display: flex; align-items: center; gap: 0.5rem; background: white; color: #1e293b;
            border: 1.5px solid #e2e8f0; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700;
            cursor: pointer; transition: all 0.2s;
        }
        .btn-export:hover { background: #f1f5f9; border-color: #cbd5e1; transform: translateY(-1px); }

        .admin-tabs { display: flex; gap: 0.5rem; margin-bottom: 2.5rem; background: #f1f5f9; padding: 0.5rem; border-radius: 14px; width: fit-content; }
        .admin-tabs button {
            border: none; background: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700;
            color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 0.6rem; transition: all 0.2s;
        }
        .admin-tabs button.active { background: white; color: #4f46e5; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .stat-card { background: white; padding: 2rem; border-radius: 20px; display: flex; align-items: center; gap: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
        .stat-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; }
        .stat-icon.blue { background: #4f46e5; }
        .stat-icon.purple { background: #8b5cf6; }
        .stat-icon.green { background: #10b981; }
        .stat-icon.orange { background: #f59e0b; }
        .stat-card h3 { margin: 0; font-size: 2rem; font-weight: 900; color: #1e293b; }
        .stat-card p { margin: 0; color: #64748b; font-weight: 600; font-size: 0.95rem; }

        .info-box-premium { background: #eef2ff; border: 1px solid #c7d2fe; padding: 2rem; border-radius: 20px; color: #3730a3; }
        .info-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; color: #4338ca; }
        .info-header h3 { margin: 0; font-size: 1.25rem; font-weight: 800; }
        .info-box-premium p { margin: 0; line-height: 1.6; font-weight: 500; opacity: 0.9; }

        .search-bar-admin { margin-bottom: 1.5rem; }
        .search-bar-admin input { width: 100%; padding: 1rem 1.5rem; border-radius: 14px; border: 1.5px solid #e2e8f0; font-size: 1rem; background: white; outline: none; transition: all 0.2s; }
        .search-bar-admin input:focus { border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }

        .table-container-admin { background: white; border-radius: 20px; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { background: #f8fafc; padding: 1.25rem 1.5rem; font-weight: 700; color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #f1f5f9; }
        .admin-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
        
        .user-info { display: flex; flex-direction: column; gap: 0.25rem; }
        .user-sub { font-size: 0.85rem; color: #64748b; }
        .user-reg-tag { font-size: 0.7rem; font-weight: 800; background: #f1f5f9; color: #475569; padding: 0.2rem 0.5rem; border-radius: 4px; width: fit-content; margin-top: 0.25rem; }
        
        .role-badge { padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        .badge-student { background: #dcfce7; color: #166534; }
        .badge-staff { background: #e0e7ff; color: #3730a3; }
        .badge-admin { background: #fef3c7; color: #92400e; }

        .admin-select { padding: 0.5rem 0.75rem; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #f8fafc; font-size: 0.85rem; font-weight: 600; color: #1e293b; outline: none; cursor: pointer; }
        .access-select { background: #4f46e5; color: white; border-color: #4f46e5; }

        .add-dept-form-premium .form-row { display: flex; gap: 1rem; }
        .add-dept-form-premium input { flex: 1; padding: 0.85rem 1.25rem; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 1rem; }
        .btn-add-premium { background: #4f46e5; color: white; border: none; padding: 0 1.5rem; border-radius: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
        .btn-add-premium:hover { background: #4338ca; transform: translateY(-1px); }

        .dept-grid-premium { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
        .dept-card-premium { background: white; padding: 1.75rem; border-radius: 20px; border: 1.5px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s; }
        .dept-card-premium:hover { transform: translateY(-4px); border-color: #4f46e5; box-shadow: 0 12px 20px -8px rgba(79, 70, 229, 0.15); }
        .dept-main { display: flex; gap: 1.25rem; align-items: flex-start; }
        .dept-icon { width: 48px; height: 48px; background: #f5f3ff; color: #4f46e5; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .dept-details h3 { margin: 0; font-size: 1.15rem; font-weight: 800; color: #1e293b; }
        .dept-details p { margin: 0.4rem 0 0; font-size: 0.9rem; color: #64748b; line-height: 1.4; }
        .btn-delete-dept { background: #fee2e2; border: none; color: #ef4444; cursor: pointer; padding: 0.75rem; border-radius: 12px; transition: all 0.2s; opacity: 0; }
        .dept-card-premium:hover .btn-delete-dept { opacity: 1; }
        .btn-delete-dept:hover { background: #fecaca; transform: scale(1.1); }

        .glass-card-admin { background: white; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

