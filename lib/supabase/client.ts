"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

let client: SupabaseClient | null = null;

/** The browser client, or null when online features aren't configured. */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!supabaseEnv) return null;
  client ??= createBrowserClient(supabaseEnv.url, supabaseEnv.key);
  return client;
}
