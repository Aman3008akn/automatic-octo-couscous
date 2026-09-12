"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "./client";
import { User } from "@supabase/supabase-js";

import { getCurrentUserRole } from "@/server/reseller-onboarding";

type SessionData = {
  user: {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  } | null;
};

type SessionContextType = {
  data: SessionData | null;
  status: "loading" | "authenticated" | "unauthenticated";
};

const SessionContext = createContext<SessionContextType>({
  data: null,
  status: "loading",
});

export function SupabaseSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionContextType>({
    data: null,
    status: "loading",
  });
  
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession?.user) {
        let role: string | undefined;
        try {
          const dbRole = await getCurrentUserRole();
          if (dbRole) role = dbRole;
        } catch {
          // fallback to metadata or undefined
        }

        const meta = currentSession.user.user_metadata || {};
        const fullName =
          meta.name ||
          meta.full_name ||
          [meta.first_name, meta.last_name].filter(Boolean).join(" ") ||
          currentSession.user.email?.split("@")[0] ||
          "Cartygo User";
        const firstName = meta.first_name || fullName.split(" ")[0] || "";
        const lastName = meta.last_name || fullName.split(" ").slice(1).join(" ") || "";

        const authData = {
          user: {
            id: currentSession.user.id,
            email: currentSession.user.email!,
            name: fullName,
            firstName,
            lastName,
            role,
          },
        };
        if (mounted) setSession({ data: authData, status: "authenticated" });
      } else {
        // Fallback check for NextAuth session (Google OAuth)
        try {
          const res = await fetch("/api/auth/session");
          const nextAuth = await res.json();
          if (nextAuth?.user?.email) {
            const fullName = nextAuth.user.name || nextAuth.user.email.split("@")[0];
            const firstName = fullName.split(" ")[0] || "";
            const lastName = fullName.split(" ").slice(1).join(" ") || "";
            const authData = {
              user: {
                id: nextAuth.user.id || nextAuth.user.uid || "google-user",
                email: nextAuth.user.email,
                name: fullName,
                firstName,
                lastName,
                role: nextAuth.user.role || "CUSTOMER",
              },
            };
            if (mounted) setSession({ data: authData, status: "authenticated" });
            return;
          }
        } catch {}

        if (mounted) setSession({ data: null, status: "unauthenticated" });
      }
    }
    
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession?.user) {
        let role: string | undefined;
        try {
          const dbRole = await getCurrentUserRole();
          if (dbRole) role = dbRole;
        } catch {
          // fallback
        }

        const meta = newSession.user.user_metadata || {};
        const fullName =
          meta.name ||
          meta.full_name ||
          [meta.first_name, meta.last_name].filter(Boolean).join(" ") ||
          newSession.user.email?.split("@")[0] ||
          "Cartygo User";
        const firstName = meta.first_name || fullName.split(" ")[0] || "";
        const lastName = meta.last_name || fullName.split(" ").slice(1).join(" ") || "";

        const authData = {
          user: {
            id: newSession.user.id,
            email: newSession.user.email!,
            name: fullName,
            firstName,
            lastName,
            role,
          },
        };
        if (mounted) setSession({ data: authData, status: "authenticated" });
      } else {
        if (mounted) setSession({ data: null, status: "unauthenticated" });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}

export async function signOut(options?: { callbackUrl?: string }) {
  const supabase = createClient();
  try {
    await supabase.auth.signOut();
  } catch {}
  
  // Also sign out from NextAuth
  const target = options?.callbackUrl || "/";
  window.location.href = `/api/auth/signout?callbackUrl=${encodeURIComponent(target)}`;
}
