import { motion } from 'framer-motion';
import { PublicLayout } from '../components/PublicLayout';
import { UserPlus, ClipboardCheck, DownloadCloud, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function HowItWorks() {
  return (
    <PublicLayout>
        <section className="w-full py-32 bg-background">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center text-center space-y-4 mb-20">
                    <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 text-xs font-bold uppercase tracking-widest">The Process</Badge>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-tight">Three simple steps to your official clearance.</h1>
                    <p className="text-muted-foreground text-xl max-w-2xl">We've removed the complexity. No more queues, no more paper forms, no more frustration.</p>
                </div>

                <div className="grid gap-12 max-w-5xl mx-auto">
                    {[
                        { icon: UserPlus, title: "Create Your Profile", desc: "Sign up with your university email and verify your student registration details. This creates your digital identity within the clearance ecosystem." },
                        { icon: ClipboardCheck, title: "Submit Request", desc: "Initiate your clearance request. Our intelligent routing system automatically notifies all relevant departments simultaneously." },
                        { icon: DownloadCloud, title: "Download Certificate", desc: "Once all departments have reviewed and approved your submission, your certified digital clearance letter is generated instantly." }
                    ].map((step, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15 }}
                            className="flex flex-col md:flex-row gap-8 p-10 rounded-[3rem] bg-slate-50 dark:bg-slate-900 border border-border group hover:bg-white dark:hover:bg-card transition-all duration-500 shadow-xl"
                        >
                            <div className="h-24 w-24 rounded-3xl bg-primary text-white shadow-2xl flex items-center justify-center shrink-0 border border-white/20">
                                <step.icon className="h-12 w-12" />
                            </div>
                            <div className="space-y-4">
                                <span className="text-primary font-black text-sm uppercase tracking-widest block">Phase 0{i+1}</span>
                                <h4 className="text-3xl font-black">{step.title}</h4>
                                <p className="text-muted-foreground text-xl leading-relaxed font-medium">{step.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <Button size="lg" className="h-16 px-10 text-lg font-black rounded-2xl gap-3 shadow-2xl">
                        Start Now <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </section>
    </PublicLayout>
  );
}

function Badge({ children, className }: any) {
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>{children}</span>
}
