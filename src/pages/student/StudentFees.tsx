import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Search,
    Filter,
    IndianRupee,
    Download,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowUpDown
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatDate, formatMonthYear } from "@/lib/format";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function StudentFees() {
    const { profile } = useAuth();
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchPayments();
    }, [profile]);

    const fetchPayments = async () => {
        if (!profile?.id) return;
        setLoading(true);

        try {
            // 1. Get client record for this profile
            const { data: clients } = await supabase
                .from("clients")
                .select("id, user_id, profiles!user_id(full_name)")
                .eq("profile_id", profile.id);

            const client = clients?.[0];

            if (!client) throw new Error("Client record not found");

            // 2. Fetch all payments
            const { data, error } = await supabase
                .from("payments")
                .select("*")
                .eq("client_id", client.id)
                .order("payment_date", { ascending: false });

            if (error) throw error;
            setPayments(data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load fee history");
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const matchesSearch = formatMonthYear(p.month_for).toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || p.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [payments, searchQuery, statusFilter]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-display mb-1">Fee History</h1>
                    <p className="text-muted-foreground">Complete log of your payments and pending dues.</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Statement
                </Button>
            </div>

            <Card className="p-4 bg-muted/20 border-none shadow-none">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by month (e.g. June 2024)..."
                            className="pl-9 bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-48 bg-background">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Filter className="h-3.5 w-3.5" />
                                <SelectValue placeholder="All Status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Records</SelectItem>
                            <SelectItem value="paid">Paid Only</SelectItem>
                            <SelectItem value="pending">Pending Only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {loading ? (
                <div className="py-20 text-center text-muted-foreground">Loading fee history...</div>
            ) : filteredPayments.length === 0 ? (
                <Card className="p-20 text-center border-dashed border-2 bg-muted/5">
                    <IndianRupee className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    <p className="text-lg font-medium opacity-60">No records found</p>
                    <p className="text-sm opacity-40">Your fee records will appear here as recorded by your teacher.</p>
                </Card>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-muted/50 shadow-sm">
                    <table className="w-full text-left bg-card">
                        <thead className="bg-muted/30 border-b">
                            <tr>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Month</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Date</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="p-4 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-muted/30">
                            {filteredPayments.map((p, index) => (
                                <motion.tr
                                    key={p.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="hover:bg-muted/10 transition-colors"
                                >
                                    <td className="p-4 font-bold">{formatMonthYear(p.month_for)}</td>
                                    <td className="p-4 text-sm text-muted-foreground">{formatDate(p.payment_date)}</td>
                                    <td className="p-4">
                                        <Badge
                                            variant={
                                                p.status === 'paid' || p.status === 'approved' ? 'success' :
                                                    p.status === 'rejected' ? 'destructive' :
                                                        'warning'
                                            }
                                            className="capitalize gap-1"
                                        >
                                            {p.status === 'paid' || p.status === 'approved' ? (
                                                <CheckCircle2 className="h-3 w-3" />
                                            ) : p.status === 'rejected' ? (
                                                <XCircle className="h-3 w-3" />
                                            ) : (
                                                <Clock className="h-3 w-3" />
                                            )}
                                            {p.status.replace(/_/g, ' ')}
                                        </Badge>
                                        {p.status === 'rejected' && p.rejection_reason && (
                                            <p className="text-[10px] text-destructive mt-1 font-medium">{p.rejection_reason}</p>
                                        )}
                                        {/* Added Teacher Name hint for clarity */}
                                        <p className="text-[10px] text-muted-foreground mt-1">Verified by Instructor</p>
                                    </td>
                                    <td className="p-4 text-right font-bold text-lg">
                                        <span className={p.status === 'paid' ? 'text-foreground' : 'text-warning'}>
                                            {formatCurrency(p.amount)}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
