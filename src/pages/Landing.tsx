import { useNavigate } from 'react-router-dom';
import { Button } from 'src/components/ui/button';
import { GraduationCap, CheckCircle2, ShieldCheck, Zap, ArrowRight, LayoutDashboard, UserPlus, ClipboardCheck, DownloadCloud, ChevronRight, MessageSquare, Star, HelpCircle, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <header className="px-6 lg:px-20 h-20 flex items-center border-b bg-background/60 backdrop-blur-xl sticky top-0 z-50 transition-all">
        <div className="flex items-center gap-2.5 font-black text-2xl text-primary tracking-tight group cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <GraduationCap className="h-7 w-7" />
          </div>
          <span>ClearanceHub</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-10 items-center">
          <Button variant="ghost" className="font-bold hidden md:flex hover:text-primary transition-colors" onClick={() => navigate('/login')}>Login</Button>
          <Button className="rounded-2xl px-8 h-12 font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95 transition-all" onClick={() => navigate('/signup')}>Get Started</Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full pt-24 pb-32 md:pt-40 md:pb-56 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-from),transparent_60%)] from-primary/20 via-transparent to-transparent"></div>
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse"></div>
          
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex-1 space-y-8 text-center lg:text-left"
              >
                <h1 className="text-5xl font-black tracking-tighter sm:text-7xl md:text-8xl/none text-balance leading-[0.9]">
                  Digital Student <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-indigo-600 tracking-tight">Clearance System.</span>
                </h1>
                <p className="mx-auto lg:mx-0 max-w-[600px] text-muted-foreground md:text-2xl font-medium leading-relaxed">
                  Streamline your university exit process with our automated, secure, and paperless clearance platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4">
                  <Button size="lg" onClick={() => navigate('/signup')} className="h-16 px-10 text-lg font-black rounded-[2rem] gap-3 shadow-2xl shadow-primary/30 group bg-primary hover:bg-primary/90 transition-all">
                    Start Your Clearance <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="h-16 px-10 text-lg font-bold rounded-[2rem] bg-white/50 dark:bg-card/50 backdrop-blur-sm border-2 hover:bg-white dark:hover:bg-card transition-all">
                    Explore Portal
                  </Button>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="flex-1 relative w-full max-w-[600px] lg:max-w-none group"
              >
                <div className="relative z-10 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-2 rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-700">
                    <div className="bg-white dark:bg-card rounded-[2.5rem] overflow-hidden border shadow-inner">
                        <img 
                            src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1200&h=800" 
                            alt="Dashboard Preview" 
                            className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                        {/* Overlay elements */}
                        <div className="absolute top-10 right-10 bg-primary p-4 rounded-2xl text-white shadow-xl animate-float">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <div className="absolute bottom-10 left-10 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl border border-white/20 animate-float-delayed">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                    <Zap className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase">Clearance Speed</p>
                                    <p className="text-xl font-black">94% Faster</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Decorative background shadow */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-blue-400/20 rounded-[3.5rem] blur-2xl -z-10 group-hover:blur-3xl transition-all"></div>
              </motion.div>
            </div>
          </div>
        </section>


        {/* Clearance at a Glance - Bento Grid */}
        <section className="w-full py-32 bg-background relative overflow-hidden">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center text-center space-y-4 mb-20">
              <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 text-xs font-bold uppercase tracking-widest">Everything you need</Badge>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-balance">Modern Clearance for Modern Universities</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 h-auto">
              {/* Main Bento Card */}
              <motion.div 
                whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true }}
                className="md:col-span-4 lg:col-span-3 bg-primary rounded-[3rem] p-10 flex flex-col justify-between text-primary-foreground relative overflow-hidden shadow-2xl group min-h-[400px]"
              >
                <div className="relative z-10">
                    <Zap className="h-12 w-12 mb-6" />
                    <h3 className="text-4xl font-black mb-4">Instant Processing</h3>
                    <p className="text-primary-foreground/80 text-xl font-medium max-w-md leading-relaxed">Our automated engine routes your requests to the right departments in milliseconds, not weeks.</p>
                </div>
                <div className="mt-12 p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 transform group-hover:translate-y-[-10px] transition-transform duration-500">
                    <div className="flex justify-between items-center">
                        <span className="font-bold">Average Clearance Time</span>
                        <span className="text-2xl font-black">2.4 Days</span>
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              </motion.div>

              {/* Status Tracking */}
              <motion.div 
                whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="md:col-span-2 lg:col-span-3 bg-slate-100 dark:bg-slate-900 rounded-[3rem] p-10 flex flex-col justify-center border border-border group hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors duration-500 min-h-[400px]"
              >
                <LayoutDashboard className="h-12 w-12 text-primary mb-6" />
                <h3 className="text-3xl font-black mb-4">Live Tracking</h3>
                <p className="text-muted-foreground text-lg font-medium leading-relaxed">Know exactly where you stand. Real-time updates as departments approve your request.</p>
              </motion.div>

              {/* Secure Card */}
              <motion.div 
                whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                className="md:col-span-2 lg:col-span-2 bg-indigo-50 dark:bg-indigo-900/10 rounded-[3rem] p-8 flex flex-col justify-between border border-indigo-100 dark:border-indigo-900/30 group shadow-lg min-h-[300px]"
              >
                <ShieldCheck className="h-10 w-10 text-indigo-600 mb-4" />
                <div>
                    <h3 className="text-2xl font-black mb-2">Zero-Leak Security</h3>
                    <p className="text-muted-foreground font-medium leading-relaxed">Military-grade encryption protecting every student document.</p>
                </div>
              </motion.div>

              {/* Digital Certificate */}
              <motion.div 
                whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                className="md:col-span-2 lg:col-span-2 bg-green-50 dark:bg-green-900/10 rounded-[3rem] p-8 flex flex-col justify-between border border-green-100 dark:border-green-900/30 group shadow-lg min-h-[300px]"
              >
                <DownloadCloud className="h-10 w-10 text-green-600 mb-4" />
                <div>
                    <h3 className="text-2xl font-black mb-2">Verified Docs</h3>
                    <p className="text-muted-foreground font-medium leading-relaxed">Instant PDF generation with verifiable blockchain-ready stamps.</p>
                </div>
              </motion.div>

              {/* Mobile Ready */}
              <motion.div 
                whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
                className="md:col-span-2 lg:col-span-2 bg-orange-50 dark:bg-orange-900/10 rounded-[3rem] p-8 flex flex-col justify-between border border-orange-100 dark:border-orange-900/30 group shadow-lg min-h-[300px]"
              >
                <Zap className="h-10 w-10 text-orange-600 mb-4" />
                <div>
                    <h3 className="text-2xl font-black mb-2">Mobile First</h3>
                    <p className="text-muted-foreground font-medium leading-relaxed">Clear from your couch. Fully responsive for iOS and Android.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How it Works - Stepper */}
        <section className="w-full py-32 bg-slate-50 dark:bg-slate-900/50">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
                    <div className="flex-1 space-y-8">
                        <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 text-xs font-bold uppercase tracking-widest">The Process</Badge>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">Three steps to your official clearance.</h2>
                        <p className="text-muted-foreground text-xl font-medium leading-relaxed">We've removed the complexity. No more queues, no more paper forms, no more frustration.</p>
                        <Button variant="link" className="text-primary font-black text-lg p-0 h-auto group">
                            Read detailed guide <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>

                    <div className="flex-1 space-y-12 w-full">
                        {[
                            { icon: UserPlus, title: "Create Your Profile", desc: "Sign up with your university email and verify your student registration details." },
                            { icon: ClipboardCheck, title: "Submit Request", desc: "Initiate your clearance. Our system automatically routes it to all necessary departments." },
                            { icon: DownloadCloud, title: "Download Certificate", desc: "Once all departments approve, download your certified digital clearance letter instantly." }
                        ].map((step, i) => (
                            <motion.div 
                                key={i}
                                whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: 50 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                                className="flex gap-8 group"
                            >
                                <div className="h-20 w-20 rounded-3xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center shrink-0 border border-white/20 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    <step.icon className="h-10 w-10" />
                                </div>
                                <div>
                                    <span className="text-primary font-black text-sm uppercase tracking-widest mb-2 block">Step 0{i+1}</span>
                                    <h4 className="text-2xl font-black mb-3">{step.title}</h4>
                                    <p className="text-muted-foreground text-lg leading-relaxed font-medium">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-32 bg-background overflow-hidden relative">
            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="text-center space-y-4 mb-20">
                    <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 text-xs font-bold uppercase tracking-widest">Community Feedback</Badge>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight">Loved by Students & Staff</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { name: "Sarah J.", role: "Recent Graduate", text: "ClearanceHub saved me weeks of running around offices. I got my certificate in 3 days!", rating: 5 },
                        { name: "Dr. Robert M.", role: "Registrar", text: "The automation has reduced our manual workload by 80%. It's a game changer for university administration.", rating: 5 },
                        { name: "Kevin W.", role: "Senior Student", text: "The mobile interface is so slick. I could track my approval status right from my phone during lectures.", rating: 5 }
                    ].map((t, i) => (
                        <motion.div 
                            key={i}
                            whileInView={{ opacity: 1, scale: 1 }} initial={{ opacity: 0, scale: 0.9 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                            className="bg-slate-50 dark:bg-slate-900 p-10 rounded-[3rem] space-y-6 relative border border-border group hover:bg-white dark:hover:bg-card transition-all duration-500 shadow-lg hover:shadow-2xl"
                        >
                            <div className="flex gap-1">
                                {[...Array(t.rating)].map((_, j) => <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
                            </div>
                            <p className="text-xl font-medium italic text-muted-foreground leading-relaxed">"{t.text}"</p>
                            <div className="flex items-center gap-4 pt-4">
                                <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary text-xl shadow-inner">
                                    {t.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-black text-lg">{t.name}</p>
                                    <p className="text-sm font-bold text-muted-foreground uppercase">{t.role}</p>
                                </div>
                            </div>
                            <MessageSquare className="absolute bottom-8 right-8 h-12 w-12 text-primary/5 group-hover:text-primary/10 transition-colors" />
                        </motion.div>
                    ))}
                </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 translate-x-1/4 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[120px]"></div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-32 bg-slate-50 dark:bg-slate-900/50">
            <div className="container px-4 md:px-6 mx-auto max-w-4xl">
                <div className="text-center space-y-4 mb-20">
                    <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 text-xs font-bold uppercase tracking-widest">Common Questions</Badge>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight">Got Questions? We have answers.</h2>
                </div>

                <div className="space-y-6">
                    {[
                        { q: "How long does the clearance process take?", a: "Most students complete their clearance within 2-5 business days, depending on how quickly departmental staff review your requests." },
                        { q: "What if a department rejects my clearance?", a: "You will receive a notification with the reason for rejection. You can then address the issue (e.g., return a book) and the department will re-clear you." },
                        { q: "Is my data secure?", a: "Absolutely. We use industry-standard encryption and Supabase's secure authentication to ensure your personal and academic data is always protected." },
                        { q: "Can I use the system on my phone?", a: "Yes, ClearanceHub is fully responsive and works perfectly on all mobile browsers." }
                    ].map((item, i) => (
                        <motion.div 
                            key={i}
                            whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 10 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                            className="bg-background rounded-3xl p-8 shadow-md border border-border group cursor-pointer hover:shadow-xl transition-all"
                        >
                            <div className="flex justify-between items-center gap-4">
                                <h4 className="text-xl font-black flex items-center gap-4">
                                    <HelpCircle className="h-6 w-6 text-primary shrink-0" />
                                    {item.q}
                                </h4>
                                <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </div>
                            <p className="mt-4 text-muted-foreground font-medium leading-relaxed max-w-3xl hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-300">
                                {item.a}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-40 bg-primary relative overflow-hidden">
          <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
            <div className="flex flex-col items-center justify-center space-y-10">
              <motion.h2 
                whileInView={{ scale: 1, opacity: 1 }} initial={{ scale: 0.9, opacity: 0 }} viewport={{ once: true }}
                className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-tight max-w-5xl"
              >
                Start Your Journey <br /> to Graduation Today.
              </motion.h2>
              <motion.p 
                whileInView={{ opacity: 1 }} initial={{ opacity: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                className="mx-auto max-w-[700px] text-white/70 text-2xl font-medium leading-relaxed"
              >
                Join thousands of students who have simplified their university exit process. No queues, no hassle.
              </motion.p>
              <motion.div 
                whileInView={{ y: 0, opacity: 1 }} initial={{ y: 20, opacity: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-5"
              >
                <Button size="lg" variant="secondary" onClick={() => navigate('/signup')} className="h-20 px-12 text-xl font-black rounded-[2.5rem] bg-white text-primary hover:bg-white/90 shadow-2xl transition-all active:scale-95">
                    Create Free Account
                </Button>
                <Button size="lg" variant="outline" className="h-20 px-12 text-xl font-bold rounded-[2.5rem] border-2 border-white/20 text-white hover:bg-white/10 transition-all">
                    Contact Support
                </Button>
              </motion.div>
            </div>
          </div>
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px]"></div>
        </section>
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
                        <a href="#" className="hover:text-primary transition-colors">How it Works</a>
                        <a href="#" className="hover:text-primary transition-colors">Features</a>
                        <a href="#" className="hover:text-primary transition-colors">Security</a>
                        <a href="#" className="hover:text-primary transition-colors">Case Studies</a>
                    </nav>
                </div>

                <div className="space-y-6">
                    <h5 className="text-white font-black text-xl">Resources</h5>
                    <nav className="flex flex-col gap-4 text-lg font-medium">
                        <a href="#" className="hover:text-primary transition-colors">Help Center</a>
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

function Badge({ children, className }: any) {
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>{children}</span>
}
