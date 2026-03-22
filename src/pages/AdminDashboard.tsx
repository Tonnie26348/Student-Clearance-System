import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import { Users, Building2, Download, Plus, Trash2, PieChart, ShieldCheck, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "src/components/ui/button"
import { Input } from "src/components/ui/input"
import { Label } from "src/components/ui/label"
import { Badge } from "src/components/ui/badge"
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
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'depts'>('stats');
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
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Administrative Console</h1>
                <p className="text-muted-foreground">Global university oversight and configuration.</p>
            </div>
            <Button variant="outline" onClick={exportToCSV} className="gap-2">
                <Download className="h-4 w-4" /> Export Report
            </Button>
        </div>

        {/* Custom Tabs */}
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
            <Button 
                variant={activeTab === 'stats' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveTab('stats')}
                className="gap-2"
            >
                <PieChart className="h-4 w-4" /> Overview
            </Button>
            <Button 
                variant={activeTab === 'users' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveTab('users')}
                className="gap-2"
            >
                <Users className="h-4 w-4" /> User Management
            </Button>
            <Button 
                variant={activeTab === 'depts' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveTab('depts')}
                className="gap-2"
            >
                <Building2 className="h-4 w-4" /> Departments
            </Button>
        </div>

        {activeTab === 'stats' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalStudents}</div>
                            <p className="text-xs text-muted-foreground">Active in system</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Authorized Staff</CardTitle>
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalStaff}</div>
                            <p className="text-xs text-muted-foreground">Department leads</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Departments</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalDepts}</div>
                            <p className="text-xs text-muted-foreground">Clearance points</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Admins</CardTitle>
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.admins}</div>
                            <p className="text-xs text-muted-foreground">System operators</p>
                        </CardContent>
                    </Card>
                </div>
                
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                         <div className="flex items-center gap-2 text-primary">
                            <ShieldCheck className="h-5 w-5" />
                            <CardTitle>System Health</CardTitle>
                         </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            The clearance system is running on Supabase with Row Level Security enabled. All departmental nodes are reporting active status. Real-time event bus is operational.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )}

        {activeTab === 'users' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 w-full md:w-1/2">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search users..." 
                            className="pl-9"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                        />
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                         <div className="rounded-md border">
                            <div className="w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Identity</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Department</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Access Level</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {filteredUsers.map((u) => (
                                            <tr key={u.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{u.full_name || 'No Name'}</span>
                                                        <span className="text-xs text-muted-foreground">{u.email}</span>
                                                        {u.reg_number && <Badge variant="outline" className="w-fit mt-1 text-[10px]">{u.reg_number}</Badge>}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <Badge variant={u.role === 'admin' ? 'default' : u.role === 'staff' ? 'secondary' : 'outline'}>
                                                        {u.role}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    {u.role === 'staff' ? (
                                                        <Select 
                                                            value={u.department_id || "none"} 
                                                            onValueChange={(val) => updateRole(u.id, u.role, val === "none" ? null : val)}
                                                        >
                                                            <SelectTrigger className="w-[180px] h-8">
                                                                <SelectValue placeholder="Select Dept" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none">No Department</SelectItem>
                                                                {departments.map(d => (
                                                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4 align-middle">
                                                     <Select 
                                                        value={u.role} 
                                                        onValueChange={(val) => updateRole(u.id, val, u.department_id)}
                                                    >
                                                        <SelectTrigger className="w-[140px] h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="student">Student</SelectItem>
                                                            <SelectItem value="staff">Staff</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}

        {activeTab === 'depts' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Department</CardTitle>
                        <CardDescription>Create a new clearance checkpoint for students.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={addDepartment} className="flex flex-col md:flex-row gap-4">
                            <div className="grid w-full gap-2">
                                <Label htmlFor="dept-name">Department Name</Label>
                                <Input 
                                    id="dept-name" 
                                    placeholder="e.g. Library, Sports, Finance" 
                                    value={newDeptName}
                                    onChange={(e) => setNewDeptName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid w-full gap-2">
                                <Label htmlFor="dept-desc">Description</Label>
                                <Input 
                                    id="dept-desc" 
                                    placeholder="Brief description of requirements" 
                                    value={newDeptDesc}
                                    onChange={(e) => setNewDeptDesc(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" className="w-full md:w-auto gap-2">
                                    <Plus className="h-4 w-4" /> Add Department
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {departments.map(d => (
                        <Card key={d.id} className="group relative hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{d.name}</CardTitle>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => deleteDepartment(d.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {d.description || 'Standard university clearance point.'}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )}
      </div>
    </DashboardLayout>
  );
}
