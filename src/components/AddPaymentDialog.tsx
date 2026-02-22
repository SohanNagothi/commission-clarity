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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

/* ---------- Types ---------- */

interface Client {
  id: string;
  name: string;
  status: "active" | "inactive";
}

interface AddPaymentDialogProps {
  preselectedClientId?: string;
}

/* ---------- Component ---------- */

export function AddPaymentDialog({
  preselectedClientId,
}: AddPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const [clientId, setClientId] = useState(preselectedClientId || "");
  const [monthFor, setMonthFor] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"paid" | "pending">("paid");
  const [loading, setLoading] = useState(false);

  /* ---------- Fetch Active Clients ---------- */
  useEffect(() => {
    if (!open || preselectedClientId) return;

    const fetchClients = async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, status")
        .eq("status", "active")
        .order("name");

      if (error) {
        console.error(error);
        toast.error("Failed to load clients");
        return;
      }

      setClients(data || []);
    };

    fetchClients();
  }, [open, preselectedClientId]);

  /* ---------- Submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      toast.error("Please select a client");
      return;
    }

    setLoading(true);

    try {
      /* ---- Get logged-in user ---- */
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        toast.error("You must be logged in to add payments");
        setLoading(false);
        return;
      }

      /* ---- Insert payment ---- */
      const { error } = await supabase.from("payments").insert({
        user_id: user.id, // 🔒 critical
        client_id: clientId,
        month_for: `${monthFor}-01`, // YYYY-MM → YYYY-MM-01
        amount: Number(amount),
        payment_date: paymentDate,
        status: status,
        notes: notes.trim() || null,
      });

      if (error) throw error;

      toast.success("Payment added successfully");
      setOpen(false);

      if (!preselectedClientId) setClientId("");
      setMonthFor("");
      setAmount("");
      setPaymentDate("");
      setStatus("paid");
      setNotes("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Add Payment
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Client */}
          {!preselectedClientId && (
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select value={clientId} onValueChange={setClientId} required>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Month */}
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

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)} required>
                <SelectTrigger id="status">
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
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
              />
            </div>

            {/* Payment Date */}
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Actions */}
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
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : "Add Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
