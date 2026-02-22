import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { ChevronRight, Trash2, Pencil, Power, Copy, Share2, Sparkles, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { EditClientDialog, Client as EditClientType } from "@/components/EditClientDialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

/* ---------------- TYPES ---------------- */

export interface Client {
  id: string;
  name: string;
  phone: string;
  default_fee: number;
  commission_rate: number;
  status: "active" | "inactive";
  invite_code?: string;
  profile_id?: string; // If linked to a real user
}

interface ClientCardProps {
  client: Client;
  index?: number;
  onToggleStatus: () => void;
  onDelete: () => void;
  onUpdated: () => void;
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
  const [loadingCode, setLoadingCode] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const { profile } = useAuth();

  const sendFeeReminder = async () => {
    if (!client.profile_id) return;
    setSendingReminder(true);

    const { error } = await supabase
      .from("notifications")
      .insert({
        profile_id: client.profile_id,
        type: 'fee_reminder',
        title: 'Fee Payment Reminder',
        message: `Your teacher ${profile?.full_name} has requested a fee update. Please check your dues.`,
      });

    if (error) {
      toast.error("Failed to send reminder");
    } else {
      toast.success("Fee reminder sent to student!");
    }
    setSendingReminder(false);
  };

  const generateInviteCode = async () => {
    setLoadingCode(true);
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    const { error } = await supabase
      .from("clients")
      .update({ invite_code: code })
      .eq("id", client.id);

    if (error) {
      toast.error("Failed to generate code");
      setLoadingCode(false);
      return;
    }

    toast.success("Invite code generated!");
    onUpdated();
    setLoadingCode(false);
  };

  const copyCode = () => {
    if (client.invite_code) {
      navigator.clipboard.writeText(client.invite_code);
      toast.success("Invite code copied!");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card className="p-5 hover:shadow-lg transition-all group border-muted/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {/* LEFT: Info */}
            <div className="flex items-center gap-4 flex-1">
              <Link
                to={`/clients/${client.id}`}
                className="flex items-center gap-4 flex-1"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/80 to-accent flex items-center justify-center shadow-inner">
                    <span className="font-bold text-white text-lg">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {client.profile_id && (
                    <div className="absolute -top-1 -right-1 bg-success text-white p-0.5 rounded-full border-2 border-background shadow-sm" title="Linked to Student Account">
                      <UserCheck className="h-3 w-3" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{client.name}</h3>
                    <Badge
                      variant={client.status === "active" ? "success" : "secondary"}
                      className="text-[10px] h-4 px-1.5"
                    >
                      {client.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    {client.phone}
                  </p>
                </div>
              </Link>

              {client.profile_id && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-[10px] uppercase font-bold tracking-tighter text-primary bg-primary/5 hover:bg-primary/10 gap-1.5"
                  onClick={sendFeeReminder}
                  disabled={sendingReminder}
                >
                  <Share2 className="h-3 w-3" />
                  {sendingReminder ? "Sending..." : "Notify"}
                </Button>
              )}
            </div>

            {/* MIDDLE: Stats & Invite */}
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-lg font-bold">{formatCurrency(client.default_fee)}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                  {client.commission_rate}% Commission
                </p>
              </div>

              <div className="h-10 w-px bg-border hidden sm:block" />

              <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
                {client.invite_code ? (
                  <div className="flex items-center gap-1 bg-muted/50 p-1 pl-3 rounded-full border">
                    <span className="text-xs font-mono font-bold tracking-widest">{client.invite_code}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 rounded-full hover:bg-primary/10"
                      onClick={copyCode}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full border-dashed gap-1.5 text-xs hover:border-primary hover:text-primary transition-all"
                    onClick={generateInviteCode}
                    disabled={loadingCode}
                  >
                    <Sparkles className="h-3 w-3" />
                    {loadingCode ? "..." : "Link Student"}
                  </Button>
                )}
                <p className="text-[10px] text-muted-foreground uppercase font-bold text-right">
                  {client.profile_id ? "Linked" : "Invite Code"}
                </p>
              </div>
            </div>

            {/* RIGHT: Actions */}
            <div
              className="flex items-center gap-1 pt-4 sm:pt-0 border-t sm:border-t-0 border-muted"
              onClick={(e) => e.stopPropagation()}
            >
              <Button size="icon" variant="ghost" onClick={onToggleStatus} title="Toggle status" className="hover:text-primary">
                <Power className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditOpen(true)}
                title="Edit client"
                className="hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10"
                onClick={onDelete}
                title="Delete client"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <ChevronRight className="h-5 w-5 text-muted-foreground/30 ml-2 group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
