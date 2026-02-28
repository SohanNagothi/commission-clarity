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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export function AddClientDialog({
  onClientAdded,
}: {
  onClientAdded?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [defaultFee, setDefaultFee] = useState("");
  const [commission, setCommission] = useState("60");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setPhone("");
    setDefaultFee("");
    setCommission("");
    setEmail("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    /* ---- Auth check ---- */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("You must be logged in");
      setLoading(false);
      return;
    }

    /* ---- Basic validation ---- */
    if (!name || !phone || !defaultFee || !commission) {
      toast.error("Please fill all required fields");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("clients").insert({
      user_id: user.id,
      name,
      phone,
      email: email || null,
      default_fee: Number(defaultFee),
      commission_rate: Number(commission),
      status: "active",
    });

    if (error) {
      console.error(error);
      toast.error("Failed to add client");
      setLoading(false);
      return;
    }

    toast.success("Client added successfully");
    onClientAdded?.();
    setOpen(false);
    resetForm();
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Client Name</Label>
            <Input
              id="name"
              placeholder="Priya Sharma"
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
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground">
              Provides automatic linking if the student uses this email to register.
            </p>
          </div>

          {/* Fees */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fee">Default Fee (₹)</Label>
              <Input
                id="fee"
                type="number"
                placeholder="5000"
                value={defaultFee}
                onChange={(e) => setDefaultFee(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission">Commission %</Label>
              <Input
                id="commission"
                type="number"
                placeholder="15"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                required
              />
            </div>
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
              {loading ? "Adding..." : "Add Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
