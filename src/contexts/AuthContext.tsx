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
  organization: string;
  role: UserRole;
  avatar_url: string | null;
  owner_id: string | null;
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
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
        return;
      }

      if (i < attempts - 1) {
        // Wait 500ms before next attempt (gives time for trigger)
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.warn("Profile not found after retries for user:", userId);
    setProfile(null);
  };

  /** Public method to re-fetch the profile (e.g. after editing Account) */
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let lastHandledId: string | null = null;

    const syncUserAndProfile = async (sessionUser: User | null) => {
      // Avoid redundant work if the user hasn't changed
      if (sessionUser?.id === lastHandledId && (sessionUser || lastHandledId === null)) {
        setLoading(false);
        return;
      }

      lastHandledId = sessionUser?.id ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        await fetchProfile(sessionUser.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    };

    // 1. Handle initial session
    setLoading(true);
    supabase.auth.getSession().then(({ data }) => {
      syncUserAndProfile(data.session?.user ?? null);
    });

    // 2. Handle auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const sessionUser = session?.user ?? null;

        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
          setLoading(true);
          syncUserAndProfile(sessionUser);
        } else if (event === 'SIGNED_OUT') {
          syncUserAndProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
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
