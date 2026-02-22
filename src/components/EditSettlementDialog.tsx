import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import type { Settlement } from "@/components/SettlementRow";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

interface EditSettlementDialogProps {
  settlement: Settlement;
  onUpdate?: (id?: string) => void;
}

export function EditSettlementDialog({ settlement, onUpdate }: EditSettlementDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(settlement.amount.toString());
  const [date, setDate] = useState(settlement.date);
  const [notes, setNotes] = useState(settlement.notes || "");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("settlements")
      .update({
        amount: parseFloat(amount),
        settlement_date: date,
        notes: notes || null,
      })
      .eq("id", settlement.id);

    if (error) {
      toast.error("Failed to update settlement");
      console.error(error);
      return;
    }

    toast.success("Settlement updated successfully");
    setOpen(false);

    // Notify parent to refresh data
    if (onUpdate) onUpdate();
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Settlement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Amount Received (₹)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
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
            >
              Cancel
            </Button>
            <Button type="submit" variant="success" className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
