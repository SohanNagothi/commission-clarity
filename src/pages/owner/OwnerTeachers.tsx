import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Mail, Phone, Search, Users, ExternalLink, IndianRupee, HandCoins, Plus, Mail as MailIcon, FilterX, PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface TeacherStats {
    id: string;
    name: string;
    email: string;
    teacherType: string;
    hasAccount: boolean;
    totalEarnings: number;
    totalSettled: number;
    pending: number;
}

export default function OwnerTeachers() {
    const { profile } = useAuth();
    const [teachers, setTeachers] = useState<TeacherStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Add Teacher Dialog
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newTeacherType, setNewTeacherType] = useState("academic");
    const [adding, setAdding] = useState(false);

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
                .select("id, full_name, email, teacher_type, organization_name")
                .eq("owner_id", profile.id)
                .eq("role", "teacher");

            if (profilesError) throw profilesError;

            // 2. For each teacher, calculate their stats
            const teacherStats = await Promise.all((profiles || []).map(async (t) => {
                const { data: payments } = await supabase
                    .from("payments")
                    .select("amount, clients(commission_rate)")
                    .eq("user_id", t.id)
                    .in("status", ["approved", "paid"]);

                const totalEarnings = payments?.reduce((acc, p: any) => {
                    const rate = p.clients?.commission_rate ?? 60;
                    return acc + (p.amount * rate / 100);
                }, 0) || 0;

                const { data: settlements } = await supabase
                    .from("settlements")
                    .select("amount")
                    .eq("user_id", t.id);

                const totalSettled = settlements?.reduce((acc, s) => acc + s.amount, 0) || 0;

                const isManual = t.email?.includes("@manual-entry");

                return {
                    id: t.id,
                    name: t.full_name,
                    email: t.email,
                    teacherType: t.teacher_type || "General",
                    hasAccount: !isManual,
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

    const handleAddTeacher = async () => {
        if (!newName || !newEmail) {
            toast.error("Name and email are required");
            return;
        }

        setAdding(true);
        try {
            const { error } = await supabase.from("profiles").insert({
                id: crypto.randomUUID(),
                full_name: newName,
                email: `${newEmail}@manual-entry`,
                role: 'teacher',
                owner_id: profile?.id,
                teacher_type: newTeacherType,
                organization_name: profile?.organization_name
            });

            if (error) throw error;

            toast.success("Teacher added manually");
            setAddDialogOpen(false);
            setNewName("");
            setNewEmail("");
            fetchTeachers();
        } catch (err) {
            console.error(err);
            toast.error("Failed to add teacher");
        } finally {
            setAdding(false);
        }
    };

    const filteredTeachers = teachers.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="page-container py-32 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <p className="text-muted-foreground font-medium animate-pulse">
                    Loading your teaching team...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-display mb-1">Teacher Management</h1>
                    <p className="text-muted-foreground">Monitor earnings and settlements for {profile?.organization_name || "your organization"}.</p>
                </div>
                <Button onClick={() => setAddDialogOpen(true)} className="gap-2 rounded-xl">
                    <Plus className="h-4 w-4" />
                    Add Teacher Manually
                </Button>
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

            {filteredTeachers.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12"
                >
                    <Card className="p-16 text-center border-dashed border-2 bg-muted/5 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                            {searchQuery ? (
                                <FilterX className="h-10 w-10 text-muted-foreground/40" />
                            ) : (
                                <GraduationCap className="h-10 w-10 text-muted-foreground/40" />
                            )}
                        </div>
                        <h3 className="text-2xl font-black mb-2">
                            {searchQuery ? "No teachers found" : "Your team is empty"}
                        </h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-8 leading-relaxed">
                            {searchQuery
                                ? `We couldn't find any team members matching "${searchQuery}". Try a different search term.`
                                : "Share your organization code to invite teachers, or add them manually to start tracking their performance."}
                        </p>

                        {searchQuery ? (
                            <Button
                                variant="outline"
                                onClick={() => setSearchQuery("")}
                                className="rounded-xl px-8"
                            >
                                Clear Search
                            </Button>
                        ) : (
                            <Button onClick={() => setAddDialogOpen(true)} className="rounded-xl px-8 gap-2">
                                <PlusCircle className="h-4 w-4" />
                                Add Your First Teacher
                            </Button>
                        )}
                    </Card>
                </motion.div>
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
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg">{teacher.name}</h3>
                                                <Badge variant="outline" className="text-[10px] uppercase h-5 font-bold tracking-tighter">
                                                    {teacher.teacherType}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {teacher.hasAccount ? teacher.email : "Manually Added"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge variant={teacher.pending > 0 ? "warning" : "success"}>
                                            {teacher.pending > 0 ? "Owes Settlement" : "Up to Date"}
                                        </Badge>
                                        <Badge variant="secondary" className="text-[9px] h-4">
                                            {teacher.hasAccount ? "Account Created" : "Manual Entry"}
                                        </Badge>
                                    </div>
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
                                    {teacher.pending > 0 && teacher.hasAccount && (
                                        <Button
                                            className="flex-1 gap-2 bg-primary/5 hover:bg-primary/10 text-primary border-none shadow-none"
                                            variant="outline"
                                            size="sm"
                                            onClick={async () => {
                                                const { error } = await supabase.from("notifications").insert({
                                                    recipient_id: teacher.id,
                                                    sender_id: profile?.id,
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

            {/* Add Teacher Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Teacher Manually</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input placeholder="Teacher's name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Username / ID (for record)</label>
                            <Input placeholder="e.g. rahul123" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                            <p className="text-[10px] text-muted-foreground">This is for internal tracking as they won't have a login account.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Teacher Type</label>
                            <Select value={newTeacherType} onValueChange={setNewTeacherType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="academic">Academic</SelectItem>
                                    <SelectItem value="music">Music</SelectItem>
                                    <SelectItem value="sports">Sports</SelectItem>
                                    <SelectItem value="language">Language</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddTeacher} disabled={adding}>{adding ? "Adding..." : "Add Teacher"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
