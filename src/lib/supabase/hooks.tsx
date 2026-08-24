"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "./client";
import { User } from "@supabase/supabase-js";

type SessionData = {
  user: {
    id: string;
    email: string;
    name?: string;
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
        // Fetch MongoDB role via a custom API endpoint later if needed,
        // for now, we just pass the basic Supabase user.
        // The middleware and server actions enforce roles.
        const authData = {
          user: {
            id: currentSession.user.id,
            email: currentSession.user.email!,
            name: currentSession.user.user_metadata?.name || currentSession.user.email,
          },
        };
        if (mounted) setSession({ data: authData, status: "authenticated" });
      } else {
        if (mounted) setSession({ data: null, status: "unauthenticated" });
      }
    }
    
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (newSession?.user) {
        const authData = {
          user: {
            id: newSession.user.id,
            email: newSession.user.email!,
            name: newSession.user.user_metadata?.name || newSession.user.email,
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
  await supabase.auth.signOut();
  window.location.href = options?.callbackUrl || "/";
}
