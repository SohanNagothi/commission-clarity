import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import {
  ArrowRight,
  TrendingUp,
  Clock,
  Shield,
  Users,
  IndianRupee,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Wallet,
} from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Track Every Commission",
    description: "Know exactly what you've earned from each student or client, even when payments come at different times.",
    color: "text-primary bg-primary/10",
  },
  {
    icon: Clock,
    title: "Clear Payment History",
    description: "See who paid, when they paid, and which month it's for — no more spreadsheet confusion.",
    color: "text-accent bg-accent/10",
  },
  {
    icon: Shield,
    title: "Never Miss a Rupee",
    description: "Track settlements from coaching centres or platforms to ensure you receive everything you're owed.",
    color: "text-success bg-success/10",
  },
  {
    icon: Users,
    title: "Manage All Clients",
    description: "Keep student/client details, fees, and commission rates organized in one beautiful dashboard.",
    color: "text-info bg-info/10",
  },
];

const benefits = [
  "No more Excel headaches",
  "Works on mobile & desktop",
  "Made for Indian professionals",
  "₹ Rupee-first design",
  "DD/MM/YYYY date format",
  "Dark mode available",
];

const testimonials = [
  {
    name: "Priya Mehta",
    role: "Mathematics Teacher, Mumbai",
    quote: "Finally, I know exactly how much the coaching centre owes me. No more guesswork!",
  },
  {
    name: "Rahul Sharma",
    role: "Freelance Designer, Delhi",
    quote: "Tracking partial payments from multiple clients was a nightmare. Feezy solved it.",
  },
  {
    name: "Anjali Reddy",
    role: "Insurance Agent, Hyderabad",
    quote: "The analytics help me see which clients bring the most commission. Game changer!",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" />
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="shadow-md">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-44 lg:pb-32 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pattern-dots opacity-50" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Made for Indian Professionals
            </div>
            
            <h1 className="text-display mb-6">
              Commission tracking,{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">finally simple</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Stop losing track of your earnings. Feezy helps teachers, trainers, 
              freelancers, and agents track commissions, payments, and settlements — 
              all in ₹ Rupees.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg glow-primary">
                  Start Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  I Have an Account
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              {benefits.slice(0, 3).map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  {benefit}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-headline mb-4">Built for commission-based work</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're a teacher at a coaching centre, a freelancer with multiple clients, 
              or an agent tracking sales — Feezy adapts to how Indians earn.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 lg:p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-title mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats/Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-headline mb-6">Why professionals love Feezy</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Mock dashboard preview */}
              <div className="bg-card rounded-2xl border shadow-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">This Month's Summary</h3>
                  <span className="text-xs text-muted-foreground">December 2024</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-success/10">
                    <div className="flex items-center gap-2 text-success mb-1">
                      <IndianRupee className="h-4 w-4" />
                      <span className="text-xs font-medium">Earned</span>
                    </div>
                    <p className="text-2xl font-bold">₹24,500</p>
                  </div>
                  <div className="p-4 rounded-xl bg-warning/10">
                    <div className="flex items-center gap-2 text-warning-foreground mb-1">
                      <Wallet className="h-4 w-4" />
                      <span className="text-xs font-medium">Pending</span>
                    </div>
                    <p className="text-2xl font-bold">₹8,200</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">8 Active Clients</p>
                      <p className="text-xs text-muted-foreground">16 payments this month</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-headline mb-4">Trusted by professionals across India</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-2xl border"
              >
                <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-primary rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L3N2Zz4=')] opacity-50" />
            <div className="relative">
              <h2 className="text-headline text-primary-foreground mb-4">
                Ready to stop guessing your earnings?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of Indian professionals who've taken control of their commission tracking. 
                It's free to get started.
              </p>
              <Link to="/register">
                <Button size="lg" className="bg-card text-foreground hover:bg-card/90 shadow-lg gap-2">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
