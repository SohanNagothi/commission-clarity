import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, User, ShieldCheck, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function StudentLogin() {
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

            if (profileError || !profile || profile.role !== "client") {
                toast.error("This portal is for Students only.");
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            toast.success("Welcome back!");
            navigate("/student/dashboard", { replace: true });
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
                        <User className="h-5 w-5 text-accent" />
                        <span className="text-xs font-bold uppercase tracking-widest text-accent/70">Student Access</span>
                    </div>
                    <h1 className="text-headline mb-2">Student Portal</h1>
                    <p className="text-muted-foreground mb-8">
                        View your fees, payments, and learning history.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <input
                                id="email"
                                type="email"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="student@example.com"
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
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-accent hover:bg-accent/90"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : (
                                <>
                                    View My Fees
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        Looking for the teacher portal?{" "}
                        <Link to="/login" className="font-semibold text-primary">Login here</Link>
                    </p>
                </motion.div>
            </div>

            {/* Right side - Visual */}
            <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent via-blue-500 to-blue-700 opacity-90" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80')] bg-cover mix-blend-overlay opacity-20" />

                <div className="relative flex items-center justify-center w-full p-12 text-white text-center">
                    <div className="max-w-sm">
                        <h2 className="text-3xl font-bold mb-4">Focus on Learning</h2>
                        <p className="text-lg text-white/80">
                            Easily track your course fees and payment schedule so you can stay concentrated on your education.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
