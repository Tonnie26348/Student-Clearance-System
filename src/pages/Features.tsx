import { motion } from 'framer-motion';
import { PublicLayout } from '../components/PublicLayout';
import { Zap, LayoutDashboard, ShieldCheck, DownloadCloud } from 'lucide-react';

export default function Features() {
  return (
    <PublicLayout>
        <section className="w-full py-32 bg-background relative overflow-hidden">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center text-center space-y-4 mb-20">
              <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 text-xs font-bold uppercase tracking-widest">Platform Capabilities</Badge>
              <h1 className="text-4xl md:text-7xl font-black tracking-tight text-balance">Advanced Features for Seamless Clearance</h1>
              <p className="text-muted-foreground text-xl max-w-3xl">Explore the technology behind our automated clearance engine.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Instant Processing",
                  desc: "Our automated engine routes your requests to the right departments in milliseconds, not weeks.",
                  color: "bg-primary",
                  textColor: "text-white"
                },
                {
                  icon: LayoutDashboard,
                  title: "Live Tracking",
                  desc: "Know exactly where you stand. Real-time updates as departments approve your request.",
                  color: "bg-slate-100 dark:bg-slate-900",
                  textColor: "text-foreground"
                },
                {
                  icon: ShieldCheck,
                  title: "Zero-Leak Security",
                  desc: "Military-grade encryption protecting every student document using Supabase Row Level Security.",
                  color: "bg-indigo-50 dark:bg-indigo-900/10",
                  textColor: "text-foreground"
                },
                {
                  icon: DownloadCloud,
                  title: "Digital Certificates",
                  desc: "Instant PDF generation with verifiable stamps once all clearances are completed.",
                  color: "bg-green-50 dark:bg-green-900/10",
                  textColor: "text-foreground"
                }
              ].map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`${f.color} rounded-[3rem] p-12 flex flex-col justify-between border border-border group hover:shadow-2xl transition-all duration-500 min-h-[400px] shadow-xl`}
                >
                  <div>
                    <div className={`h-16 w-16 rounded-2xl ${f.textColor === 'text-white' ? 'bg-white/20' : 'bg-primary/10'} flex items-center justify-center mb-8`}>
                        <f.icon className={`h-8 w-8 ${f.textColor === 'text-white' ? 'text-white' : 'text-primary'}`} />
                    </div>
                    <h3 className={`text-4xl font-black mb-6 ${f.textColor}`}>{f.title}</h3>
                    <p className={`text-xl font-medium leading-relaxed ${f.textColor === 'text-white' ? 'text-white/80' : 'text-muted-foreground'}`}>{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
    </PublicLayout>
  );
}

function Badge({ children, className }: any) {
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>{children}</span>
}
