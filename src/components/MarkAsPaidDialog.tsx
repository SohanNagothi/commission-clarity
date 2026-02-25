import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface MarkAsPaidDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: string;
    teacherId: string;
    onSuccess: () => void;
}

export function MarkAsPaidDialog({
    open,
    onOpenChange,
    clientId,
    teacherId,
    onSuccess
}: MarkAsPaidDialogProps) {
    const [monthFor, setMonthFor] = useState("");
    const [amount, setAmount] = useState("");
    const [referenceProof, setReferenceProof] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!monthFor || !amount || !referenceProof) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.from("payments").insert({
                user_id: teacherId, // Record linked to teacher
                client_id: clientId,
                month_for: `${monthFor}-01`,
                amount: Number(amount),
                payment_date: new Date().toISOString().split('T')[0],
                status: 'pending_owner_approval',
                reference_proof: referenceProof
            });

            if (error) throw error;

            toast.success("Payment request submitted for approval");
            onOpenChange(false);
            setMonthFor("");
            setAmount("");
            setReferenceProof("");
            onSuccess();
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit payment request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Mark Fees as Paid</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="monthFor">Month Paid For</Label>
                        <Input
                            id="monthFor"
                            type="month"
                            value={monthFor}
                            onChange={(e) => setMonthFor(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount Paid (₹)</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="proof">Reference / Proof (e.g. Transaction ID)</Label>
                        <Input
                            id="proof"
                            placeholder="UTR Number, Transaction ID, etc."
                            value={referenceProof}
                            onChange={(e) => setReferenceProof(e.target.value)}
                            required
                        />
                        <p className="text-[10px] text-muted-foreground">Mandatory for verification by Organization Owner.</p>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Submitting..." : "Submit for Approval"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
