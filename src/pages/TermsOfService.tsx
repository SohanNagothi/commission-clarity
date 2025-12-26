import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/"><Logo size="md" /></Link>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-headline mb-8">Terms of Service</h1>
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">Last updated: December 2024</p>
            
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
              <p>By using Feezy, you agree to these terms. If you disagree, please do not use our service.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">2. Service Description</h2>
              <p>Feezy is a commission tracking platform for professionals. We provide tools to track payments, manage clients, and analyze earnings.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">3. User Responsibilities</h2>
              <p>You are responsible for maintaining the accuracy of your data and the security of your account credentials.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">4. Limitation of Liability</h2>
              <p>Feezy is provided "as is". We are not liable for any financial decisions made based on the data in our platform.</p>
            </section>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
