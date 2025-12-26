import { motion } from "framer-motion";
import { TrendingUp, Clock, Wallet } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddSettlementDialog } from "@/components/AddSettlementDialog";
import { SettlementRow, SettlementCard } from "@/components/SettlementRow";
import { formatCurrency } from "@/lib/format";
import {
  settlements,
  calculateTotalCommission,
  calculateTotalReceived,
  calculatePending,
} from "@/data/mockData";

export default function Settlements() {
  const totalCommission = calculateTotalCommission();
  const totalReceived = calculateTotalReceived();
  const pending = calculatePending();

  const sortedSettlements = [...settlements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="page-container section-spacing">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
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
          variant="default"
          delay={0}
        />
        <StatCard
          title="Received"
          value={formatCurrency(totalReceived)}
          subtitle="Already paid to you"
          icon={Wallet}
          variant="success"
          delay={0.05}
        />
        <StatCard
          title="Pending"
          value={formatCurrency(pending)}
          subtitle="Still owed to you"
          icon={Clock}
          variant="warning"
          delay={0.1}
        />
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="p-4 bg-card border rounded-xl"
      >
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Settlement Progress</span>
          <span className="font-medium">
            {Math.round((totalReceived / totalCommission) * 100)}% received
          </span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(totalReceived / totalCommission) * 100}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-success to-primary rounded-full"
          />
        </div>
      </motion.div>

      {/* Settlements List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Settlement History</CardTitle>
          </CardHeader>
          <CardContent className="p-0 lg:p-6 lg:pt-0">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSettlements.map((settlement, index) => (
                    <SettlementRow
                      key={settlement.id}
                      settlement={settlement}
                      index={index}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 space-y-3">
              {sortedSettlements.map((settlement, index) => (
                <SettlementCard
                  key={settlement.id}
                  settlement={settlement}
                  index={index}
                />
              ))}
            </div>

            {sortedSettlements.length === 0 && (
              <p className="text-center py-12 text-muted-foreground">
                No settlements recorded yet.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
