import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

/* ---------- Types ---------- */

export type UserRole = "teacher" | "owner" | "client";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  organization_name: string | null;
  teacher_type: string | null;
  role: UserRole;
  avatar_url: string | null;
  owner_id: string | null;
  teacher_id: string | null;
  org_invite_code: string | null;
}

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------- Provider ---------- */

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  /** Fetch the profile row for a given user ID with retries */
  const fetchProfile = async (userId: string, attempts = 3) => {
    for (let i = 0; i < attempts; i++) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId);

      if (!error && data && data.length > 0) {
        setProfile(data[0] as Profile);
        setLoading(false);
        return;
      }

      if (i < attempts - 1) {
        // Wait 500ms before next attempt (gives time for trigger)
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // 🚀 SELF-REPAIR: If profile is missing but user is authenticated, 
    // try to create it using auth metadata (in case trigger failed)
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.user_metadata?.role) {
      console.log("Attempting profile self-repair for:", user.email);
      const meta = user.user_metadata;

      const newProfile = {
        id: user.id,
        full_name: meta.full_name || "User",
        email: user.email,
        role: meta.role,
        organization_name: meta.organization_name || null,
        teacher_type: meta.teacher_type || null,
        owner_id: meta.owner_id || null,
        teacher_id: meta.teacher_id || null,
        phone: "",
        avatar_url: null,
        org_invite_code: meta.org_invite_code || null,
      };

      const { error: insError } = await supabase.from("profiles").insert(newProfile);

      if (!insError) {
        // If student, also ensure client record exists
        if (meta.role === 'client' && meta.teacher_id) {
          await supabase.from("clients").insert({
            user_id: meta.teacher_id,
            name: meta.full_name,
            email: user.email,
            profile_id: user.id,
            commission_rate: 10
          });
        }
        setProfile(newProfile as unknown as Profile);
        setLoading(false); // End loading if self-repair successful
        return;
      } else {
        console.error("Self-repair failed:", insError);
      }
    }

    console.warn("Profile not found after retries and repair attempt for user:", userId);
    setProfile(null);
    setLoading(false); // End loading if profile not found or repair failed
  };

  /** Public method to re-fetch the profile (e.g. after editing Account) */
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    const setupAuth = async () => {
      // 1. Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
        setLoading(false);
      }

      // 2. Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return;
          console.log("Auth Event:", event);

          const sessionUser = session?.user ?? null;

          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            setUser(sessionUser);
            if (sessionUser) {
              setLoading(true);
              await fetchProfile(sessionUser.id);
            }
            setLoading(false);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setProfile(null);
            setLoading(false);
          } else if (event === 'TOKEN_REFRESHED') {
            setUser(sessionUser);
          }
        }
      );

      return subscription;
    };

    const authSubPromise = setupAuth();

    return () => {
      mounted = false;
      authSubPromise.then(sub => sub.unsubscribe());
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role ?? null,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ---------- Hook ---------- */

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
