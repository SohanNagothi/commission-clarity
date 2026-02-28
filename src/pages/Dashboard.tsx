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
import { Badge } from "@/components/ui/badge";
import type { Payment } from "@/components/PaymentRow";

export default function Dashboard() {
  const { profile, loading: authLoading } = useAuth();
  const [totalCommission, setTotalCommission] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [pending, setPending] = useState(0);
  const [thisMonth, setThisMonth] = useState(0);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestRequest, setLatestRequest] = useState<any>(null);

  const [openingExists, setOpeningExists] = useState(false);

  /* ---------- Opening Balance Dialog ---------- */
  const [openDialog, setOpenDialog] = useState(false);
  const [openingAmount, setOpeningAmount] = useState("");
  const [savingOpening, setSavingOpening] = useState(false);

  /* ---------- Payout Request Dialog ---------- */
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [requestingPayout, setRequestingPayout] = useState(false);

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
            status,
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
            if (p.status !== 'paid' && p.status !== 'approved') return sum;
            const rate = p.clients?.commission_rate ?? 60;
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
              const rate = p.clients?.commission_rate ?? 60;
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
              status: p.status || "paid",
            }))
            .sort(
              (a, b) =>
                new Date(b.paymentDate).getTime() -
                new Date(a.paymentDate).getTime()
            )
            .slice(0, 5) ?? [];

        setRecentPayments(recent);

        /* =========================
           Latest Payout Request
        ========================= */
        const { data: requests } = await supabase
          .from("payout_requests")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (requests && requests.length > 0) {
          setLatestRequest(requests[0]);
        }
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

  const saveOpeningBalance = async () => {
    if (!profile?.id || !openingAmount) {
      toast.error("Please enter an amount");
      return;
    }

    setSavingOpening(true);
    try {
      const { error } = await supabase.from("payments").insert({
        user_id: profile.id,
        amount: Number(openingAmount),
        is_opening_balance: true,
        payment_date: new Date().toISOString().split('T')[0],
        status: 'paid',
        month_for: new Date().toISOString().split('T')[0],
      });

      if (error) throw error;

      toast.success("Opening balance added successfully!");
      setOpenDialog(false);
      // Simplest way to refresh all stats
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save opening balance");
    } finally {
      setSavingOpening(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!profile?.id || !profile?.owner_id) {
      toast.error("Profile information missing");
      return;
    }

    if (!payoutAmount || Number(payoutAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (Number(payoutAmount) > pending) {
      toast.error("You cannot request more than your pending commission");
      return;
    }

    setRequestingPayout(true);
    try {
      const { error } = await supabase.from("payout_requests").insert({
        user_id: profile.id,
        owner_id: profile.owner_id,
        amount: Number(payoutAmount),
        notes: payoutNotes.trim() || null,
        status: 'pending'
      });

      if (error) throw error;

      toast.success("Payout request submitted!");
      setPayoutDialogOpen(false);
      setPayoutAmount("");
      setPayoutNotes("");

      // Refresh latest request
      const { data } = await supabase
        .from("payout_requests")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (data && data.length > 0) setLatestRequest(data[0]);

    } catch (err) {
      console.error(err);
      toast.error("Failed to submit payout request");
    } finally {
      setRequestingPayout(false);
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

            <Button onClick={() => setPayoutDialogOpen(true)} className="gap-2 bg-primary">
              <Plus className="h-4 w-4" />
              Request Payout
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid-stats">
        <StatCard title="Total Commission" value={formatCurrency(totalCommission)} icon={TrendingUp} />
        <StatCard title="Received" value={formatCurrency(totalReceived)} icon={Wallet} variant="success" />
        <StatCard title="Pending" value={formatCurrency(pending)} icon={Clock} variant="warning" />
        <StatCard title="This Month" value={formatCurrency(thisMonth)} icon={Calendar} variant="accent" />
      </div>

      {latestRequest && latestRequest.status === 'pending' && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-warning/10 border border-warning/20 p-4 rounded-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/20 rounded-lg">
              <Clock className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-sm font-bold">Payout Request Pending</p>
              <p className="text-xs text-muted-foreground">You requested {formatCurrency(latestRequest.amount)} on {new Date(latestRequest.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <Badge variant="warning">Awaiting Owner Approval</Badge>
        </motion.div>
      )}

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/5">
              <p className="text-sm font-medium">No recent payments recorded yet.</p>
              <p className="text-[10px] mt-1 opacity-50">Your payment history will appear here once clients start paying.</p>
            </div>
          ) : (
            recentPayments.map((p, i) => (
              <PaymentCard key={p.id} payment={p} index={i} />
            ))
          )}
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

      {/* Payout Request Dialog */}
      <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Payout</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Available to Request</p>
              <p className="text-2xl font-black">{formatCurrency(pending)}</p>
            </div>

            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder="e.g. 5000"
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
                placeholder="e.g. Urgently needed for..."
              />
            </div>

            <Button
              className="w-full"
              onClick={handleRequestPayout}
              disabled={requestingPayout || Number(payoutAmount) <= 0}
            >
              {requestingPayout ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
