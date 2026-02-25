import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, PlusCircle, FilterX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClientCard } from "@/components/ClientCard";
import { AddClientDialog } from "@/components/AddClientDialog";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ---------------- TYPES ---------------- */

export type Client = {
  id: string;
  name: string;
  phone: string;
  default_fee: number;
  commission_rate: number;
  status: "active" | "inactive";
  created_at: string;
  invite_code?: string;
  profile_id?: string;
};

/* ---------------- COMPONENT ---------------- */

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    fetchClients();
  }, []);

  /* ---------------- FETCH ---------------- */

  const fetchClients = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("clients")
      .select("id, name, phone, default_fee, commission_rate, status, created_at, invite_code, profile_id")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setClients(data as Client[]);
    }

    setLoading(false);
  };

  /* ---------------- ACTIONS ---------------- */

  const toggleStatus = async (client: Client) => {
    const newStatus = client.status === "active" ? "inactive" : "active";

    const { error } = await supabase
      .from("clients")
      .update({ status: newStatus })
      .eq("id", client.id);

    if (!error) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === client.id ? { ...c, status: newStatus } : c
        )
      );
    }
  };

  const deleteClient = async (id: string) => {
    const confirmed = confirm("Are you sure you want to delete this client?");
    if (!confirmed) return;

    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (!error) {
      setClients((prev) => prev.filter((c) => c.id !== id));
    }
  };

  /* ---------------- FILTER ---------------- */

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <div className="page-container py-32 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">
          Loading your student roster...
        </p>
      </div>
    );
  }

  return (
    <div className="page-container section-spacing">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-headline">Clients</h1>
          <p className="text-muted-foreground">
            Manage clients, fees and commission
          </p>
        </motion.div>

        <AddClientDialog onClientAdded={fetchClients} />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(val: any) => setStatusFilter(val)}
        >
          <SelectTrigger className="w-full sm:w-40 bg-background">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Client List */}
      <div className="space-y-4">
        {filteredClients.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12"
          >
            <Card className="p-16 text-center border-dashed border-2 bg-muted/5 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                {searchQuery || statusFilter !== "all" ? (
                  <FilterX className="h-10 w-10 text-muted-foreground/40" />
                ) : (
                  <Users className="h-10 w-10 text-muted-foreground/40" />
                )}
              </div>
              <h3 className="text-2xl font-black mb-2">
                {searchQuery || statusFilter !== "all" ? "No results found" : "Your roster is empty"}
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-8 leading-relaxed">
                {searchQuery || statusFilter !== "all"
                  ? `We couldn't find any clients matching "${searchQuery}". Try a different search term or clear filters.`
                  : "Start building your student database. Add your first client to track their fees and commissions effortlessly."}
              </p>

              {searchQuery || statusFilter !== "all" ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="rounded-xl px-8"
                >
                  Clear All Filters
                </Button>
              ) : (
                <AddClientDialog onClientAdded={fetchClients} />
              )}
            </Card>
          </motion.div>
        ) : (
          filteredClients.map((client, index) => (
            <ClientCard
              key={client.id}
              client={client}
              index={index}
              onToggleStatus={() => toggleStatus(client)}
              onDelete={() => deleteClient(client.id)}
              onUpdated={fetchClients}
            />
          ))
        )}
      </div>
    </div>
  );
}
