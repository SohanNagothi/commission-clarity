import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Wallet, TrendingUp, Shield, Smartphone } from "lucide-react";

const features = [
  { icon: BarChart3, title: "Smart Analytics", description: "Visualize your earnings with beautiful charts and insights.", color: "primary" },
  { icon: Users, title: "Client Management", description: "Organize all your clients with custom commission rates.", color: "accent" },
  { icon: Wallet, title: "Payment Tracking", description: "Record every payment and know exactly what's pending.", color: "success" },
  { icon: TrendingUp, title: "Settlement Tracking", description: "Track what you've received from owners and platforms.", color: "warning" },
  { icon: Shield, title: "Secure & Private", description: "Your financial data is encrypted and protected.", color: "info" },
  { icon: Smartphone, title: "Mobile Friendly", description: "Access your data anywhere, on any device.", color: "primary" },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/"><Logo size="md" /></Link>
          <Link to="/register"><Button>Get Started</Button></Link>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-headline mb-4">Powerful Features</h1>
          <p className="text-xl text-muted-foreground">Everything you need to manage commission-based income.</p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-card border hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-xl bg-${f.color}/10 flex items-center justify-center mb-4`}>
                <f.icon className={`h-6 w-6 text-${f.color}`} />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
