import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, ShieldCheck, User, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function OwnerLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

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
            const { data: profiles, error: profileError } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", data.user.id);

            const profile = profiles?.[0];

            if (profileError || !profile || profile.role !== "owner") {
                toast.error("This portal is for Organization Owners only.");
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            toast.success("Welcome back, Owner!");
            navigate("/owner/dashboard", { replace: true });
        } else {
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

                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest text-primary/70">Secure Admin Access</span>
                    </div>
                    <h1 className="text-headline mb-2">Owner Portal</h1>
                    <p className="text-muted-foreground mb-8">
                        Manage your organization and oversee performance.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">Work Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@feezy.in"
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
                                "Verifying..."
                            ) : (
                                <>
                                    Enter Dashboard
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        Not an owner?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                            Teacher Login
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Right side - Visual */}
            <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-indigo-600 to-indigo-900" />
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80')] bg-cover" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative flex items-center justify-center w-full p-12 text-white"
                >
                    <div className="max-w-md text-center">
                        <h2 className="text-3xl font-bold mb-6">Scale Your Institution</h2>
                        <p className="text-xl text-white/80 leading-relaxed">
                            Real-time insights into teacher performance, revenue distributions, and student growth.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
