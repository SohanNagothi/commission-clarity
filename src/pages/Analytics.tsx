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
import { getMonthlyData, getTopClients } from "@/data/mockData";

export default function Analytics() {
  const monthlyData = getMonthlyData();
  const topClients = getTopClients();

  return (
    <div className="page-container section-spacing">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-headline">Analytics</h1>
        <p className="text-muted-foreground">
          Insights into your earnings over time
        </p>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Monthly Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(160, 35%, 40%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(160, 35%, 40%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="month"
                      className="text-xs"
                      tick={{ fill: "hsl(220, 10%, 45%)" }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "hsl(220, 10%, 45%)" }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(40, 20%, 90%)",
                        borderRadius: "0.75rem",
                      }}
                      formatter={(value: number) => [`$${value}`, "Earnings"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke="hsl(160, 35%, 40%)"
                      strokeWidth={2}
                      fill="url(#colorEarnings)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Amount */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Monthly Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="month"
                      className="text-xs"
                      tick={{ fill: "hsl(220, 10%, 45%)" }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "hsl(220, 10%, 45%)" }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(40, 20%, 90%)",
                        borderRadius: "0.75rem",
                      }}
                      formatter={(value: number) => [`$${value}`, "Pending"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="pending"
                      stroke="hsl(38, 92%, 50%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(38, 92%, 50%)", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Earnings vs Received */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Earnings vs Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="month"
                      className="text-xs"
                      tick={{ fill: "hsl(220, 10%, 45%)" }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "hsl(220, 10%, 45%)" }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(40, 20%, 90%)",
                        borderRadius: "0.75rem",
                      }}
                      formatter={(value: number) => [`$${value}`]}
                    />
                    <Bar
                      dataKey="earnings"
                      name="Earnings"
                      fill="hsl(160, 35%, 40%)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="received"
                      name="Received"
                      fill="hsl(145, 60%, 40%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Clients */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Top Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topClients.map((client, index) => (
                  <div key={client.name} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary-muted flex items-center justify-center text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{client.name}</p>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden mt-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(client.earnings / topClients[0].earnings) * 100}%`,
                          }}
                          transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                    <span className="font-semibold text-sm">
                      ${client.earnings.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
