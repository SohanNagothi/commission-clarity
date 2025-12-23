import { motion } from "framer-motion";
import { TrendingUp, Wallet, Clock, Calendar } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentCard } from "@/components/PaymentRow";
import {
  calculateTotalCommission,
  calculateTotalReceived,
  calculatePending,
  calculateThisMonthEarnings,
  payments,
} from "@/data/mockData";

export default function Dashboard() {
  const totalCommission = calculateTotalCommission();
  const totalReceived = calculateTotalReceived();
  const pending = calculatePending();
  const thisMonth = calculateThisMonthEarnings();

  // Get recent payments (last 5)
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
    .slice(0, 5);

  return (
    <div className="page-container section-spacing">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-2"
      >
        <h1 className="text-headline">Dashboard</h1>
        <p className="text-muted-foreground">
          Your commission overview at a glance
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid-stats">
        <StatCard
          title="Total Commission"
          value={`$${totalCommission.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          subtitle="All time earnings"
          icon={TrendingUp}
          variant="default"
          delay={0}
        />
        <StatCard
          title="Received"
          value={`$${totalReceived.toLocaleString()}`}
          subtitle="From owner/platform"
          icon={Wallet}
          variant="success"
          delay={0.05}
        />
        <StatCard
          title="Pending"
          value={`$${pending.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          subtitle="Awaiting settlement"
          icon={Clock}
          variant="warning"
          delay={0.1}
        />
        <StatCard
          title="This Month"
          value={`$${thisMonth.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          subtitle="December 2024"
          icon={Calendar}
          trend={{ value: 12, positive: true }}
          variant="accent"
          delay={0.15}
        />
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPayments.map((payment, index) => (
                <PaymentCard key={payment.id} payment={payment} index={index} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
