import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  status: "paid" | "pending";
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
        <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
          {formatMonthYear(payment.monthFor)}
        </td>
        <td className="py-4 px-4 font-semibold text-primary whitespace-nowrap">
          {formatCurrency(payment.amount)}
        </td>
        <td className="py-4 px-4">
          <Badge
            variant={payment.status === 'paid' ? 'success' : 'warning'}
            className="capitalize flex items-center w-fit gap-1"
          >
            {payment.status === 'paid' ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {payment.status}
          </Badge>
        </td>
        <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
          {formatDate(payment.paymentDate)}
        </td>
        <td className="py-4 px-4 text-muted-foreground max-w-[200px] truncate">
          {payment.notes || "—"}
        </td>
        <td className="py-4 px-4">
          <div className="flex gap-1 justify-end">
            <Button size="icon" variant="ghost" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive font-bold"
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
        className="p-4 bg-card border rounded-2xl space-y-4 shadow-sm"
      >
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-lg">{payment.clientName}</p>
              <Badge
                variant={payment.status === 'paid' ? 'success' : 'warning'}
                className="capitalize text-[10px] px-1.5"
              >
                {payment.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatMonthYear(payment.monthFor)}
            </p>
          </div>
          <span className="font-bold text-xl text-primary">
            {formatCurrency(payment.amount)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
          <span>Date: {formatDate(payment.paymentDate)}</span>
          {payment.notes && <span className="italic truncate max-w-[150px]">{payment.notes}</span>}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" className="h-9 px-3 gap-1.5" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-9 px-3 text-destructive hover:bg-destructive/10 gap-1.5"
            onClick={async () => {
              const confirmed = confirm("Delete this payment?");
              if (!confirmed) return;
              await supabase.from("payments").delete().eq("id", payment.id);
              toast.success("Payment deleted");
              onUpdated?.();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
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
