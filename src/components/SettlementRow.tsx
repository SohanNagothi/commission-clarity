import { motion } from "framer-motion";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Settlement } from "@/data/mockData";

interface SettlementRowProps {
  settlement: Settlement;
  index?: number;
}

export function SettlementRow({ settlement, index = 0 }: SettlementRowProps) {
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
      <td className="py-4 px-4 text-muted-foreground">{formatDate(settlement.date)}</td>
      <td className="py-4 px-4 text-muted-foreground">
        {settlement.notes || "—"}
      </td>
    </motion.tr>
  );
}

export function SettlementCard({ settlement, index = 0 }: SettlementRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="p-4 bg-card border rounded-xl"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="font-bold text-lg text-success">
          {formatCurrency(settlement.amount)}
        </span>
        <span className="text-sm text-muted-foreground">{formatDate(settlement.date)}</span>
      </div>
      {settlement.notes && (
        <p className="text-sm text-muted-foreground">{settlement.notes}</p>
      )}
    </motion.div>
  );
}
