import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let browserClient: SupabaseClient<Database> | undefined;

function requiredEnv(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_PUBLISHABLE_KEY"): string {
  const value = import.meta.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

/**
 * Returns the browser Supabase client. The publishable key is intentionally
 * public; access to family data is enforced by Postgres Row Level Security.
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    throw new Error("The browser Supabase client cannot be used during server rendering.");
  }

  browserClient ??= createClient<Database>(
    requiredEnv("VITE_SUPABASE_URL"),
    requiredEnv("VITE_SUPABASE_PUBLISHABLE_KEY"),
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  );

  return browserClient;
}
