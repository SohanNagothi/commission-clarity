import { motion } from "framer-motion";
import type { Payment } from "@/data/mockData";

interface PaymentRowProps {
  payment: Payment;
  index?: number;
}

export function PaymentRow({ payment, index = 0 }: PaymentRowProps) {
  const monthName = new Date(payment.monthFor + "-01").toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );
  const paymentDate = new Date(payment.paymentDate).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

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
      <td className="py-4 px-4 text-muted-foreground">{monthName}</td>
      <td className="py-4 px-4">
        <span className="font-semibold">${payment.amount.toLocaleString()}</span>
      </td>
      <td className="py-4 px-4 text-muted-foreground">{paymentDate}</td>
      <td className="py-4 px-4 text-muted-foreground">
        {payment.notes || "—"}
      </td>
    </motion.tr>
  );
}

// Mobile-friendly card version
export function PaymentCard({ payment, index = 0 }: PaymentRowProps) {
  const monthName = new Date(payment.monthFor + "-01").toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );
  const paymentDate = new Date(payment.paymentDate).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

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
          <p className="text-sm text-muted-foreground">{monthName}</p>
        </div>
        <span className="font-bold text-lg">${payment.amount.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Paid on {paymentDate}</span>
        {payment.notes && <span>{payment.notes}</span>}
      </div>
    </motion.div>
  );
}
