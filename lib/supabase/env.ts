/**
 * Online features (accounts, cloud saves, the Hall of Blame) switch on when
 * both of these are set. Without them the game still runs as a guest, saving
 * to localStorage, exactly as the hackathon build did.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnv = url && key ? { url, key } : null;
export const onlineEnabled = supabaseEnv !== null;

/** OAuth providers to offer on /login, e.g. "github,google". Email magic links are always offered. */
export const oauthProviders = (process.env.NEXT_PUBLIC_AUTH_PROVIDERS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter((s): s is "github" | "google" | "discord" => s === "github" || s === "google" || s === "discord");
