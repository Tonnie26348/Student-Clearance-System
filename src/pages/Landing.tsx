import { useNavigate } from 'react-router-dom';
import { Button } from 'src/components/ui/button';
import { CheckCircle2, Zap, ArrowRight, LayoutDashboard, DownloadCloud, ChevronRight, MessageSquare, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { PublicLayout } from '../components/PublicLayout';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <PublicLayout>
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
                  <Button size="lg" variant="outline" onClick={() => navigate('/features')} className="h-16 px-10 text-lg font-bold rounded-[2rem] bg-white/50 dark:bg-card/50 backdrop-blur-sm border-2 hover:bg-white dark:hover:bg-card transition-all">
                    View Features
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
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-blue-400/20 rounded-[3.5rem] blur-2xl -z-10 group-hover:blur-3xl transition-all"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Short Feature Preview */}
        <section className="w-full py-32 bg-slate-50 dark:bg-slate-900/50">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-16">Built for the Modern University.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: LayoutDashboard, title: "Live Tracking", desc: "Real-time updates as departments approve." },
                    { icon: DownloadCloud, title: "Instant Docs", desc: "Digital certificates ready in seconds." },
                    { icon: Zap, title: "Automated", desc: "Zero queues, zero paper, zero hassle." }
                ].map((f, i) => (
                    <div key={i} className="p-10 rounded-[2.5rem] bg-background shadow-lg border border-border">
                        <f.icon className="h-12 w-12 text-primary mx-auto mb-6" />
                        <h3 className="text-2xl font-black mb-4">{f.title}</h3>
                        <p className="text-muted-foreground font-medium">{f.desc}</p>
                    </div>
                ))}
            </div>
            <Button variant="link" onClick={() => navigate('/features')} className="mt-12 text-primary font-black text-lg group">
                Explore all features <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </section>

        {/* Testimonials (kept on home for social proof) */}
        <section className="w-full py-32 bg-background overflow-hidden relative border-y">
            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="text-center space-y-4 mb-20">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight">Loved by Students & Staff</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { name: "Sarah J.", role: "Recent Graduate", text: "ClearanceHub saved me weeks of running around offices. I got my certificate in 3 days!", rating: 5 },
                        { name: "Dr. Robert M.", role: "Registrar", text: "The automation has reduced our manual workload by 80%. It's a game changer.", rating: 5 },
                        { name: "Kevin W.", role: "Senior Student", text: "The mobile interface is so slick. I could track status right from my phone.", rating: 5 }
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
              <div className="flex flex-col sm:flex-row gap-5">
                <Button size="lg" variant="secondary" onClick={() => navigate('/signup')} className="h-20 px-12 text-xl font-black rounded-[2.5rem] bg-white text-primary hover:bg-white/90 shadow-2xl transition-all active:scale-95">
                    Create Free Account
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/how-it-works')} className="h-20 px-12 text-xl font-bold rounded-[2.5rem] border-2 border-white/20 text-white hover:bg-white/10 transition-all">
                    See How it Works
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px]"></div>
        </section>
      </main>
    </PublicLayout>
  );
}
