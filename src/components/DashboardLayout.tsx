import { type ReactNode } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings as SettingsIcon,
  User,
  FileText,
  GraduationCap,
  ChevronRight
} from "lucide-react"

import { Button } from "src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "src/components/ui/sheet"
import { useAuth } from "src/lib/AuthContext"
import { useProfile } from "src/lib/useProfile"
import { cn } from "src/lib/utils"
import { NotificationPanel } from "./NotificationPanel"
import { ThemeToggle } from "./ThemeToggle"

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, loading: profileLoading } = useProfile();
  const { signOut, user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isGlobalLoading = authLoading || profileLoading;

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, label, onClick }: { to: string, icon: any, label: string, onClick?: () => void }) => (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 group",
        isActive(to) 
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-medium" 
          : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
      )}
    >
      <Icon className={cn("h-4.5 w-4.5 transition-colors", isActive(to) ? "text-primary-foreground" : "group-hover:text-primary")} />
      <span className="flex-1">{label}</span>
      {isActive(to) && <ChevronRight className="h-4 w-4 opacity-70" />}
    </Link>
  );

  const getHomePath = () => {
    if (profile?.role === 'admin') return '/admin';
    if (profile?.role === 'staff') return '/staff';
    return '/student';
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {isGlobalLoading && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-[100]">
          <div className="h-full bg-primary animate-[loading_2s_infinite]" style={{ width: '30%' }}></div>
        </div>
      )}
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>

      {/* Desktop Sidebar */}
      <aside className="hidden border-r bg-card md:block w-64 lg:w-72 sticky top-0 h-screen overflow-y-auto shrink-0">
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-16 items-center border-b px-6">
            <Link to={getHomePath()} className="flex items-center gap-2.5 font-bold text-primary group">
              <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl tracking-tight">ClearanceHub</span>
            </Link>
          </div>
          <div className="flex-1 px-4 py-6">
            <nav className="grid items-start gap-1.5 text-sm font-medium">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-3 mb-2">Main Menu</p>
              <NavLink to="/student" icon={Home} label="Dashboard" />
              
              {profile?.role === 'staff' && (
                <NavLink to="/staff" icon={LayoutDashboard} label="Staff Portal" />
              )}
              
              {profile?.role === 'admin' && (
                <NavLink to="/admin" icon={SettingsIcon} label="Admin Control" />
              )}

              <div className="my-4 border-t border-border/50" />
              
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-3 mb-2">Account</p>
              <NavLink to="/profile" icon={User} label="My Profile" />
              <NavLink to="/requests" icon={FileText} label="My Requests" />
              <NavLink to="/settings" icon={SettingsIcon} label="Settings" />
            </nav>
          </div>
          <div className="mt-auto p-4 m-4 rounded-xl bg-muted/50 border border-border/50">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
                    {user?.email?.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-xs overflow-hidden">
                    <p className="font-bold truncate text-foreground">{user?.email?.split('@')[0]}</p>
                    <p className="text-muted-foreground capitalize font-medium">{profile?.role}</p>
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 lg:px-8 sticky top-0 z-40">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 md:hidden hover:bg-muted"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-[280px] p-0">
              <div className="p-6 border-b">
                <Link to={getHomePath()} className="flex items-center gap-2.5 font-bold text-primary">
                  <div className="bg-primary/10 p-1.5 rounded-lg">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <span className="text-xl tracking-tight font-bold">ClearanceHub</span>
                </Link>
              </div>
              <nav className="flex-1 px-4 py-6 gap-1.5 flex flex-col overflow-y-auto">
                <NavLink to="/student" icon={Home} label="Dashboard" />
                 {profile?.role === 'staff' && (
                  <NavLink to="/staff" icon={LayoutDashboard} label="Staff Portal" />
                )}
                {profile?.role === 'admin' && (
                  <NavLink to="/admin" icon={SettingsIcon} label="Admin Control" />
                )}
                 <div className="my-4 border-t border-border/50" />
                 <NavLink to="/profile" icon={User} label="Profile" />
                 <NavLink to="/requests" icon={FileText} label="Requests" />
                 <NavLink to="/settings" icon={SettingsIcon} label="Settings" />
              </nav>
              <div className="p-4 border-t mt-auto">
                <Button variant="destructive" className="w-full justify-start gap-3" onClick={signOut}>
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="w-full flex-1">
            {/* Breadcrumb or Search could go here */}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <NotificationPanel />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-primary/20 p-0 overflow-hidden">
                  <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {user?.email?.substring(0, 2).toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 p-2">
                <DropdownMenuLabel className="font-normal p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{profile?.full_name || 'My Account'}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer gap-2 rounded-md py-2" onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 rounded-md py-2" onClick={() => navigate('/settings')}>
                  <SettingsIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer gap-2 rounded-md py-2 text-red-600 focus:text-red-600 focus:bg-red-50" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
