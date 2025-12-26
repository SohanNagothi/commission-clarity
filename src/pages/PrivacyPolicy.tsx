import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/"><Logo size="md" /></Link>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-headline mb-8">Privacy Policy</h1>
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">Last updated: December 2024</p>
            
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">1. Information We Collect</h2>
              <p>We collect information you provide directly, including name, email, and payment tracking data you enter into Feezy.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
              <p>Your data is used solely to provide the Feezy service, including tracking commissions, managing clients, and generating reports.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">3. Data Security</h2>
              <p>We implement industry-standard security measures to protect your financial data. All data is encrypted in transit and at rest.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">4. Your Rights</h2>
              <p>You can request access to, correction of, or deletion of your personal data at any time by contacting us.</p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">5. Contact Us</h2>
              <p>For privacy-related inquiries, email us at privacy@feezy.in</p>
            </section>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
