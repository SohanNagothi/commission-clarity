import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, ShieldCheck, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // ✅ Role Validation
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError || profile?.role !== "teacher") {
          toast.error("This portal is for Teachers/Agents only.");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        toast.success("Welcome back!");
        navigate("/dashboard", { replace: true });
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Login unexpected error:", err);
      toast.error("An unexpected error occurred during login.");
      setLoading(false);
    }
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

          <h1 className="text-headline mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to continue tracking your commissions
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
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
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full group"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Create one
            </Link>
          </p>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Switch Portal
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 justify-start px-3"
                onClick={() => navigate("/owner/login")}
              >
                <ShieldCheck className="h-3.5 w-3.5 mr-2 text-primary" />
                Owner Portal
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 justify-start px-3"
                onClick={() => navigate("/student/login")}
              >
                <User className="h-3.5 w-3.5 mr-2 text-accent" />
                Student Portal
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-info" />

        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative flex items-center justify-center w-full p-12"
        >
          <div className="text-center max-w-md text-white">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-4xl font-bold">₹</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">
              Your earnings, organized
            </h2>
            <p className="text-white/80 leading-relaxed">
              Track commissions, manage clients, and never lose sight of what
              you're owed. Feezy makes it simple.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
