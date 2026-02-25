import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight, ShieldCheck, User, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

/** Helper: Generate a random short invite code */
const generateCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"teacher" | "owner" | "client">("teacher");
  const [inviteCode, setInviteCode] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [teacherType, setTeacherType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      /* 1. Validation for invite codes */
      let ownerId: string | null = null;
      let teacherId: string | null = null;
      let clientIdToLink: string | null = null;

      if (role === "teacher") {
        if (!inviteCode) {
          toast.error("Organization invite code is required for teachers");
          setLoading(false);
          return;
        }
        if (!teacherType) {
          toast.error("Teacher type is required");
          setLoading(false);
          return;
        }
        // Verify owner code
        const { data: ownerProfile, error: ownerError } = await supabase
          .from("profiles")
          .select("id")
          .eq("org_invite_code", inviteCode.trim().toUpperCase())
          .eq("role", "owner")
          .single();

        if (ownerError || !ownerProfile) {
          toast.error("Invalid organization invite code");
          setLoading(false);
          return;
        }
        ownerId = ownerProfile.id;
      }

      if (role === "owner") {
        if (!organizationName) {
          toast.error("Organization name is required");
          setLoading(false);
          return;
        }
      }

      if (role === "client") {
        if (!inviteCode) {
          toast.error("Student invite code is required");
          setLoading(false);
          return;
        }
        // 1. Verify Teacher/Agent code (Modern flow)
        const { data: teacherProfile, error: teacherError } = await supabase
          .from("profiles")
          .select("id, owner_id")
          .ilike("org_invite_code", inviteCode.trim())
          .eq("role", "teacher")
          .single();

        if (!teacherError && teacherProfile) {
          teacherId = teacherProfile.id;
          ownerId = teacherProfile.owner_id;
        } else {
          // 2. Legacy fallback: Check client record invite_code (if needed)
          const { data: clientRecord, error: clientError } = await supabase
            .from("clients")
            .select("id, user_id")
            .ilike("invite_code", inviteCode.trim())
            .single();

          if (clientError || !clientRecord) {
            toast.error("Invalid student invite code");
            setLoading(false);
            return;
          }
          clientIdToLink = clientRecord.id;
          teacherId = clientRecord.user_id; // Original teacher link
        }
      }

      /* 2. Supabase Auth Signup */
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role,
            owner_id: ownerId,
            teacher_id: teacherId,
            organization_name: role === "owner" ? organizationName : null,
            teacher_type: role === "teacher" ? teacherType : null,
            client_id: clientIdToLink,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      const user = data.user;

      /* 3. Handle Signup Success */
      if (!user) {
        throw new Error("Signup failed: No user returned");
      }

      /* 4. Link Client if applicable (Profile is now handled by DB trigger) */
      if (role === "client" && clientIdToLink) {
        const { error: linkError } = await supabase
          .from("clients")
          .update({ profile_id: user.id })
          .eq("id", clientIdToLink);

        if (linkError) console.error("Linking failed:", linkError);
      }

      // ✅ Success 
      toast.success("Welcome to Feezy 🚀!");
      setLoading(false);
      navigate("/app-entry", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred during registration.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm mx-auto"
        >
          <Link to="/" className="inline-block mb-8">
            <Logo size="md" />
          </Link>

          <h1 className="text-headline mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-8">
            Select your role and start your journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Toggle */}
            <div className="space-y-2">
              <Label>Who are you?</Label>
              <Select value={role} onValueChange={(val: any) => setRole(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Teacher / Agent</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="owner">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Org Owner / Admin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="client">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Student / Client</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Organization Name for Owners */}
            <AnimatePresence mode="wait">
              {role === "owner" && (
                <motion.div
                  key="org-name"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-2"
                >
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    placeholder="e.g. ABC Academy"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Teacher Type for Teachers */}
            <AnimatePresence mode="wait">
              {role === "teacher" && (
                <motion.div
                  key="teacher-type"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-2"
                >
                  <Label htmlFor="teacher-type">Teacher Type</Label>
                  <Select value={teacherType} onValueChange={setTeacherType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic (Math, Science, etc.)</SelectItem>
                      <SelectItem value="music">Music / Arts</SelectItem>
                      <SelectItem value="sports">Sports / Fitness</SelectItem>
                      <SelectItem value="language">Languages</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Invite Code - Conditional */}
            <AnimatePresence mode="wait">
              {role !== "owner" && (
                <motion.div
                  key="invite-code"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-2"
                >
                  <Label htmlFor="invite">
                    {role === "teacher"
                      ? "Org Invite Code"
                      : "Student Invite Code"}
                  </Label>
                  <Input
                    id="invite"
                    placeholder="Enter short code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Ask your {role === "teacher" ? "Owner" : "Teacher"} for this code.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className="w-full group mt-2"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Register as {role.charAt(0).toUpperCase() + role.slice(1)}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to={role === 'owner' ? "/owner/login" : role === 'client' ? "/student/login" : "/login"}
              className="font-semibold text-primary hover:text-primary/80"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-success opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80')] bg-cover mix-blend-overlay opacity-20" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative flex items-center justify-center w-full p-12"
        >
          <div className="text-center max-w-md text-white">
            <h2 className="text-3xl font-bold mb-4">
              {role === 'teacher' ? 'Track your hard-earned work' :
                role === 'owner' ? 'Scale your academy with data' :
                  'Keep your payments organized'}
            </h2>
            <p className="text-white/80 text-lg">
              {role === 'teacher' ? 'Manage students, fees, and settlements in one simple dashboard.' :
                role === 'owner' ? 'Oversee your entire organization, teacher performance, and settlements.' :
                  'View your payment history and upcoming fees effortlessly.'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
