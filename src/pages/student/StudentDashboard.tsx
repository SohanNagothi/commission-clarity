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
import { MarkAsPaidDialog } from "@/components/MarkAsPaidDialog";

export default function StudentDashboard() {
    const { profile, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPaid: 0,
        pendingFees: 0,
        lastPaymentDate: null as string | null,
        teacherName: "",
        teacherPhone: "",
        clientId: "",
        teacherId: "",
        totalExpected: 0,
        remainingDues: 0
    });
    const [recentPayments, setRecentPayments] = useState<any[]>([]);
    const [payDialogOpen, setPayDialogOpen] = useState(false);

    useEffect(() => {
        fetchStudentData();
    }, [profile]);

    const fetchStudentData = async () => {
        if (!profile?.id) return;
        setLoading(true);

        try {
            // 1. Get client record for this profile
            const { data: clients, error: clientErr } = await supabase
                .from("clients")
                .select(`
                  id,
                  user_id,
                  default_fee,
                  created_at,
                  profiles!user_id ( full_name, email )
                `)
                .eq("profile_id", profile.id);

            const client = clients?.[0];

            if (clientErr || !client) {
                if (clientErr) throw clientErr;
                throw new Error("Client record not found");
            }

            // 2. Fetch all payments for this client
            const { data: payments, error: paymentsErr } = await supabase
                .from("payments")
                .select("*")
                .eq("client_id", client.id)
                .order("payment_date", { ascending: false });

            if (paymentsErr) throw paymentsErr;

            const totalPaid = payments
                ?.filter(p => p.status === 'paid' || p.status === 'approved')
                .reduce((acc, p) => acc + p.amount, 0) || 0;

            const pendingFees = payments
                ?.filter(p => p.status === 'pending')
                .reduce((acc, p) => acc + p.amount, 0) || 0;

            const verificationFees = payments
                ?.filter(p => p.status === 'pending_owner_approval')
                .reduce((acc, p) => acc + p.amount, 0) || 0;

            // 3. Calculate Dues
            const signupDate = new Date(client.created_at);
            const now = new Date();
            const monthsElapsed = (now.getFullYear() - signupDate.getFullYear()) * 12 + (now.getMonth() - signupDate.getMonth());
            const totalExpected = (Math.max(0, monthsElapsed) + 1) * (client.default_fee || 0);
            const remainingDues = Math.max(0, totalExpected - totalPaid);

            setStats({
                totalPaid,
                pendingFees,
                lastPaymentDate: payments?.[0]?.payment_date || null,
                teacherName: (client.profiles as any)?.full_name || "Assigned Teacher",
                teacherPhone: "Contact via portal",
                clientId: client.id,
                teacherId: client.user_id,
                totalExpected,
                remainingDues
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-display mb-2">My Fee Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back, {profile?.full_name?.split(' ')[0]}. Track your payments and fee status here.
                    </p>
                </div>
                <Button
                    size="lg"
                    className="rounded-2xl gap-2 shadow-lg shadow-primary/20 h-14 px-8 text-lg font-bold"
                    onClick={() => setPayDialogOpen(true)}
                >
                    <IndianRupee className="h-5 w-5" />
                    Mark Fees as Paid
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Owed"
                    value={loading ? "..." : formatCurrency(stats.totalExpected)}
                    subtitle="Fees since signup"
                    icon={IndianRupee}
                    variant="default"
                />
                <StatCard
                    title="Amount Paid"
                    value={loading ? "..." : formatCurrency(stats.totalPaid)}
                    subtitle="Approved payments"
                    icon={CheckCircle2}
                    variant="success"
                />
                <StatCard
                    title="Remaining Dues"
                    value={loading ? "..." : formatCurrency(stats.remainingDues)}
                    subtitle={stats.remainingDues > 0 ? "Outstanding balance" : "All cleared!"}
                    icon={Clock}
                    variant={stats.remainingDues > 0 ? "warning" : "success"}
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
                                            <Badge
                                                variant={
                                                    p.status === 'paid' || p.status === 'approved' ? 'success' :
                                                        p.status === 'rejected' ? 'destructive' :
                                                            'warning'
                                                }
                                                className="text-[10px] h-4 capitalize"
                                            >
                                                {p.status.replace(/_/g, ' ')}
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

            <MarkAsPaidDialog
                open={payDialogOpen}
                onOpenChange={setPayDialogOpen}
                clientId={stats.clientId}
                teacherId={stats.teacherId}
                onSuccess={refreshProfile}
            />
        </div>
    );
}
