import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    HandCoins,
    Search,
    Calendar,
    Filter,
    Download,
    Plus,
    Clock,
    CheckCircle2,
    XCircle,
    FilterX,
    PlusCircle
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
import { toast } from "sonner";
import { formatCurrency, formatDate, formatMonthYear } from "@/lib/format";
import { AddOwnerSettlementDialog } from "@/components/owner/AddOwnerSettlementDialog";
import { Badge } from "@/components/ui/badge";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

interface Settlement {
    id: string;
    amount: number;
    settlement_date: string;
    notes: string | null;
    teacherName: string;
    teacherId: string;
}

interface PayoutRequest {
    id: string;
    amount: number;
    notes: string | null;
    status: string;
    created_at: string;
    teacherName: string;
    teacherId: string;
}

export default function OwnerSettlements() {
    const { profile } = useAuth();
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [teacherFilter, setTeacherFilter] = useState("all");
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchSettlements();
        fetchPayoutRequests();
    }, [profile]);

    const fetchSettlements = async () => {
        if (!profile?.id) return;
        setLoading(true);

        try {
            // 1. Get teachers first to filter settlements correctly
            const { data: teachers } = await supabase
                .from("profiles")
                .select("id, full_name")
                .eq("owner_id", profile.id);

            const teacherIds = teachers?.map(t => t.id) || [];

            // 2. Fetch settlements for these teachers
            const { data: settlementsData, error } = await supabase
                .from("settlements")
                .select(`
                  id,
                  amount,
                  settlement_date,
                  notes,
                  user_id,
                  profiles!user_id ( full_name, email )
                `)
                .in("user_id", teacherIds)
                .order("settlement_date", { ascending: false });

            if (error) throw error;

            setSettlements((settlementsData || []).map((s: any) => ({
                id: s.id,
                amount: s.amount,
                settlement_date: s.settlement_date,
                notes: s.notes,
                teacherName: (s.profiles as any)?.full_name || "Unknown",
                teacherId: s.user_id
            })));
        } catch (err) {
            console.error(err);
            toast.error("Failed to load settlements");
        } finally {
            setLoading(false);
        }
    };

    const fetchPayoutRequests = async () => {
        if (!profile?.id) return;
        setLoadingRequests(true);
        try {
            const { data, error } = await supabase
                .from("payout_requests")
                .select(`
                    *,
                    profiles:user_id ( full_name )
                `)
                .eq("owner_id", profile.id)
                .eq("status", "pending")
                .order("created_at", { ascending: false });

            if (error) throw error;

            setPayoutRequests((data || []).map((r: any) => ({
                id: r.id,
                amount: r.amount,
                notes: r.notes,
                status: r.status,
                created_at: r.created_at,
                teacherName: r.profiles?.full_name || "Unknown",
                teacherId: r.user_id
            })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingRequests(false);
        }
    };

    const handleApprovePayout = async (request: PayoutRequest) => {
        setProcessingId(request.id);
        try {
            // 1. Record the settlement
            const { error: settlementError } = await supabase.from("settlements").insert({
                amount: request.amount,
                settlement_date: new Date().toISOString().split('T')[0],
                notes: `Approved Request: ${request.notes || 'No notes'}`,
                user_id: request.teacherId
            });

            if (settlementError) throw settlementError;

            // 2. Update request status
            const { error: requestError } = await supabase
                .from("payout_requests")
                .update({ status: 'approved', updated_at: new Date().toISOString() })
                .eq("id", request.id);

            if (requestError) throw requestError;

            toast.success("Payout approved and recorded!");
            fetchSettlements();
            fetchPayoutRequests();
        } catch (err) {
            console.error(err);
            toast.error("Failed to process approval");
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectPayout = async (requestId: string) => {
        const confirmed = confirm("Are you sure you want to reject this payout request?");
        if (!confirmed) return;

        setProcessingId(requestId);
        try {
            const { error } = await supabase
                .from("payout_requests")
                .update({ status: 'rejected', updated_at: new Date().toISOString() })
                .eq("id", requestId);

            if (error) throw error;

            toast.success("Payout request rejected");
            fetchPayoutRequests();
        } catch (err) {
            console.error(err);
            toast.error("Failed to reject request");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredSettlements = settlements.filter(s => {
        const matchesSearch = s.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        const matchesTeacher = teacherFilter === "all" || s.teacherId === teacherFilter;
        return matchesSearch && matchesTeacher;
    });

    const teachersList = useMemo(() => {
        const unique = new Map();
        settlements.forEach(s => unique.set(s.teacherId, s.teacherName));
        return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
    }, [settlements]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-display mb-1">Settlement History</h1>
                    <p className="text-muted-foreground">Log of all payments made to organization teachers.</p>
                </div>
                <AddOwnerSettlementDialog onSettlementAdded={fetchSettlements} />
            </div>

            <Tabs defaultValue="history" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="history">Settlement History</TabsTrigger>
                    <TabsTrigger value="requests" className="relative font-bold">
                        Payout Requests
                        {payoutRequests.length > 0 && (
                            <span className="ml-2 bg-destructive text-destructive-foreground text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                                {payoutRequests.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="requests" className="space-y-6">
                    {loadingRequests ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <p className="text-muted-foreground font-medium animate-pulse">
                                Loading payout requests...
                            </p>
                        </div>
                    ) : payoutRequests.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-12"
                        >
                            <Card className="p-16 text-center border-dashed border-2 bg-muted/5 flex flex-col items-center justify-center">
                                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                                    <Clock className="h-10 w-10 text-muted-foreground/40" />
                                </div>
                                <h3 className="text-2xl font-black mb-2">No pending requests</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-8 leading-relaxed">
                                    When teachers request their commissions, they will appear here for your review and approval.
                                </p>
                            </Card>
                        </motion.div>
                    ) : (
                        <div className="grid gap-4">
                            {payoutRequests.map((req) => (
                                <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <Card className="p-6 border-muted/50 overflow-hidden relative">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center font-bold text-lg">
                                                    {req.teacherName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-xl">{req.teacherName}</h3>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Requested on {formatDate(req.created_at)}
                                                    </p>
                                                    {req.notes && <p className="text-sm italic mt-2 text-muted-foreground">"{req.notes}"</p>}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-3">
                                                <div className="text-right">
                                                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-1">Requested Amount</span>
                                                    <span className="text-3xl font-black text-warning">{formatCurrency(req.amount)}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="gap-2 text-destructive border-destructive/20 hover:bg-destructive/10"
                                                        onClick={() => handleRejectPayout(req.id)}
                                                        disabled={processingId === req.id}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        className="gap-2 bg-success hover:bg-success/90"
                                                        onClick={() => handleApprovePayout(req)}
                                                        disabled={processingId === req.id}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Approve & Pay
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history">
                    <Card className="p-4 bg-muted/20 border-none shadow-none mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search settlements..."
                                    className="pl-9 bg-background"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <Select value={teacherFilter} onValueChange={setTeacherFilter}>
                                <SelectTrigger className="w-full sm:w-64 bg-background">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Filter className="h-3.5 w-3.5" />
                                        <SelectValue placeholder="All Teachers" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Teachers</SelectItem>
                                    {teachersList.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </Card>

                    {loading ? (
                        <div className="py-32 flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <p className="text-muted-foreground font-medium animate-pulse">
                                Fetching settlement history...
                            </p>
                        </div>
                    ) : filteredSettlements.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-12"
                        >
                            <Card className="p-16 text-center border-dashed border-2 bg-muted/5 flex flex-col items-center justify-center">
                                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                                    {searchQuery || teacherFilter !== "all" ? (
                                        <FilterX className="h-10 w-10 text-muted-foreground/40" />
                                    ) : (
                                        <HandCoins className="h-10 w-10 text-muted-foreground/40" />
                                    )}
                                </div>
                                <h3 className="text-2xl font-black mb-2">
                                    {searchQuery || teacherFilter !== "all" ? "No matches found" : "No settlement history"}
                                </h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-8 leading-relaxed">
                                    {searchQuery || teacherFilter !== "all"
                                        ? `We couldn't find any settlements matching your current filters.`
                                        : "You haven't recorded any settlements yet. Start by approving a payout request or adding a manual entry."}
                                </p>

                                {searchQuery || teacherFilter !== "all" ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setTeacherFilter("all");
                                        }}
                                        className="rounded-xl px-8"
                                    >
                                        Clear History Filters
                                    </Button>
                                ) : (
                                    <AddOwnerSettlementDialog onSettlementAdded={fetchSettlements} />
                                )}
                            </Card>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {filteredSettlements.map((s, index) => (
                                <motion.div
                                    key={s.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <Card className="p-4 hover:bg-muted/30 transition-colors border-muted/40 shadow-sm">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-success/10 rounded-lg">
                                                    <HandCoins className="h-5 w-5 text-success" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">{s.teacherName}</h3>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(s.settlement_date)}
                                                        </span>
                                                        {s.notes && <span className="italic truncate max-w-[200px] border-l pl-3">"{s.notes}"</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right flex items-center justify-between sm:block">
                                                <span className="text-xs text-muted-foreground sm:block uppercase font-bold tracking-widest mb-1">Paid Amount</span>
                                                <span className="text-2xl font-bold text-success">
                                                    {formatCurrency(s.amount)}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
