import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import { Users, Building2, Download, Plus, Trash2, PieChart, ShieldCheck, Search, Filter, MoreVertical, Settings } from 'lucide-react';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "src/components/ui/tabs"

import { useNavigate } from 'react-router-dom';
import { useProfile } from '../lib/useProfile';

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
  const { profile, loading: profileLoading } = useProfile();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profileLoading && (!profile || profile.role !== 'admin')) {
        if (profile?.role === 'student') navigate('/student');
        else if (profile?.role === 'staff') navigate('/staff');
        else if (!profile) navigate('/login');
    }
  }, [profile, profileLoading, navigate]);

  useEffect(() => {
    if (profile?.role === 'admin') {
        fetchData();
    } else if (!profileLoading) {
        setLoading(false);
    }
  }, [profile, profileLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const { data: depts } = await supabase.from('departments').select('*').order('name');
      
      if (profiles) setUsers(profiles as UserProfile[]);
      if (depts) setDepartments(depts as Department[]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
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
    link.setAttribute("download", `System_Users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const createDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName) return;
    
    try {
        const { error } = await supabase.from('departments').insert({ name: newDeptName, description: newDeptDesc });
        if (error) throw error;
        toast.success('Department created!');
        setNewDeptName('');
        setNewDeptDesc('');
        fetchData();
    } catch (err: any) {
        toast.error('Failed to create department: ' + err.message);
    }
  };

  const deleteDepartment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department? This may affect existing clearance records.')) return;
    try {
        const { error } = await supabase.from('departments').delete().eq('id', id);
        if (error) throw error;
        toast.success('Department deleted');
        fetchData();
    } catch (err) {
        toast.error('Could not delete department');
    }
  }

  const filteredUsers = users.filter(u => 
    (u.full_name && u.full_name.toLowerCase().includes(userSearch.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
    (u.reg_number && u.reg_number.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const stats = {
    students: users.filter(u => u.role === 'student').length,
    staff: users.filter(u => u.role === 'staff').length,
    depts: departments.length
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
                <p className="text-muted-foreground text-lg font-medium">Control center for users, departments, and system health.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" className="flex-1 md:flex-none gap-2 rounded-xl h-11" onClick={exportToCSV}>
                    <Download className="h-4 w-4" /> Export Data
                </Button>
                <Button className="flex-1 md:flex-none gap-2 rounded-xl h-11" onClick={fetchData}>
                    Refresh System
                </Button>
            </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-md bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total Students</CardTitle>
                    <Users className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black">{stats.students}</div>
                    <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
                </CardContent>
            </Card>
            <Card className="border-none shadow-md bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Active Staff</CardTitle>
                    <ShieldCheck className="h-5 w-5 text-indigo-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black">{stats.staff}</div>
                    <p className="text-xs text-muted-foreground mt-1">Managing {stats.depts} departments</p>
                </CardContent>
            </Card>
            <Card className="border-none shadow-md bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Departments</CardTitle>
                    <Building2 className="h-5 w-5 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black">{stats.depts}</div>
                    <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
                </CardContent>
            </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
            <TabsList className="bg-muted/50 p-1 mb-6 rounded-2xl h-14">
                <TabsTrigger value="users" className="rounded-xl px-6 font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all h-full gap-2">
                    <Users className="h-4 w-4" /> User Management
                </TabsTrigger>
                <TabsTrigger value="depts" className="rounded-xl px-6 font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all h-full gap-2">
                    <Building2 className="h-4 w-4" /> Departments
                </TabsTrigger>
                <TabsTrigger value="stats" className="rounded-xl px-6 font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all h-full gap-2">
                    <PieChart className="h-4 w-4" /> System Stats
                </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name, email or reg number..." 
                            className="pl-10 h-12 bg-card border-none shadow-sm rounded-xl focus-visible:ring-primary/20"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" className="rounded-xl h-12 px-4 text-muted-foreground hover:bg-card hover:text-primary transition-all">
                        <Filter className="h-4 w-4 mr-2" /> All Roles
                    </Button>
                </div>

                <div className="bg-white dark:bg-card rounded-3xl shadow-md border overflow-hidden">
                    {/* Mobile View: Cards */}
                    <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />)
                        ) : filteredUsers.map((u) => (
                            <div key={u.id} className="p-4 rounded-2xl border bg-muted/10 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                                        {u.full_name?.substring(0, 2).toUpperCase() || '??'}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-foreground truncate">{u.full_name || 'No Name'}</span>
                                        <span className="text-xs text-muted-foreground truncate">{u.email}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Identity</span>
                                        {u.role === 'student' ? (
                                            <Badge variant="outline" className="text-[10px] font-bold">
                                                {u.reg_number || 'No REG'}
                                            </Badge>
                                        ) : u.role === 'staff' ? (
                                            <span className="text-xs font-bold text-indigo-600">
                                                {departments.find(d => d.id === u.department_id)?.name || 'No Dept'}
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Master</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Role</span>
                                        <Badge variant={u.role === 'admin' ? 'default' : u.role === 'staff' ? 'secondary' : 'outline'} className="rounded-full px-2.5 font-bold">
                                            {u.role.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop View: Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 border-b">
                                <tr className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Identity</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-10 w-40 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-10 w-32 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-10 w-20 bg-muted rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-10 w-10 bg-muted rounded ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                                                    {u.full_name?.substring(0, 2).toUpperCase() || '??'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground truncate max-w-[150px]">{u.full_name || 'No Name'}</span>
                                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">{u.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {u.role === 'student' ? (
                                                    <Badge variant="outline" className="w-fit text-[10px] font-bold uppercase tracking-tight h-5">
                                                        {u.reg_number || 'No REG'}
                                                    </Badge>
                                                ) : u.role === 'staff' ? (
                                                    <span className="text-xs font-bold text-indigo-600">
                                                        {departments.find(d => d.id === u.department_id)?.name || 'No Dept'}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Master</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={u.role === 'admin' ? 'default' : u.role === 'staff' ? 'secondary' : 'outline'} className="rounded-full px-2.5 font-bold">
                                                {u.role.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="depts" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-1 border-none shadow-md h-fit sticky top-24">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5 text-primary" />
                                Add New Department
                            </CardTitle>
                            <CardDescription>Departments are the clearance points for students.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={createDepartment} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="dept-name" className="text-xs font-bold uppercase text-muted-foreground">Department Name</Label>
                                    <Input 
                                        id="dept-name" 
                                        placeholder="e.g. Finance Office" 
                                        className="bg-muted/30 border-none focus-visible:ring-primary/20 h-11"
                                        value={newDeptName}
                                        onChange={(e) => setNewDeptName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="dept-desc" className="text-xs font-bold uppercase text-muted-foreground">Description (Optional)</Label>
                                    <Input 
                                        id="dept-desc" 
                                        placeholder="Briefly describe what they clear" 
                                        className="bg-muted/30 border-none focus-visible:ring-primary/20 h-11"
                                        value={newDeptDesc}
                                        onChange={(e) => setNewDeptDesc(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" className="w-full font-bold h-11 shadow-lg shadow-primary/20 transition-transform active:scale-95">
                                    Create Department
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {departments.map((d) => (
                            <Card key={d.id} className="border-none shadow-md bg-card hover:shadow-lg transition-all group">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500 font-bold mb-2">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => deleteDepartment(d.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <CardTitle className="text-lg font-bold">{d.name}</CardTitle>
                                    <CardDescription className="line-clamp-2 italic">{d.description || 'No description provided.'}</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted/50 p-2 rounded-lg w-fit">
                                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                                        {users.filter(u => u.department_id === d.id).length} Staff Assigned
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
                <Card className="border-none shadow-md bg-card overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-6">
                        <CardTitle className="text-2xl font-black text-primary flex items-center gap-2">
                            <PieChart className="h-6 w-6" /> System Insights
                        </CardTitle>
                        <CardDescription className="text-primary-foreground/70 font-medium">Coming soon: Advanced analytics and data visualization for clearance trends.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-12 text-center">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="h-32 w-32 bg-muted rounded-full mx-auto flex items-center justify-center">
                                <Settings className="h-12 w-12 text-muted-foreground animate-spin-slow" />
                            </div>
                            <h3 className="text-xl font-bold">Analytics Engine Preparing</h3>
                            <p className="text-muted-foreground font-medium">We are currently aggregating historical data to provide you with meaningful insights into department efficiency and student throughput.</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Add a custom animation to your Tailwind config or just a quick CSS animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}
`;
document.head.appendChild(style);
