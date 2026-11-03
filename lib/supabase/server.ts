import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Viewer } from "@/lib/viewer";
import { supabaseEnv } from "./env";

/** A per-request server client, or null when online features aren't configured. */
export async function getServerSupabase(): Promise<SupabaseClient | null> {
  if (!supabaseEnv) return null;
  const store = await cookies();
  return createServerClient(supabaseEnv.url, supabaseEnv.key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Called from a Server Component, where cookies are read-only. The
          // middleware refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
}

/** The signed-in player and their profile, or null for a guest. */
export async function getViewer(): Promise<Viewer | null> {
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("handle, display_name").eq("id", user.id).maybeSingle();
  return { id: user.id, email: user.email, handle: data?.handle ?? null, displayName: data?.display_name ?? null };
}
