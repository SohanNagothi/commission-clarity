import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Clock, Wallet } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddSettlementDialog } from "@/components/AddSettlementDialog";
import { SettlementRow, SettlementCard } from "@/components/SettlementRow";
import { formatCurrency, formatDate } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/* ---------- Types ---------- */

interface Settlement {
  id: string;
  amount: number;
  settlement_date: string;
  date: string; // mapped from settlement_date for components
  notes?: string | null;
}

/* ---------- Component ---------- */

export default function Settlements() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [loading, setLoading] = useState(true);

  const pending = Math.max(totalCommission - totalReceived, 0);
  const progressPercentage =
    totalCommission > 0
      ? Math.round((totalReceived / totalCommission) * 100)
      : 0;

  /* ---------- Fetch Data ---------- */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch payments with client commission rate
        const { data: payments, error: paymentsError } = await supabase
          .from("payments")
          .select(`
            amount,
            clients (commission_rate)
          `);

        if (paymentsError) throw paymentsError;

        const commissionTotal =
          payments?.reduce((sum, p: any) => {
            const rate = p.clients?.commission_rate ?? 0;
            return sum + p.amount * (rate / 100);
          }, 0) ?? 0;

        setTotalCommission(commissionTotal);

        // Fetch settlements
        const { data: settlementsData, error: settlementsError } = await supabase
          .from("settlements")
          .select("id, amount, settlement_date, notes")
          .order("settlement_date", { ascending: false });

        if (settlementsError) throw settlementsError;

        // Map settlement_date → date to satisfy expected type
        const mappedSettlements: Settlement[] =
          (settlementsData || []).map((s) => ({
            ...s,
            date: s.settlement_date,
          }));

        setSettlements(mappedSettlements);

        const receivedTotal =
          mappedSettlements.reduce((sum, s) => sum + s.amount, 0) ?? 0;

        setTotalReceived(receivedTotal);
      } catch (error: any) {
        console.error(error);
        toast.error("Failed to load settlements data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ---------- UI ---------- */
  return (
    <div className="page-container section-spacing">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-headline">Settlements</h1>
          <p className="text-muted-foreground">
            Track payments received from owner/platform
          </p>
        </motion.div>
        <AddSettlementDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Earned"
          value={formatCurrency(totalCommission)}
          subtitle="Your commission"
          icon={TrendingUp}
        />
        <StatCard
          title="Received"
          value={formatCurrency(totalReceived)}
          subtitle="Already paid to you"
          icon={Wallet}
          variant="success"
        />
        <StatCard
          title="Pending"
          value={formatCurrency(pending)}
          subtitle="Still owed to you"
          icon={Clock}
          variant="warning"
        />
      </div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-card border rounded-xl"
      >
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Settlement Progress</span>
          <span className="font-medium">{progressPercentage}% received</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-success to-primary"
          />
        </div>
      </motion.div>

      {/* Settlement History */}
      <Card>
        <CardHeader>
          <CardTitle>Settlement History</CardTitle>
        </CardHeader>

        <CardContent className="p-0 lg:p-6 lg:pt-0">
          {loading ? (
            <p className="text-center py-12 text-muted-foreground">
              Loading settlements...
            </p>
          ) : settlements.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">
              No settlements recorded yet.
            </p>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left text-sm text-muted-foreground">
                        Amount
                      </th>
                      <th className="py-3 px-4 text-left text-sm text-muted-foreground">
                        Date
                      </th>
                      <th className="py-3 px-4 text-left text-sm text-muted-foreground">
                        Notes
                      </th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlements.map((s, i) => (
                      <SettlementRow key={s.id} settlement={s} index={i} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="lg:hidden p-4 space-y-3">
                {settlements.map((s, i) => (
                  <SettlementCard key={s.id} settlement={s} index={i} />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
