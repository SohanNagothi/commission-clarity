import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Client } from "@/data/mockData";

interface ClientCardProps {
  client: Client;
  index?: number;
}

export function ClientCard({ client, index = 0 }: ClientCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link to={`/clients/${client.id}`}>
        <Card variant="interactive" className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-muted flex items-center justify-center">
                <span className="font-semibold text-primary">
                  {client.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{client.name}</h3>
                <p className="text-sm text-muted-foreground">{client.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">${client.defaultFee}</p>
                <p className="text-xs text-muted-foreground">
                  {client.commissionPercentage}% commission
                </p>
              </div>
              <span
                className={
                  client.status === "active" ? "status-active" : "status-inactive"
                }
              >
                {client.status}
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
