import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Payment } from "./PaymentRow";

/* ---------- Types ---------- */

interface EditPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment;
  onPaymentUpdated?: () => void;
}

/* ---------- Component ---------- */

export function EditPaymentDialog({
  open,
  onOpenChange,
  payment,
  onPaymentUpdated,
}: EditPaymentDialogProps) {
  const [monthFor, setMonthFor] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [status, setStatus] = useState<"paid" | "pending">("paid");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------- Populate Form ---------- */
  useEffect(() => {
    if (!payment) return;

    setMonthFor(payment.monthFor.slice(0, 7)); // ✅ YYYY-MM
    setAmount(String(payment.amount));
    setPaymentDate(payment.paymentDate);
    setStatus(payment.status || "paid");
    setNotes(payment.notes || "");
  }, [payment]);

  /* ---------- Submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const normalizedMonthFor = `${monthFor}-01`;

    const { error } = await supabase
      .from("payments")
      .update({
        month_for: normalizedMonthFor,
        amount: Number(amount),
        payment_date: paymentDate,
        status: status,
        notes: notes || null,
      })
      .eq("id", payment.id);

    if (error) {
      console.error("Update payment error:", error);
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Payment updated");
    onPaymentUpdated?.();
    onOpenChange(false);
    setLoading(false);
  };

  /* ---------- UI ---------- */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Payment Record</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Month Paid For</Label>
              <Input
                type="month"
                value={monthFor}
                onChange={(e) => setMonthFor(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any additional details..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
