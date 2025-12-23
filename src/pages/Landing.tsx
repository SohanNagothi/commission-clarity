import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  TrendingUp,
  Clock,
  Shield,
  Users,
} from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Track Every Commission",
    description:
      "Know exactly what you've earned, even when payments arrive on different dates for different months.",
  },
  {
    icon: Clock,
    title: "Clear Payment History",
    description:
      "See who paid, when they paid, and what month it's for — all in one simple view.",
  },
  {
    icon: Shield,
    title: "Never Lose Money",
    description:
      "Track settlements from owners or platforms to ensure you receive everything you're owed.",
  },
  {
    icon: Users,
    title: "Manage All Clients",
    description:
      "Keep client details, fees, and commission rates organized in one place.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">F</span>
              </div>
              <span className="font-bold text-xl">Feezy</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-display mb-6">
              Commission tracking,{" "}
              <span className="text-primary">finally clear</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Stop losing track of your earnings. Feezy helps teachers, freelancers, 
              and agents track commissions, payments, and settlements — 
              without the spreadsheet headaches.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="hero" size="xl">
                  Start Tracking Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="hero-secondary" size="xl">
                  I Have an Account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-secondary/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-headline mb-4">Built for commission-based work</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're a teacher getting paid through a center, a freelancer 
              juggling clients, or an agent tracking sales — Feezy adapts to how you earn.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card p-6 lg:p-8 rounded-2xl border"
              >
                <div className="w-12 h-12 bg-primary-muted rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-title mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-primary rounded-3xl p-8 lg:p-12 text-center"
          >
            <h2 className="text-headline text-primary-foreground mb-4">
              Ready to stop guessing?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Join professionals who've taken control of their commission tracking. 
              It's free to start.
            </p>
            <Link to="/register">
              <Button
                size="xl"
                className="bg-card text-foreground hover:bg-card/90 shadow-lg"
              >
                Get Started Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">F</span>
              </div>
              <span className="font-semibold">Feezy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Feezy. Track your earnings with clarity.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
