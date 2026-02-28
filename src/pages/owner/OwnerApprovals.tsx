import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertCircle, Clock, User, IndianRupee, FileText, FilterX, PlusCircle, CreditCard, Banknote, Image as ImageIcon, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatCurrency, formatDate, formatMonthYear } from "@/lib/format";

export default function OwnerApprovals() {
    const { profile } = useAuth();
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Approval/Rejection states
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<"approve" | "reject">("approve");

    useEffect(() => {
        fetchPendingPayments();
    }, [profile]);

    const fetchPendingPayments = async () => {
        if (!profile?.id) return;
        setLoading(true);
        try {
            // Get teachers in org
            const { data: teachers } = await supabase
                .from("profiles")
                .select("id")
                .eq("owner_id", profile.id)
                .eq("role", "teacher");

            const teacherIds = teachers?.map(t => t.id) || [];

            const { data, error } = await supabase
                .from("payments")
                .select(`
                  id,
                  user_id,
                  amount,
                  month_for,
                  reference_proof,
                  payment_method,
                  proof_image_url,
                  created_at,
                  clients ( name, commission_rate, default_fee ),
                  profiles!user_id ( full_name, email )
                `)
                .in("user_id", teacherIds)
                .eq("status", "pending_owner_approval")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setPayments(data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load pending approvals");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!selectedPayment) return;
        if (actionType === "reject" && !rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }

        setActionLoading(true);
        try {
            const status = actionType === "approve" ? "approved" : "rejected";
            const { error } = await supabase
                .from("payments")
                .update({
                    status,
                    rejection_reason: actionType === "reject" ? rejectionReason : null,
                    // If approved, we might also want to log who approved it or send notification
                })
                .eq("id", selectedPayment.id);

            if (error) throw error;

            toast.success(`Payment ${status} successfully`);
            setDialogOpen(false);
            fetchPendingPayments();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update payment status");
        } finally {
            setActionLoading(false);
            setSelectedPayment(null);
            setRejectionReason("");
        }
    };

    const openDialog = (payment: any, type: "approve" | "reject") => {
        setSelectedPayment(payment);
        setActionType(type);
        setDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-display mb-1">Fee Approvals</h1>
                <p className="text-muted-foreground">Manual verification required for student fee requests.</p>
            </div>

            {loading ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <p className="text-muted-foreground font-medium animate-pulse">
                        Scanning for pending requests...
                    </p>
                </div>
            ) : payments.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12"
                >
                    <Card className="p-16 text-center border-dashed border-2 bg-muted/5 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                            <Clock className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                        <h3 className="text-2xl font-black mb-2">All caught up!</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-8 leading-relaxed">
                            No student fee requests are currently awaiting your verification. You're doing a great job!
                        </p>
                    </Card>
                </motion.div>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence>
                        {payments.map((p, index) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                                    <div className="flex gap-4 items-start">
                                        <div className="p-3 bg-warning/10 text-warning rounded-2xl">
                                            <AlertCircle className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg">{p.clients?.name}</h3>
                                                <Badge variant="outline" className="text-[10px] h-5">
                                                    {formatMonthYear(p.month_for)}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    Teacher: {p.profiles?.full_name}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FileText className="h-3 w-3" />
                                                    Ref: {p.reference_proof || "N/A"}
                                                </span>
                                                <Badge variant="secondary" className="text-[10px] h-5 bg-muted/50 border-none font-bold">
                                                    {p.payment_method === 'cash' ? (
                                                        <span className="flex items-center gap-1 text-success">
                                                            <Banknote className="h-3 w-3" />
                                                            Cash
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-primary">
                                                            <CreditCard className="h-3 w-3" />
                                                            Online
                                                        </span>
                                                    )}
                                                </Badge>
                                                {p.proof_image_url && (
                                                    <Badge variant="outline" className="text-[10px] h-5 border-primary/20 text-primary bg-primary/5">
                                                        <ImageIcon className="h-3 w-3 mr-1" />
                                                        Proof Attached
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-6">
                                        <div className="text-right">
                                            <p className="text-2xl font-black">{formatCurrency(p.amount)}</p>
                                            <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Requested {formatDate(p.created_at)}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-11 w-11 rounded-xl hover:bg-success/10 hover:text-success border-success/20"
                                                onClick={() => openDialog(p, "approve")}
                                            >
                                                <Check className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-11 w-11 rounded-xl hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                                                onClick={() => openDialog(p, "reject")}
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === "approve" ? "Approve Payment" : "Reject Payment"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="p-4 bg-muted/30 rounded-2xl border border-muted/50">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Student</span>
                                <span className="font-bold">{selectedPayment?.clients?.name}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Amount</span>
                                <span className="font-bold text-lg">{formatCurrency(selectedPayment?.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Teacher</span>
                                <span className="font-bold">{(selectedPayment?.profiles as any)?.full_name || "Assigned Teacher"}</span>
                            </div>
                        </div>

                        {selectedPayment?.proof_image_url && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" />
                                    Payment Proof
                                </label>
                                <div className="relative group rounded-2xl overflow-hidden border border-muted/50 bg-muted/20">
                                    <img
                                        src={selectedPayment.proof_image_url}
                                        alt="Payment Proof"
                                        className="w-full h-auto max-h-[300px] object-contain cursor-pointer transition-transform group-hover:scale-105"
                                        onClick={() => window.open(selectedPayment.proof_image_url, '_blank')}
                                    />
                                    <div
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                        onClick={() => window.open(selectedPayment.proof_image_url, '_blank')}
                                    >
                                        <p className="text-white text-xs font-bold flex items-center gap-2">
                                            <ExternalLink className="h-4 w-4" />
                                            View Full Size
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {actionType === "reject" && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Rejection Reason (Required)</label>
                                <Input
                                    placeholder="e.g. Incorrect reference number"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                            </div>
                        )}

                        {actionType === "approve" && (
                            <p className="text-sm text-muted-foreground bg-success/5 p-4 rounded-xl border border-success/10">
                                Approving this will record the revenue for the organization and increase the teacher's receivable balance.
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={actionLoading}>Cancel</Button>
                        <Button
                            variant={actionType === "approve" ? "default" : "destructive"}
                            onClick={handleAction}
                            disabled={actionLoading}
                        >
                            {actionLoading ? "Processing..." : (actionType === "approve" ? "Confirm Approval" : "Confirm Rejection")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
