import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { EditSettlementDialog } from "@/components/EditSettlementDialog";

export interface Settlement {
  id: string;
  amount: number;
  date: string;
  notes?: string;
}

interface SettlementRowProps {
  settlement: Settlement;
  index?: number;
  onDelete?: (id: string) => void;
}

/* ======================
   Desktop Table Row
====================== */

import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function SettlementRow({
  settlement,
  index = 0,
  onDelete,
}: SettlementRowProps) {
  const handleDelete = async () => {
    const confirmed = confirm("Delete this settlement?");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("settlements")
        .delete()
        .eq("id", settlement.id);

      if (error) throw error;

      toast.success("Settlement deleted");
      onDelete?.(settlement.id); // update parent state
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete settlement");
    }
  };

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
    >
      <td className="py-4 px-4">
        <span className="font-semibold text-success">
          {formatCurrency(settlement.amount)}
        </span>
      </td>

      <td className="py-4 px-4 text-muted-foreground">
        {formatDate(settlement.date)}
      </td>

      <td className="py-4 px-4 text-muted-foreground">
        {settlement.notes || "—"}
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <EditSettlementDialog settlement={settlement} onUpdate={onDelete} />
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
  );
}


/* ======================
   Mobile Card
====================== */

export function SettlementCard({
  settlement,
  index = 0,
  onDelete,
}: SettlementRowProps) {
  const handleDelete = async () => {
    const confirmed = confirm("Delete this settlement?");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("settlements")
        .delete()
        .eq("id", settlement.id);

      if (error) throw error;

      toast.success("Settlement deleted");
      onDelete?.(settlement.id); // update parent state
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete settlement");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="p-4 bg-card border rounded-xl space-y-2"
    >
      <div className="flex justify-between items-start">
        <span className="font-bold text-lg text-success">
          {formatCurrency(settlement.amount)}
        </span>
        <span className="text-sm text-muted-foreground">
          {formatDate(settlement.date)}
        </span>
      </div>

      {settlement.notes && (
        <p className="text-sm text-muted-foreground">{settlement.notes}</p>
      )}

      <div className="flex gap-2 pt-2">
        <EditSettlementDialog settlement={settlement} onUpdate={onDelete} />
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
    </motion.div>
  );
}
