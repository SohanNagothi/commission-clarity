import { motion } from "framer-motion";
import { formatCurrency, formatDate, formatMonthYear } from "@/lib/format";
import type { Payment } from "@/data/mockData";

interface PaymentRowProps {
  payment: Payment;
  index?: number;
}

export function PaymentRow({ payment, index = 0 }: PaymentRowProps) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
    >
      <td className="py-4 px-4">
        <div className="font-medium">{payment.clientName}</div>
      </td>
      <td className="py-4 px-4 text-muted-foreground">
        {formatMonthYear(payment.monthFor)}
      </td>
      <td className="py-4 px-4">
        <span className="font-semibold text-primary">{formatCurrency(payment.amount)}</span>
      </td>
      <td className="py-4 px-4 text-muted-foreground">{formatDate(payment.paymentDate)}</td>
      <td className="py-4 px-4 text-muted-foreground">
        {payment.notes || "—"}
      </td>
    </motion.tr>
  );
}

export function PaymentCard({ payment, index = 0 }: PaymentRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="p-4 bg-card border rounded-xl"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold">{payment.clientName}</p>
          <p className="text-sm text-muted-foreground">{formatMonthYear(payment.monthFor)}</p>
        </div>
        <span className="font-bold text-lg text-primary">{formatCurrency(payment.amount)}</span>
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Paid on {formatDate(payment.paymentDate)}</span>
        {payment.notes && <span>{payment.notes}</span>}
      </div>
    </motion.div>
  );
}
