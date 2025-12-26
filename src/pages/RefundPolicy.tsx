import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/"><Logo size="md" /></Link>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-headline mb-8">Refund Policy</h1>
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">Last updated: December 2024</p>
            
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Free Tier</h2>
              <p>Feezy's basic features are free to use. No payment, no refund needed.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Premium Subscriptions</h2>
              <p>For premium plans, we offer a 7-day money-back guarantee. If unsatisfied, request a refund within 7 days of purchase.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">How to Request</h2>
              <p>Email refunds@feezy.in with your account details and reason for refund. We process requests within 5-7 business days.</p>
            </section>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
