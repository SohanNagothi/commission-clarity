import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Building2,
    GraduationCap,
    HandCoins,
    Users,
    TrendingUp,
    AlertCircle,
    Plus,
    Copy
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/format";

export default function OwnerDashboard() {
    const { profile } = useAuth();
    const [stats, setStats] = useState({
        teachers: 0,
        revenue: 0,
        pendingSettlements: 0,
        students: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, [profile]);

    const fetchDashboardData = async () => {
        if (!profile?.id) return;
        setLoading(true);

        try {
            // 1. Fetch Teachers (profiles where owner_id = current owner)
            const { data: teachers, error: teachersError } = await supabase
                .from("profiles")
                .select("id")
                .eq("owner_id", profile.id)
                .eq("role", "teacher");

            if (teachersError) throw teachersError;
            const teacherIds = teachers?.map(t => t.id) || [];

            // 2. Fetch Clients (students of those teachers)
            const { count: studentCount, error: studentsError } = await supabase
                .from("clients")
                .select("*", { count: 'exact', head: true })
                .in("user_id", teacherIds);

            if (studentsError) throw studentsError;

            // 3. Fetch Payments (Total revenue from those teachers)
            const { data: payments, error: paymentsError } = await supabase
                .from("payments")
                .select("amount")
                .in("user_id", teacherIds)
                .eq("status", "paid");

            if (paymentsError) throw paymentsError;
            const totalRevenue = payments?.reduce((acc, p) => acc + p.amount, 0) || 0;

            // 4. Fetch Settlements (Total paid out by owner to these teachers)
            const { data: settlements, error: settlementsError } = await supabase
                .from("settlements")
                .select("amount")
                .in("user_id", teacherIds);

            if (settlementsError) throw settlementsError;
            const totalSettled = settlements?.reduce((acc, s) => acc + s.amount, 0) || 0;

            setStats({
                teachers: teacherIds.length,
                revenue: totalRevenue,
                pendingSettlements: totalRevenue - totalSettled, // Simple calculation for now
                students: studentCount || 0
            });
        } catch (err) {
            console.error(err);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const copyInviteCode = () => {
        if (profile?.org_invite_code) {
            navigator.clipboard.writeText(profile.org_invite_code);
            toast.success("Invite code copied to clipboard!");
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-display mb-2">Organization Overview</h1>
                    <p className="text-muted-foreground">
                        Manage your staff and observe organization-wide metrics.
                    </p>
                </div>

                <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl shadow-sm">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1">Org Invite Code</p>
                        <p className="text-xl font-mono font-bold tracking-widest text-primary">
                            {profile?.org_invite_code || "-------"}
                        </p>
                    </div>
                    <Button onClick={copyInviteCode} variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-colors">
                        <Copy className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Teachers"
                    value={loading ? "..." : stats.teachers.toString()}
                    subtitle="Staff in organization"
                    icon={GraduationCap}
                    variant="default"
                />
                <StatCard
                    title="Org Revenue"
                    value={loading ? "..." : formatCurrency(stats.revenue)}
                    subtitle="All-time processed"
                    icon={TrendingUp}
                    variant="success"
                />
                <StatCard
                    title="Pending Settlements"
                    value={loading ? "..." : formatCurrency(stats.pendingSettlements)}
                    subtitle="Owed to teachers"
                    icon={HandCoins}
                    variant="warning"
                />
                <StatCard
                    title="Total Students"
                    value={loading ? "..." : stats.students.toString()}
                    subtitle="Managed by teachers"
                    icon={Users}
                    variant="accent"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-headline">Teacher Distribution</h3>
                    </div>
                    <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/5 opacity-80">
                        <Users className="h-12 w-12 mb-4 opacity-10" />
                        <p className="font-medium">Recent Growth Data</p>
                        <p className="text-sm opacity-60">Graphical data will appear as teachers join and record fees.</p>
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-headline mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Button className="w-full justify-between group" variant="outline">
                                <div className="flex items-center gap-2">
                                    <HandCoins className="h-4 w-4" />
                                    Record Settlement
                                </div>
                                <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>
                            <Button className="w-full justify-between group" variant="outline">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Review Org Policy
                                </div>
                                <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>
                            <Button className="w-full justify-between group" variant="outline" onClick={fetchDashboardData}>
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    Refresh Stats
                                </div>
                            </Button>
                        </div>
                    </Card>

                    <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/10">
                        <h4 className="font-bold text-primary mb-2">Growth Tip</h4>
                        <p className="text-sm text-primary-foreground/70 leading-relaxed">
                            New teachers can join your organization using your <strong>unique invite code</strong> found above. Once they join, their revenue data will sync here.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
