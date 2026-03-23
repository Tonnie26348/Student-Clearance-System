import { motion } from 'framer-motion';
import { PublicLayout } from '../components/PublicLayout';
import { HelpCircle, ChevronRight } from 'lucide-react';

export default function FAQ() {
  return (
    <PublicLayout>
        <section className="w-full py-32 bg-background">
            <div className="container px-4 md:px-6 mx-auto max-w-4xl">
                <div className="text-center space-y-4 mb-20">
                    <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 text-xs font-bold uppercase tracking-widest">Support Center</Badge>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tight">Everything you need to know.</h1>
                    <p className="text-muted-foreground text-xl">Can't find the answer you're looking for? Reach out to our support team.</p>
                </div>

                <div className="space-y-6">
                    {[
                        { q: "How long does the clearance process take?", a: "Most students complete their clearance within 2-5 business days, depending on how quickly departmental staff review your requests." },
                        { q: "What if a department rejects my clearance?", a: "You will receive a notification with the reason for rejection. You can then address the issue (e.g., return a book) and the department will re-clear you." },
                        { q: "Is my data secure?", a: "Absolutely. We use industry-standard encryption and Supabase's secure authentication to ensure your personal and academic data is always protected." },
                        { q: "Can I use the system on my phone?", a: "Yes, ClearanceHub is fully responsive and works perfectly on all mobile browsers." },
                        { q: "Do I need to visit offices in person?", a: "The goal of ClearanceHub is to eliminate physical visits. However, some departments might require original documents if discrepancies are found." },
                        { q: "How do I get my final certificate?", a: "Once all required departments show a 'Cleared' status, a download button will automatically appear on your student dashboard." }
                    ].map((item, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-card rounded-3xl p-10 shadow-lg border border-border group cursor-pointer hover:shadow-2xl transition-all"
                        >
                            <div className="flex justify-between items-center gap-4">
                                <h4 className="text-2xl font-black flex items-center gap-4">
                                    <HelpCircle className="h-8 w-8 text-primary shrink-0" />
                                    {item.q}
                                </h4>
                                <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </div>
                            <p className="mt-6 text-muted-foreground text-lg font-medium leading-relaxed max-w-3xl hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-300">
                                {item.a}
                            </p>
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
