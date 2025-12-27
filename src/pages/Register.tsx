import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (error) {
    toast.error(error.message);
    setLoading(false);
    return;
  }

  const user = data.user;

  if (!user) {
    toast.success("Check your email to verify your account.");
    setLoading(false);
    navigate("/login", { replace: true });
    return;
  }

  /**
   * 🔴 CRITICAL SECURITY CHECK
   * If identities array is empty → user already exists
   */
  if (user.identities?.length === 0) {
    await supabase.auth.signOut(); // ⛔ force logout

    toast.error(
      "An account with this email already exists. Please log in instead."
    );

    setLoading(false);
    navigate("/login", { replace: true });
    return;
  }

  // ✅ New user created safely
  toast.success("Welcome to Feezy 🚀,Check your email to verify your account.");
  setLoading(false);
  navigate("/login", { replace: true });
};

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm mx-auto"
        >
          <Link to="/" className="inline-block mb-8">
            <Logo size="md" />
          </Link>

          <h1 className="text-headline mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-8">
            Start tracking your commissions in minutes
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>

            <Button
              type="submit"
              className="w-full group"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary/80"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-info to-success" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative flex items-center justify-center w-full p-12"
        >
          <div className="text-center max-w-md text-white">
            <h2 className="text-2xl font-bold mb-4">
              Join professionals across India
            </h2>
            <p className="text-white/80">
              Teachers, freelancers, and agents trust Feezy to track earnings
              stress-free.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
