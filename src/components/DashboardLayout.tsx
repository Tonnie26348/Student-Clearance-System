import { type ReactNode } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  CircleUser,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings as SettingsIcon,
  User,
  FileText,
  GraduationCap
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

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile } = useProfile();
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
        isActive(to) 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-muted-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );

  const getHomePath = () => {
    if (profile?.role === 'admin') return '/admin';
    if (profile?.role === 'staff') return '/staff';
    return '/student';
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-background md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to={getHomePath()} className="flex items-center gap-2 font-semibold text-primary">
              <GraduationCap className="h-6 w-6" />
              <span className="text-lg tracking-tight">ClearanceHub</span>
            </Link>
            <div className="ml-auto">
                <NotificationPanel />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
              <NavLink to="/student" icon={Home} label="Dashboard" />
              
              {profile?.role === 'staff' && (
                <NavLink to="/staff" icon={LayoutDashboard} label="Staff Portal" />
              )}
              
              {profile?.role === 'admin' && (
                <NavLink to="/admin" icon={SettingsIcon} label="Admin Control" />
              )}

              <div className="my-2 border-t border-border/50" />
              
              <NavLink to="/profile" icon={User} label="My Profile" />
              <NavLink to="/requests" icon={FileText} label="My Requests" />
              <NavLink to="/settings" icon={SettingsIcon} label="Settings" />
            </nav>
          </div>
          <div className="mt-auto p-4 border-t">
             <div className="flex items-center gap-3 px-2 py-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {user?.email?.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-xs overflow-hidden">
                    <p className="font-medium truncate max-w-[140px]">{user?.email}</p>
                    <p className="text-muted-foreground capitalize">{profile?.role}</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-[280px] sm:w-[300px]">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  to={getHomePath()}
                  className="flex items-center gap-2 text-lg font-semibold text-primary mb-4"
                >
                  <GraduationCap className="h-6 w-6" />
                  <span>ClearanceHub</span>
                </Link>
                <NavLink to="/student" icon={Home} label="Dashboard" />
                 {profile?.role === 'staff' && (
                  <NavLink to="/staff" icon={LayoutDashboard} label="Staff Portal" />
                )}
                {profile?.role === 'admin' && (
                  <NavLink to="/admin" icon={SettingsIcon} label="Admin Control" />
                )}
                 <NavLink to="/profile" icon={User} label="Profile" />
                 <NavLink to="/requests" icon={FileText} label="Requests" />
                 <NavLink to="/settings" icon={SettingsIcon} label="Settings" />
              </nav>
            </SheetContent>
          </Sheet>
          
          <div className="w-full flex-1">
          </div>

          <div className="md:hidden">
            <NotificationPanel />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  )
}

