import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    IndianRupee,
    Clock,
    CheckCircle2,
    Calendar,
    User,
    Phone,
    ArrowRight
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatDate, formatMonthYear } from "@/lib/format";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function StudentDashboard() {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPaid: 0,
        pendingFees: 0,
        lastPaymentDate: null as string | null,
        teacherName: "",
        teacherPhone: ""
    });
    const [recentPayments, setRecentPayments] = useState<any[]>([]);

    useEffect(() => {
        fetchStudentData();
    }, [profile]);

    const fetchStudentData = async () => {
        if (!profile?.id) return;
        setLoading(true);

        try {
            // 1. Get client record for this profile
            const { data: client, error: clientErr } = await supabase
                .from("clients")
                .select(`
          id,
          user_id,
          profiles!clients_user_id_fkey ( full_name, email )
        `)
                .eq("profile_id", profile.id)
                .single();

            if (clientErr) throw clientErr;

            // 2. Fetch all payments for this client
            const { data: payments, error: paymentsErr } = await supabase
                .from("payments")
                .select("*")
                .eq("client_id", client.id)
                .order("payment_date", { ascending: false });

            if (paymentsErr) throw paymentsErr;

            const totalPaid = payments
                ?.filter(p => p.status === 'paid')
                .reduce((acc, p) => acc + p.amount, 0) || 0;

            const pendingFees = payments
                ?.filter(p => p.status === 'pending')
                .reduce((acc, p) => acc + p.amount, 0) || 0;

            setStats({
                totalPaid,
                pendingFees,
                lastPaymentDate: payments?.[0]?.payment_date || null,
                teacherName: (Array.isArray(client.profiles) ? client.profiles[0]?.full_name : (client.profiles as any)?.full_name) || "Assigned Teacher",
                teacherPhone: "Contact via portal"
            });

            setRecentPayments(payments?.slice(0, 5) || []);

        } catch (err) {
            console.error(err);
            toast.error("Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-display mb-2">My Fee Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {profile?.full_name?.split(' ')[0]}. Track your payments and fee status here.
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Paid"
                    value={loading ? "..." : formatCurrency(stats.totalPaid)}
                    subtitle="All-time fees paid"
                    icon={CheckCircle2}
                    variant="success"
                />
                <StatCard
                    title="Pending Fees"
                    value={loading ? "..." : formatCurrency(stats.pendingFees)}
                    subtitle="Awaiting payment"
                    icon={Clock}
                    variant={stats.pendingFees > 0 ? "warning" : "default"}
                />
                <StatCard
                    title="Last Payment"
                    value={loading ? "..." : stats.lastPaymentDate ? formatDate(stats.lastPaymentDate) : "No records"}
                    subtitle="Most recent update"
                    icon={Calendar}
                    variant="accent"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-headline">Recent Payments</CardTitle>
                        <Link to="/student/fees">
                            <Button variant="ghost" className="text-primary hover:text-primary/80 gap-1 p-0">
                                View All <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
                            </div>
                        ) : recentPayments.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-2xl">
                                <IndianRupee className="h-12 w-12 mx-auto mb-3 opacity-10" />
                                <p>No payment records found yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentPayments.map((p) => (
                                    <div key={p.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-muted/50">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${p.status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                                {p.status === 'paid' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="font-bold">{formatMonthYear(p.month_for)}</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(p.payment_date)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">{formatCurrency(p.amount)}</p>
                                            <Badge variant={p.status === 'paid' ? 'success' : 'warning'} className="text-[10px] h-4">
                                                {p.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Teacher Info */}
                <div className="space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
                        <h3 className="text-headline mb-4">My Teacher</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                                {stats.teacherName?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold">{stats.teacherName}</p>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Assigned Instructor</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-background rounded-xl text-sm border">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>Verified Teacher</span>
                            </div>
                            <Button className="w-full gap-2" variant="outline" disabled>
                                <Phone className="h-4 w-4" />
                                Contact Unavailable
                            </Button>
                        </div>
                    </Card>

                    <div className="p-6 bg-muted/40 rounded-2xl border border-dashed border-muted-foreground/20 italic">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            "Payment records are updated by your teacher. If you see any discrepancy, please contact your instructor directly with your payment receipt."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
