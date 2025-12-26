import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { Target, Heart, Users } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/"><Logo size="md" /></Link>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
          <div className="text-center">
            <h1 className="text-headline mb-4">About Feezy</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're on a mission to help professionals track their commission-based income without stress.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-card border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Our Mission</h3>
              <p className="text-sm text-muted-foreground">Eliminate financial confusion for commission earners.</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card border">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Our Values</h3>
              <p className="text-sm text-muted-foreground">Simplicity, transparency, and user trust above all.</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card border">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Our Users</h3>
              <p className="text-sm text-muted-foreground">Teachers, trainers, freelancers, and agents across India.</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Built in India, for India</h2>
            <p className="text-muted-foreground">Feezy understands the unique challenges of commission-based work. We're here to help you focus on what you do best.</p>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
