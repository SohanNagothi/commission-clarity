import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Camera, Upload, CreditCard, Banknote } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
    const [paymentMethod, setPaymentMethod] = useState<"online" | "cash">("online");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!monthFor || !amount || !referenceProof) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            let proofImageUrl = null;

            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${teacherId}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('payment-proofs')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('payment-proofs')
                    .getPublicUrl(filePath);

                proofImageUrl = publicUrl;
            }

            const { error } = await supabase.from("payments").insert({
                user_id: teacherId,
                client_id: clientId,
                month_for: `${monthFor}-01`,
                amount: Number(amount),
                payment_date: new Date().toISOString().split('T')[0],
                status: 'pending_owner_approval',
                reference_proof: referenceProof || (paymentMethod === 'cash' ? 'Cash Payment' : ''),
                payment_method: paymentMethod,
                proof_image_url: proofImageUrl
            });

            if (error) throw error;

            toast.success("Payment request submitted for approval");
            onOpenChange(false);
            setMonthFor("");
            setAmount("");
            setReferenceProof("");
            setFile(null);
            setPaymentMethod("online");
            onSuccess();
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit payment request. Make sure 'payment-proofs' bucket exists.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Mark Fees as Paid</DialogTitle>
                    <DialogDescription>
                        Submit proof of fee payment for verification by the organization owner.
                    </DialogDescription>
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

                    <div className="space-y-3 p-4 bg-muted/30 rounded-2xl border border-muted/50">
                        <Label>Payment Method</Label>
                        <RadioGroup
                            value={paymentMethod}
                            onValueChange={(v: any) => setPaymentMethod(v)}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2 bg-background p-3 rounded-xl border border-muted flex-1 cursor-pointer">
                                <RadioGroupItem value="online" id="online" />
                                <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer">
                                    <CreditCard className="h-4 w-4 text-primary" />
                                    Online
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 bg-background p-3 rounded-xl border border-muted flex-1 cursor-pointer">
                                <RadioGroupItem value="cash" id="cash" />
                                <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                                    <Banknote className="h-4 w-4 text-success" />
                                    Cash
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="proof">
                            {paymentMethod === 'online' ? "Transaction ID / Reference" : "Reference (Optional)"}
                        </Label>
                        <Input
                            id="proof"
                            placeholder={paymentMethod === 'online' ? "UTR Number, ID, etc." : "e.g. Paid in cash at centre"}
                            value={referenceProof}
                            onChange={(e) => setReferenceProof(e.target.value)}
                            required={paymentMethod === 'online'}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">
                            {paymentMethod === 'online' ? "Payment Screenshot" : "Fee Receipt Image"}
                        </Label>
                        <div className="relative group">
                            <Input
                                id="file"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <Label
                                htmlFor="file"
                                className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all gap-2"
                            >
                                {file ? (
                                    <div className="flex items-center gap-2 text-primary">
                                        <Camera className="h-5 w-5" />
                                        <span className="text-sm font-bold truncate max-w-[200px]">{file.name}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                                            <Upload className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground text-center">
                                            Click to upload proof image<br />
                                            <span className="opacity-50 text-[10px]">(Max 5MB)</span>
                                        </span>
                                    </>
                                )}
                            </Label>
                        </div>
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
