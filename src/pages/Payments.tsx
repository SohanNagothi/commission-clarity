import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddPaymentDialog } from "@/components/AddPaymentDialog";
import { PaymentRow, PaymentCard } from "@/components/PaymentRow";
import { payments, clients } from "@/data/mockData";

export default function Payments() {
  const [clientFilter, setClientFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Get unique months from payments
  const uniqueMonths = [...new Set(payments.map((p) => p.monthFor))].sort().reverse();

  const filteredPayments = payments
    .filter((payment) => {
      const matchesClient =
        clientFilter === "all" || payment.clientId === clientFilter;
      const matchesMonth =
        monthFilter === "all" || payment.monthFor === monthFilter;
      const matchesSearch =
        payment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (payment.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesClient && matchesMonth && matchesSearch;
    })
    .sort(
      (a, b) =>
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="page-container section-spacing">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-headline">Payments</h1>
          <p className="text-muted-foreground">
            All client payments in one place
          </p>
        </motion.div>
        <AddPaymentDialog />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {uniqueMonths.map((month) => (
              <SelectItem key={month} value={month}>
                {new Date(month + "-01").toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl"
      >
        <span className="text-sm text-muted-foreground">
          {filteredPayments.length} payment{filteredPayments.length !== 1 && "s"}
        </span>
        <span className="font-semibold">
          Total: ${totalAmount.toLocaleString()}
        </span>
      </motion.div>

      {/* Payments List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="hidden lg:block">
            <CardTitle>Payment Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0 lg:p-6 lg:pt-0">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Month For
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Payment Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment, index) => (
                    <PaymentRow key={payment.id} payment={payment} index={index} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 space-y-3">
              {filteredPayments.map((payment, index) => (
                <PaymentCard key={payment.id} payment={payment} index={index} />
              ))}
            </div>

            {filteredPayments.length === 0 && (
              <p className="text-center py-12 text-muted-foreground">
                No payments found matching your filters.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
