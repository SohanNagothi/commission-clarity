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
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

/* ---------- Types ---------- */

export interface Client {
  id: string;
  name: string;
  phone: string;
  default_fee: number;
  commission_rate: number;
}

interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onClientUpdated?: () => void;
}

/* ---------- Component ---------- */

export function EditClientDialog({
  open,
  onOpenChange,
  client,
  onClientUpdated,
}: EditClientDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [defaultFee, setDefaultFee] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefill form when client changes
  useEffect(() => {
    if (client) {
      setName(client.name);
      setPhone(client.phone);
      setDefaultFee(String(client.default_fee));
      setCommissionRate(String(client.commission_rate));
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    setLoading(true);

    const { error } = await supabase
      .from("clients")
      .update({
        name: name.trim(),
        phone: phone.trim(),
        default_fee: Number(defaultFee),
        commission_rate: Number(commissionRate),
      })
      .eq("id", client.id);

    if (error) {
      console.error(error);
      toast.error("Failed to update client");
      setLoading(false);
      return;
    }

    toast.success("Client updated successfully");
    onClientUpdated?.();
    onOpenChange(false);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Client Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          {/* Default Fee */}
          <div className="space-y-2">
            <Label htmlFor="defaultFee">Default Fee (₹)</Label>
            <Input
              id="defaultFee"
              type="number"
              value={defaultFee}
              onChange={(e) => setDefaultFee(e.target.value)}
              required
            />
          </div>

          {/* Commission Rate */}
          <div className="space-y-2">
            <Label htmlFor="commissionRate">Commission (%)</Label>
            <Input
              id="commissionRate"
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              required
            />
          </div>

          {/* Actions */}
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
