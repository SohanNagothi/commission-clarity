import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Wallet, Clock, Calendar, Plus, Copy } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentCard } from "@/components/PaymentRow";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { Payment } from "@/components/PaymentRow";

export default function Dashboard() {
  const { profile, loading: authLoading } = useAuth();
  const [totalCommission, setTotalCommission] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [pending, setPending] = useState(0);
  const [thisMonth, setThisMonth] = useState(0);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const [openingExists, setOpeningExists] = useState(false);

  /* ---------- Opening Balance Dialog ---------- */
  const [openDialog, setOpenDialog] = useState(false);
  const [openingAmount, setOpeningAmount] = useState("");
  const [savingOpening, setSavingOpening] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchDashboard = async () => {
      setLoading(true);

      try {
        const userId = profile.id;

        /* =========================
           Payments
        ========================= */
        const { data: payments } = await supabase
          .from("payments")
          .select(`
            id,
            amount,
            payment_date,
            month_for,
            client_id,
            is_opening_balance,
            clients (
              name,
              commission_rate
            )
          `)
          .eq("user_id", userId);

        /* =========================
           Settlements
        ========================= */
        const { data: settlements } = await supabase
          .from("settlements")
          .select("amount")
          .eq("user_id", userId);

        const hasOpening =
          payments?.some((p: any) => p.is_opening_balance) ?? false;
        setOpeningExists(hasOpening);

        /* =========================
           Total Commission
        ========================= */
        const commissionTotal =
          payments?.reduce((sum, p: any) => {
            if (p.is_opening_balance) return sum + p.amount;
            const rate = p.clients?.commission_rate ?? 0;
            return sum + p.amount * (rate / 100);
          }, 0) ?? 0;

        setTotalCommission(commissionTotal);

        /* =========================
           Received
        ========================= */
        const receivedTotal =
          settlements?.reduce((sum, s) => sum + s.amount, 0) ?? 0;
        setTotalReceived(receivedTotal);

        /* =========================
           Pending
        ========================= */
        setPending(Math.max(commissionTotal - receivedTotal, 0));

        /* =========================
           This Month
        ========================= */
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const thisMonthTotal =
          payments?.reduce((sum, p: any) => {
            if (p.is_opening_balance) return sum;
            const d = new Date(p.payment_date);
            if (d >= monthStart && d <= monthEnd) {
              const rate = p.clients?.commission_rate ?? 0;
              return sum + p.amount * (rate / 100);
            }
            return sum;
          }, 0) ?? 0;

        setThisMonth(thisMonthTotal);

        /* =========================
           Recent Payments
        ========================= */
        const recent: Payment[] =
          payments
            ?.filter((p: any) => !p.is_opening_balance)
            .map((p: any) => ({
              id: p.id,
              clientId: p.client_id,
              clientName: p.clients?.name ?? "Unknown",
              amount: p.amount,
              monthFor: p.month_for,
              paymentDate: p.payment_date,
            }))
            .sort(
              (a, b) =>
                new Date(b.paymentDate).getTime() -
                new Date(a.paymentDate).getTime()
            )
            .slice(0, 5) ?? [];

        setRecentPayments(recent);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [profile?.id]);

  const copyInviteCode = () => {
    if (profile?.org_invite_code) {
      navigator.clipboard.writeText(profile.org_invite_code);
      toast.success("Teacher Invite Code copied!");
    }
  };

  if (authLoading) return null;

  return (
    <div className="page-container section-spacing">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-display mb-1">Teacher Portal</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Teacher'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 p-3 bg-accent/5 border border-accent/20 rounded-xl">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-accent/70">My Invite Code</p>
                <p className="text-lg font-mono font-bold tracking-widest text-accent">
                  {profile?.org_invite_code || "-------"}
                </p>
              </div>
              <Button onClick={copyInviteCode} variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent/10 hover:text-accent">
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {!openingExists && (
              <Button onClick={() => setOpenDialog(true)} variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Previous Pending
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid-stats">
        <StatCard title="Total Commission" value={formatCurrency(totalCommission)} icon={TrendingUp} />
        <StatCard title="Received" value={formatCurrency(totalReceived)} icon={Wallet} variant="success" />
        <StatCard title="Pending" value={formatCurrency(pending)} icon={Clock} variant="warning" />
        <StatCard title="This Month" value={formatCurrency(thisMonth)} icon={Calendar} variant="accent" />
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayments.map((p, i) => (
            <PaymentCard key={p.id} payment={p} index={i} />
          ))}
        </CardContent>
      </Card>

      {/* Opening Balance Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Previous Pending</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
                placeholder="e.g. 25000"
              />
            </div>

            <Button
              className="w-full"
              onClick={saveOpeningBalance}
              disabled={savingOpening}
            >
              {savingOpening ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
