import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Camera, Save, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type Profile = {
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  role: string;
};

export default function Account() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    organization: "",
  });

  // Sync local form with profile when it loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        organization: profile.organization || "",
      });
    }
  }, [profile]);

  // 🔹 Save profile
  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        organization: formData.organization,
      })
      .eq("id", profile.id);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      await refreshProfile();
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    }
    setSaving(false);
  };

  const copyInviteCode = () => {
    if (profile?.org_invite_code) {
      navigator.clipboard.writeText(profile.org_invite_code);
      toast({
        title: "Copied!",
        description: "Invite code copied to clipboard",
      });
    }
  };

  const generateNewCode = async () => {
    if (!profile?.id) return;
    setSaving(true);

    // Simple 8-char random code
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const { error } = await supabase
      .from("profiles")
      .update({ org_invite_code: newCode })
      .eq("id", profile.id);

    if (error) {
      toast({ title: "Failed to generate code", variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Invite code generated!" });
    }
    setSaving(false);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="section-spacing"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-headline">My Account</h1>
            <p className="text-muted-foreground mt-1">
              Manage your personal information and organization
            </p>
          </div>

          {(profile.role === 'owner' || profile.role === 'teacher') && (
            <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">My Invite Code</p>
                <p className="text-lg font-mono font-bold tracking-widest text-primary">
                  {profile.org_invite_code || "-------"}
                </p>
              </div>
              {profile.org_invite_code ? (
                <Button onClick={copyInviteCode} variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                  <Copy className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={generateNewCode} variant="outline" size="sm" className="h-8">
                  Generate
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Picture & Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    {profile.full_name?.[0] || 'U'}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-background border rounded-full shadow-sm hover:bg-muted transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <h2 className="mt-4 text-xl font-bold">
                  {profile.full_name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {profile.role}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-3 italic">
                  {profile.email}
                </p>
              </CardContent>
            </Card>

            <div className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/10">
              <h4 className="font-bold text-primary mb-2 text-sm">Sharing Tip</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {profile.role === 'owner'
                  ? "Share your code with Teachers/Agents so they can automatically join your organization."
                  : "Share your code with Students so they are automatically linked to you for commission tracking."}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email (Login Only)</Label>
                  <Input value={profile.email} disabled className="h-11 bg-muted/50" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="h-11"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Organization</Label>
                  <Input
                    value={formData.organization}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organization: e.target.value,
                      })
                    }
                    className="h-11"
                    placeholder="Enter your academy name"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button onClick={handleSave} disabled={saving} className="gap-2 px-8 h-12 shadow-md">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Update Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
