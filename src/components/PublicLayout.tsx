import { useNavigate, Link } from 'react-router-dom';
import { Button } from './ui/button';
import { GraduationCap, ArrowRight, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';
import { type ReactNode } from 'react';

interface PublicLayoutProps {
    children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      {/* Navigation - Fixed/Sticky Header */}
      <header className="px-6 lg:px-20 h-20 flex items-center border-b bg-background/80 backdrop-blur-xl fixed top-0 left-0 right-0 z-[100] transition-all">
        <Link to="/" className="flex items-center gap-2.5 font-black text-2xl text-primary tracking-tight group cursor-pointer">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <GraduationCap className="h-7 w-7" />
          </div>
          <span>ClearanceHub</span>
        </Link>
        <nav className="ml-auto hidden md:flex gap-8 items-center mr-10">
          <Link to="/features" className="text-sm font-bold hover:text-primary transition-colors">Features</Link>
          <Link to="/how-it-works" className="text-sm font-bold hover:text-primary transition-colors">How it Works</Link>
          <Link to="/faq" className="text-sm font-bold hover:text-primary transition-colors">FAQ</Link>
        </nav>
        <nav className="flex gap-4 sm:gap-6 items-center">
          <Button variant="ghost" className="font-bold hidden sm:flex hover:text-primary transition-colors" onClick={() => navigate('/login')}>Login</Button>
          <Button className="rounded-2xl px-8 h-12 font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95 transition-all" onClick={() => navigate('/signup')}>Get Started</Button>
        </nav>
      </header>

      <main className="flex-1 pt-20">
        {children}
      </main>

      {/* Modern Footer */}
      <footer className="w-full py-24 bg-slate-950 text-slate-400 border-t border-slate-900">
        <div className="container px-4 md:px-10 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                <div className="space-y-6">
                    <div className="flex items-center gap-2.5 font-black text-3xl text-white tracking-tight">
                        <div className="bg-primary p-2 rounded-xl">
                            <GraduationCap className="h-8 w-8" />
                        </div>
                        <span>ClearanceHub</span>
                    </div>
                    <p className="text-lg leading-relaxed max-w-xs">
                        The definitive solution for modern university logistics and student clearance workflows.
                    </p>
                    <div className="flex gap-4">
                        {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                            <a key={i} href="#" className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                                <Icon className="h-5 w-5" />
                            </a>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h5 className="text-white font-black text-xl">Platform</h5>
                    <nav className="flex flex-col gap-4 text-lg font-medium">
                        <Link to="/how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
                        <Link to="/features" className="hover:text-primary transition-colors">Features</Link>
                        <a href="#" className="hover:text-primary transition-colors">Security</a>
                        <a href="#" className="hover:text-primary transition-colors">Case Studies</a>
                    </nav>
                </div>

                <div className="space-y-6">
                    <h5 className="text-white font-black text-xl">Resources</h5>
                    <nav className="flex flex-col gap-4 text-lg font-medium">
                        <Link to="/faq" className="hover:text-primary transition-colors">Help Center</Link>
                        <a href="#" className="hover:text-primary transition-colors">Official Docs</a>
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                    </nav>
                </div>

                <div className="space-y-6">
                    <h5 className="text-white font-black text-xl">Stay Updated</h5>
                    <p className="text-lg font-medium">Get the latest news about university logistics.</p>
                    <div className="flex gap-2 text-slate-950">
                        <input placeholder="Enter email" className="bg-slate-900 border-slate-800 h-14 rounded-xl px-4 text-white w-full focus:outline-none focus:ring-1 focus:ring-primary/50" />
                        <Button className="h-14 w-14 rounded-xl shrink-0">
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="pt-10 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-sm font-bold">
                    © 2026 ClearanceHub. All rights reserved. Made with ❤️ for Universities.
                </p>
                <div className="flex items-center gap-8 text-sm font-bold">
                    <a href="#" className="hover:text-white transition-colors">Cookies</a>
                    <a href="#" className="hover:text-white transition-colors">Accessibility</a>
                    <a href="#" className="hover:text-white transition-colors">System Status</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
