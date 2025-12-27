import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Trash2, Pencil, Power } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { EditClientDialog, Client as EditClientType } from "@/components/EditClientDialog";

/* ---------------- TYPES ---------------- */

export interface Client {
  id: string;
  name: string;
  phone: string;
  default_fee: number;
  commission_rate: number;
  status: "active" | "inactive";
}

interface ClientCardProps {
  client: Client;
  index?: number;
  onToggleStatus: () => void;
  onDelete: () => void;
  onUpdated: () => void; // callback to refresh client list
}

/* ---------------- COMPONENT ---------------- */

export function ClientCard({
  client,
  index = 0,
  onToggleStatus,
  onDelete,
  onUpdated,
}: ClientCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card className="p-4 hover:shadow-md transition">
          <div className="flex items-center justify-between gap-4">
            {/* LEFT */}
            <Link
              to={`/clients/${client.id}`}
              className="flex items-center gap-4 flex-1"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="font-semibold text-white">
                  {client.name.charAt(0).toUpperCase()}
                </span>
              </div>

              <div>
                <h3 className="font-semibold">{client.name}</h3>
                <p className="text-sm text-muted-foreground">{client.phone}</p>
              </div>
            </Link>

            {/* MIDDLE */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{formatCurrency(client.default_fee)}</p>
              <p className="text-xs text-muted-foreground">{client.commission_rate}% commission</p>
            </div>

            {/* STATUS */}
            <span
              className={
                client.status === "active" ? "status-active" : "status-inactive"
              }
            >
              {client.status}
            </span>

            {/* ACTIONS */}
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()} // prevent parent click
            >
              {/* Toggle */}
              <Button size="icon" variant="ghost" onClick={onToggleStatus} title="Toggle status">
                <Power className="h-4 w-4" />
              </Button>

              {/* Edit */}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditOpen(true)}
                title="Edit client"
              >
                <Pencil className="h-4 w-4" />
              </Button>

              {/* Delete */}
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive"
                onClick={onDelete}
                title="Delete client"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <ChevronRight className="h-5 w-5 text-muted-foreground ml-1" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Edit Dialog */}
      {isEditOpen && client && (
        <EditClientDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          client={client as EditClientType}
          onClientUpdated={() => {
            setIsEditOpen(false);
            onUpdated();
          }}
        />
      )}
    </>
  );
}
