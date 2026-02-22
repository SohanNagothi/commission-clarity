import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ListFilter } from "lucide-react";
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
import { PaymentRow, PaymentCard, Payment } from "@/components/PaymentRow";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/* ---------- Types ---------- */

interface Client {
  id: string;
  name: string;
}

/* ---------- Component ---------- */

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const [clientFilter, setClientFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  /* ---------- Fetch Data ---------- */

  const fetchData = async () => {
    setLoading(true);

    const [{ data: paymentsData, error: paymentsError }, { data: clientsData, error: clientsError }] =
      await Promise.all([
        supabase
          .from("payments")
          .select(
            `
            id,
            client_id,
            month_for,
            amount,
            payment_date,
            status,
            notes,
            clients ( name )
          `
          )
          .order("payment_date", { ascending: false }),

        supabase.from("clients").select("id, name").order("name"),
      ]);

    if (paymentsError || clientsError) {
      console.error(paymentsError || clientsError);
      toast.error("Failed to load payments");
      setLoading(false);
      return;
    }

    setPayments(
      (paymentsData || []).map((p: any) => ({
        id: p.id,
        clientId: p.client_id,
        clientName: p.clients?.name ?? "Unknown",
        monthFor: p.month_for,
        amount: p.amount,
        paymentDate: p.payment_date,
        status: p.status || "paid",
        notes: p.notes,
      }))
    );

    setClients(clientsData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---------- Derived Data ---------- */

  const uniqueMonths = useMemo(
    () =>
      [...new Set(payments.map((p) => p.monthFor))]
        .sort()
        .reverse(),
    [payments]
  );

  const filteredPayments = payments
    .filter((payment) => {
      const matchesClient =
        clientFilter === "all" || payment.clientId === clientFilter;
      const matchesMonth =
        monthFilter === "all" || payment.monthFor === monthFilter;
      const matchesStatus =
        statusFilter === "all" || payment.status === statusFilter;
      const matchesSearch =
        payment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (payment.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false);

      return matchesClient && matchesMonth && matchesStatus && matchesSearch;
    });

  const totalAmount = filteredPayments.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  /* ---------- UI ---------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-display mb-1">Payments</h1>
          <p className="text-muted-foreground">
            Monitor and manage all client fee records
          </p>
        </motion.div>
        <AddPaymentDialog />
      </div>

      {/* Filters Bar */}
      <Card className="p-4 bg-muted/30 border-none shadow-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student or notes..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="bg-background">
              <div className="flex items-center gap-2">
                <Filter className="h-3 w-3 text-muted-foreground" />
                <SelectValue placeholder="All Students" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="bg-background">
              <div className="flex items-center gap-2">
                <ListFilter className="h-3 w-3 text-muted-foreground" />
                <SelectValue placeholder="All Months" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {uniqueMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {formatMonthYear(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Summary Stat */}
      <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-2xl">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            Showing <span className="text-foreground font-bold">{filteredPayments.length}</span> payments
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground uppercase font-bold tracking-tighter">Total Value</span>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>

      {/* List */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading fee records...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-20 bg-muted/10 rounded-xl m-4 border-2 border-dashed border-muted">
              <IndianRupee className="h-12 w-12 mx-auto mb-4 opacity-10" />
              <p className="text-lg font-medium text-muted-foreground">No records found</p>
              <p className="text-sm text-muted-foreground/60">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Student</th>
                      <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Month</th>
                      <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Amount</th>
                      <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                      <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Date</th>
                      <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Notes</th>
                      <th className="py-4 px-6 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredPayments.map((payment, index) => (
                      <PaymentRow
                        key={payment.id}
                        payment={payment}
                        index={index}
                        onUpdated={fetchData}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile List */}
              <div className="lg:hidden p-4 space-y-4">
                {filteredPayments.map((payment, index) => (
                  <PaymentCard
                    key={payment.id}
                    payment={payment}
                    index={index}
                    onUpdated={fetchData}
                  />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
