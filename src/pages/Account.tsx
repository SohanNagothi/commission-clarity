import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Camera, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

type Profile = {
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  role: string;
};

export default function Account() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    email: "",
    phone: "",
    organization: "",
    role: "",
  });

  // 🔹 Fetch profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast({
          title: "Not authenticated",
          description: "Please log in again",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, phone, organization, role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        toast({
          title: "Failed to load profile",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setProfile({
          full_name: data.full_name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          organization: data.organization ?? "",
          role: data.role ?? "",
        });
      }

      setLoading(false);
    };

    fetchProfile();
  }, [toast]);

  // 🔹 Save profile
  const handleSave = async () => {
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: "Not authenticated",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        organization: profile.organization,
        role: profile.role,
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    }

    setSaving(false);
  };

  if (loading) {
    return <div className="page-container">Loading profile...</div>;
  }

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="section-spacing"
      >
        {/* Header */}
        <div>
          <h1 className="text-headline">My Account</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Picture */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center text-4xl font-bold text-primary-foreground">
                  {profile.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-card border rounded-full shadow-md hover:bg-muted">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h2 className="mt-4 text-lg font-semibold">
                {profile.full_name}
              </h2>
              <p className="text-sm text-muted-foreground">{profile.role}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {profile.organization}
              </p>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={profile.full_name}
                    onChange={(e) =>
                      setProfile({ ...profile, full_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={profile.email} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Organization</Label>
                  <Input
                    value={profile.organization}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        organization: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>Role / Profession</Label>
                  <Input
                    value={profile.role}
                    onChange={(e) =>
                      setProfile({ ...profile, role: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
