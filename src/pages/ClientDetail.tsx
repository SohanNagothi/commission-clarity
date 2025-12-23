import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, DollarSign, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddPaymentDialog } from "@/components/AddPaymentDialog";
import { PaymentCard } from "@/components/PaymentRow";
import { clients, getClientPayments } from "@/data/mockData";

export default function ClientDetail() {
  const { id } = useParams();
  const client = clients.find((c) => c.id === id);
  const clientPayments = id ? getClientPayments(id) : [];

  if (!client) {
    return (
      <div className="page-container">
        <div className="text-center py-20">
          <h2 className="text-headline mb-4">Client not found</h2>
          <Link to="/clients">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back to Clients
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Group payments by month
  const paymentsByMonth = clientPayments.reduce((acc, payment) => {
    const month = payment.monthFor;
    if (!acc[month]) acc[month] = [];
    acc[month].push(payment);
    return acc;
  }, {} as Record<string, typeof clientPayments>);

  const sortedMonths = Object.keys(paymentsByMonth).sort().reverse();

  const totalPaid = clientPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalCommission = totalPaid * (client.commissionPercentage / 100);

  return (
    <div className="page-container section-spacing">
      {/* Back button */}
      <Link to="/clients">
        <Button variant="ghost" size="sm" className="-ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Button>
      </Link>

      {/* Client Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-muted flex items-center justify-center">
            <span className="font-bold text-2xl text-primary">
              {client.name.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-headline">{client.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              {client.email}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={
              client.status === "active" ? "status-active" : "status-inactive"
            }
          >
            {client.status}
          </span>
          <AddPaymentDialog preselectedClientId={client.id} />
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Card variant="stat">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary-muted">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Default Fee</p>
              <p className="text-xl font-bold">${client.defaultFee}</p>
            </div>
          </div>
        </Card>
        <Card variant="stat">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent-muted">
              <Percent className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Commission Rate</p>
              <p className="text-xl font-bold">{client.commissionPercentage}%</p>
            </div>
          </div>
        </Card>
        <Card variant="stat">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success-muted">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earned</p>
              <p className="text-xl font-bold">${totalCommission.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Payment History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedMonths.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No payments recorded yet.
              </p>
            ) : (
              <div className="space-y-6">
                {sortedMonths.map((month) => {
                  const monthName = new Date(month + "-01").toLocaleDateString(
                    "en-US",
                    { month: "long", year: "numeric" }
                  );
                  return (
                    <div key={month}>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-3">
                        {monthName}
                      </h4>
                      <div className="space-y-3">
                        {paymentsByMonth[month].map((payment, index) => (
                          <PaymentCard
                            key={payment.id}
                            payment={payment}
                            index={index}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
