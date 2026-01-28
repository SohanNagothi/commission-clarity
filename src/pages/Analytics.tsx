import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/* ----------------------------- Types ----------------------------- */

interface MonthlyData {
  monthKey: string; // YYYY-MM (for sorting)
  monthLabel: string; // Jan 2025 (for display)
  earnings: number;
  received: number;
  pending: number;
}

interface ClientData {
  name: string;
  earnings: number;
}

/* ----------------------------- Helpers ----------------------------- */

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getMonthLabel = (date: Date) =>
  date.toLocaleString("default", { month: "short", year: "numeric" });

/* ----------------------------- Component ----------------------------- */

export default function Analytics() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [topClients, setTopClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        /* ---------- Payments (USE payment_date) ---------- */
        const { data: payments, error: paymentsError } = await supabase
          .from("payments")
          .select(`
            amount,
            payment_date,
            clients (
              name,
              commission_rate
            )
          `);

        if (paymentsError) throw paymentsError;

        /* ---------- Settlements ---------- */
        const { data: settlements, error: settlementsError } = await supabase
          .from("settlements")
          .select("amount, settlement_date");

        if (settlementsError) throw settlementsError;

        /* ---------- Monthly Aggregation ---------- */
        const monthMap = new Map<string, MonthlyData>();

        // Earnings
        payments?.forEach((p: any) => {
          if (!p.payment_date) return;

          const date = new Date(p.payment_date);
          const key = getMonthKey(date);
          const label = getMonthLabel(date);
          const rate = p.clients?.commission_rate ?? 0;
          const commission = (p.amount * rate) / 100;

          if (!monthMap.has(key)) {
            monthMap.set(key, {
              monthKey: key,
              monthLabel: label,
              earnings: 0,
              received: 0,
              pending: 0,
            });
          }

          monthMap.get(key)!.earnings += commission;
        });

        // Received
        settlements?.forEach((s: any) => {
          if (!s.settlement_date) return;

          const date = new Date(s.settlement_date);
          const key = getMonthKey(date);
          const label = getMonthLabel(date);

          if (!monthMap.has(key)) {
            monthMap.set(key, {
              monthKey: key,
              monthLabel: label,
              earnings: 0,
              received: 0,
              pending: 0,
            });
          }

          monthMap.get(key)!.received += s.amount;
        });

        // Pending
        monthMap.forEach((m) => {
          m.pending = Math.max(m.earnings - m.received, 0);
        });

        // Sort by month
        const sortedMonthly = Array.from(monthMap.values()).sort(
          (a, b) => a.monthKey.localeCompare(b.monthKey)
        );

        setMonthlyData(sortedMonthly);

        /* ---------- Top Clients ---------- */
        const clientMap = new Map<string, number>();

        payments?.forEach((p: any) => {
          const name = p.clients?.name ?? "Unknown";
          const rate = p.clients?.commission_rate ?? 0;
          const commission = (p.amount * rate) / 100;

          clientMap.set(name, (clientMap.get(name) ?? 0) + commission);
        });

        const top = Array.from(clientMap.entries())
          .map(([name, earnings]) => ({ name, earnings }))
          .sort((a, b) => b.earnings - a.earnings)
          .slice(0, 5);

        setTopClients(top);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  /* ----------------------------- Tooltip ----------------------------- */

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-card border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm" style={{ color: p.color }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  };

  /* ----------------------------- UI ----------------------------- */

  return (
    <div className="page-container section-spacing">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-headline">Analytics</h1>
        <p className="text-muted-foreground">
          Earnings based on actual payment dates
        </p>
      </motion.div>

      {loading ? (
        <p className="text-center py-12 text-muted-foreground">
          Loading analytics...
        </p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Earnings */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Earnings</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthLabel" />
                  <YAxis tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    dataKey="earnings"
                    name="Earnings"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.25}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pending */}
          <Card>
            <CardHeader>
              <CardTitle>Pending</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthLabel" />
                  <YAxis tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    dataKey="pending"
                    name="Pending"
                    stroke="hsl(var(--warning))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Earnings vs Received */}
          <Card>
            <CardHeader>
              <CardTitle>Earnings vs Received</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthLabel" />
                  <YAxis tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="earnings" name="Earnings" fill="hsl(var(--primary))" />
                  <Bar dataKey="received" name="Received" fill="hsl(var(--success))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Clients */}
          <Card>
            <CardHeader>
              <CardTitle>Top Clients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topClients.map((c, i) => (
                <div key={c.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{c.name}</p>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(c.earnings)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
