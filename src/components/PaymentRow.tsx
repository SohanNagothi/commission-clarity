import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatMonthYear } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { EditPaymentDialog } from "@/components/EditPaymentDialog";

/* ---------- Types ---------- */

export interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  monthFor: string;
  amount: number;
  paymentDate: string;
  notes?: string | null;
}

interface PaymentRowProps {
  payment: Payment;
  index?: number;
  onUpdated?: () => void;
}

/* ---------- Desktop Row ---------- */

export function PaymentRow({ payment, index = 0, onUpdated }: PaymentRowProps) {
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    const confirmed = confirm("Delete this payment?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", payment.id);

    if (error) {
      toast.error("Failed to delete payment");
      return;
    }

    toast.success("Payment deleted");
    onUpdated?.();
  };

  return (
    <>
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: index * 0.03 }}
        className="border-b last:border-0 hover:bg-muted/50 transition-colors"
      >
        <td className="py-4 px-4 font-medium">{payment.clientName}</td>
        <td className="py-4 px-4 text-muted-foreground">
          {formatMonthYear(payment.monthFor)}
        </td>
        <td className="py-4 px-4 font-semibold text-primary">
          {formatCurrency(payment.amount)}
        </td>
        <td className="py-4 px-4 text-muted-foreground">
          {formatDate(payment.paymentDate)}
        </td>
        <td className="py-4 px-4 text-muted-foreground">
          {payment.notes || "—"}
        </td>
        <td className="py-4 px-4">
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </motion.tr>

      <EditPaymentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        payment={payment}
        onPaymentUpdated={onUpdated}
      />
    </>
  );
}

/* ---------- Mobile Card ---------- */

export function PaymentCard({ payment, index = 0, onUpdated }: PaymentRowProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.03 }}
        className="p-4 bg-card border rounded-xl space-y-3"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold">{payment.clientName}</p>
            <p className="text-sm text-muted-foreground">
              {formatMonthYear(payment.monthFor)}
            </p>
          </div>
          <span className="font-bold text-lg text-primary">
            {formatCurrency(payment.amount)}
          </span>
        </div>

        <div className="text-sm text-muted-foreground">
          Paid on {formatDate(payment.paymentDate)}
        </div>

        {payment.notes && (
          <p className="text-sm text-muted-foreground">{payment.notes}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button size="icon" variant="ghost" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive"
            onClick={async () => {
              const confirmed = confirm("Delete this payment?");
              if (!confirmed) return;
              await supabase.from("payments").delete().eq("id", payment.id);
              toast.success("Payment deleted");
              onUpdated?.();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <EditPaymentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        payment={payment}
        onPaymentUpdated={onUpdated}
      />
    </>
  );
}
