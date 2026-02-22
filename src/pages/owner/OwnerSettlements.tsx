import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    HandCoins,
    Search,
    Calendar,
    Filter,
    Download,
    Plus
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

interface Settlement {
    id: string;
    amount: number;
    settlement_date: string;
    notes: string | null;
    teacherName: string;
    teacherId: string;
}

export default function OwnerSettlements() {
    const { profile } = useAuth();
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [teacherFilter, setTeacherFilter] = useState("all");

    useEffect(() => {
        fetchSettlements();
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
          profiles!settlements_user_id_fkey ( full_name )
        `)
                .in("user_id", teacherIds)
                .order("settlement_date", { ascending: false });

            if (error) throw error;

            setSettlements((settlementsData || []).map((s: any) => ({
                id: s.id,
                amount: s.amount,
                settlement_date: s.settlement_date,
                notes: s.notes,
                teacherName: s.profiles?.full_name || "Unknown",
                teacherId: s.user_id
            })));
        } catch (err) {
            console.error(err);
            toast.error("Failed to load settlements");
        } finally {
            setLoading(false);
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

            <Card className="p-4 bg-muted/20 border-none shadow-none">
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
                <div className="py-20 text-center text-muted-foreground">Loading records...</div>
            ) : filteredSettlements.length === 0 ? (
                <Card className="p-20 text-center border-dashed border-2 bg-muted/5">
                    <HandCoins className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    <p className="text-lg font-medium opacity-60">No settlements found</p>
                    <p className="text-sm opacity-40">Records will appear once you pay your teachers.</p>
                </Card>
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
        </div>
    );
}
