import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Phone, Search, Users, ExternalLink, IndianRupee, HandCoins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

interface TeacherStats {
    id: string;
    name: string;
    email: string;
    totalEarnings: number;
    totalSettled: number;
    pending: number;
}

export default function OwnerTeachers() {
    const { profile } = useAuth();
    const [teachers, setTeachers] = useState<TeacherStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchTeachers();
    }, [profile]);

    const fetchTeachers = async () => {
        if (!profile?.id) return;
        setLoading(true);

        try {
            // 1. Get all teachers for this owner
            const { data: profiles, error: profilesError } = await supabase
                .from("profiles")
                .select("id, full_name, email")
                .eq("owner_id", profile.id)
                .eq("role", "teacher");

            if (profilesError) throw profilesError;

            // 2. For each teacher, calculate their stats
            const teacherStats = await Promise.all((profiles || []).map(async (t) => {
                // Get total paid payments by teacher's clients
                const { data: payments } = await supabase
                    .from("payments")
                    .select("amount")
                    .eq("user_id", t.id)
                    .eq("status", "paid");

                const totalEarnings = payments?.reduce((acc, p) => acc + p.amount, 0) || 0;

                // Get total settlements paid to this teacher
                const { data: settlements } = await supabase
                    .from("settlements")
                    .select("amount")
                    .eq("user_id", t.id);

                const totalSettled = settlements?.reduce((acc, s) => acc + s.amount, 0) || 0;

                return {
                    id: t.id,
                    name: t.full_name,
                    email: t.email,
                    totalEarnings,
                    totalSettled,
                    pending: totalEarnings - totalSettled
                };
            }));

            setTeachers(teacherStats);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load teachers");
        } finally {
            setLoading(false);
        }
    };

    const filteredTeachers = teachers.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-display mb-1">Teacher Management</h1>
                    <p className="text-muted-foreground">Monitor earnings and settlements for your staff.</p>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search teachers by name or email..."
                    className="pl-10 h-12 rounded-2xl bg-muted/20 border-none shadow-inner"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="py-20 text-center text-muted-foreground">Loading your team...</div>
            ) : filteredTeachers.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed bg-muted/5">
                    <GraduationCap className="h-12 w-12 mb-4 mx-auto opacity-10" />
                    <p className="text-lg font-medium opacity-60">No teachers found</p>
                    <p className="text-sm opacity-40">Share your organization code to invite teachers.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredTeachers.map((teacher, index) => (
                        <motion.div
                            key={teacher.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="p-6 hover:shadow-lg transition-all border-muted/50">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                            {teacher.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{teacher.name}</h3>
                                            <p className="text-sm text-muted-foreground">{teacher.email}</p>
                                        </div>
                                    </div>
                                    <Badge variant={teacher.pending > 0 ? "warning" : "success"}>
                                        {teacher.pending > 0 ? "Owes Settlement" : "Up to Date"}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-3 bg-muted/30 rounded-xl">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Earned</p>
                                        <p className="font-bold text-lg">{formatCurrency(teacher.totalEarnings)}</p>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-xl">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Net Owed</p>
                                        <p className={`font-bold text-lg ${teacher.pending > 0 ? 'text-warning' : 'text-success'}`}>
                                            {formatCurrency(teacher.pending)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button className="flex-1 gap-2" variant="outline" size="sm">
                                        <HandCoins className="h-4 w-4" />
                                        Settle
                                    </Button>
                                    {teacher.pending > 0 && (
                                        <Button
                                            className="flex-1 gap-2 bg-primary/5 hover:bg-primary/10 text-primary border-none shadow-none"
                                            variant="outline"
                                            size="sm"
                                            onClick={async () => {
                                                const { error } = await supabase.from("notifications").insert({
                                                    profile_id: teacher.id,
                                                    type: 'settlement_reminder',
                                                    title: 'Org Settlement Update',
                                                    message: `Your owner ${profile?.full_name} has updated records. Please review settlement dues.`
                                                });
                                                if (!error) toast.success(`Settlement reminder sent to ${teacher.name}`);
                                            }}
                                        >
                                            <Mail className="h-4 w-4" />
                                            Notify
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
