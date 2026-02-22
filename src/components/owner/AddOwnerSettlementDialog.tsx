import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, HandCoins } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Teacher {
    id: string;
    name: string;
}

interface AddOwnerSettlementDialogProps {
    onSettlementAdded?: () => void;
    preselectedTeacherId?: string;
}

export function AddOwnerSettlementDialog({
    onSettlementAdded,
    preselectedTeacherId,
}: AddOwnerSettlementDialogProps) {
    const { profile } = useAuth();
    const [open, setOpen] = useState(false);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    const [teacherId, setTeacherId] = useState(preselectedTeacherId || "");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && profile?.id) {
            fetchTeachers();
        }
    }, [open, profile]);

    const fetchTeachers = async () => {
        const { data } = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("owner_id", profile?.id)
            .eq("role", "teacher");

        setTeachers((data || []).map(t => ({ id: t.id, name: t.full_name })));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teacherId) {
            toast.error("Please select a teacher");
            return;
        }

        setLoading(true);

        const { error } = await supabase.from("settlements").insert({
            amount: Number(amount),
            settlement_date: date,
            notes: notes.trim() || null,
            user_id: teacherId, // Recording the settlement FOR this teacher
        });

        if (error) {
            console.error(error);
            toast.error("Failed to record settlement");
            setLoading(false);
            return;
        }

        toast.success("Settlement recorded successfully");
        setOpen(false);
        setAmount("");
        setNotes("");
        onSettlementAdded?.();
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-success hover:bg-success/90">
                    <HandCoins className="h-4 w-4" />
                    Record Payment
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Record Teacher Payout</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label>Teacher / Staff Member</Label>
                        <Select value={teacherId} onValueChange={setTeacherId} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select teacher" />
                            </SelectTrigger>
                            <SelectContent>
                                {teachers.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Amount Paid (₹)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                min="0.01"
                                step="0.01"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Payment Date</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Notes (Optional)</Label>
                        <Textarea
                            placeholder="e.g. Paid via UPI / Bank Transfer"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="success" className="flex-1" disabled={loading}>
                            {loading ? "Recording..." : "Record Settlement"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
