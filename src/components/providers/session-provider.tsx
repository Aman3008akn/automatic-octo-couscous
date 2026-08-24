"use client";

import { SupabaseSessionProvider } from "@/lib/supabase/hooks";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <SupabaseSessionProvider>{children}</SupabaseSessionProvider>;
}
