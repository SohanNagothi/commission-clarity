import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
      <div className="page-container py-20 text-center text-muted-foreground">
        Loading clients...
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
      <div className="space-y-3">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No clients found.
          </div>
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
