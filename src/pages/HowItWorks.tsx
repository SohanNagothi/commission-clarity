import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  { step: "1", title: "Add Your Clients", description: "Set up your clients with their commission rates and default fees." },
  { step: "2", title: "Record Payments", description: "Log each payment as it comes in, noting the month it's for." },
  { step: "3", title: "Track Settlements", description: "Record when you receive money from owners or platforms." },
  { step: "4", title: "Stay Informed", description: "View analytics, pending amounts, and never lose track of what you're owed." },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/"><Logo size="md" /></Link>
          <Link to="/register"><Button>Get Started</Button></Link>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-headline mb-4">How Feezy Works</h1>
          <p className="text-xl text-muted-foreground">Simple steps to financial clarity.</p>
        </motion.div>
        
        <div className="space-y-8">
          {steps.map((s, i) => (
            <motion.div key={s.step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
              className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shrink-0">
                {s.step}
              </div>
              <div className="pt-2">
                <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                <p className="text-muted-foreground">{s.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link to="/register"><Button size="lg">Start Tracking Now</Button></Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
