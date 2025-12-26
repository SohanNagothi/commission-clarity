import { useState } from "react";
import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Message sent! We'll get back to you soon.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/"><Logo size="md" /></Link>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-headline mb-4 text-center">Contact Us</h1>
          <p className="text-muted-foreground text-center mb-12">Have questions? We'd love to hear from you.</p>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10"><Mail className="h-5 w-5 text-primary" /></div>
                <div><h3 className="font-semibold">Email</h3><p className="text-muted-foreground">support@feezy.in</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-accent/10"><Phone className="h-5 w-5 text-accent" /></div>
                <div><h3 className="font-semibold">Phone</h3><p className="text-muted-foreground">+91 98765 43210</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-success/10"><MapPin className="h-5 w-5 text-success" /></div>
                <div><h3 className="font-semibold">Location</h3><p className="text-muted-foreground">Mumbai, Maharashtra, India</p></div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input placeholder="Your name" required /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="you@example.com" required /></div>
              <div className="space-y-2"><Label>Message</Label><Textarea placeholder="How can we help?" rows={4} required /></div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending..." : "Send Message"}</Button>
            </form>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
