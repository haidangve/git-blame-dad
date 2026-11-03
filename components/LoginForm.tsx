"use client";

import { useState, type FormEvent } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";

type Provider = "github" | "google" | "discord";
const LABEL: Record<Provider, string> = { github: "GitHub", google: "Google", discord: "Discord" };

type Props = { next: string; providers: Provider[]; linkError: boolean };

export function LoginForm({ next, providers, linkError }: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState(linkError ? "That sign-in link expired or was already used. Send a new one." : "");

  const callback = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const sendLink = async (e: FormEvent) => {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase || !email.trim()) return;
    setState("sending");
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: callback() } });
    if (error) {
      setState("error");
      setMessage(error.message);
    } else {
      setState("sent");
    }
  };

  const oauth = async (provider: Provider) => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: callback() } });
    if (error) {
      setState("error");
      setMessage(error.message);
    }
  };

  if (state === "sent") {
    return (
      <div role="status" className="mt-4 border-4 border-ink bg-parchment-hi p-3 text-[21px]">
        <p className="font-pixel text-[11px]">CHECK YOUR INBOX</p>
        <p className="mt-1">
          We sent a sign-in link to <b>{email}</b>. Open it on this device and you&apos;re in.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {providers.length > 0 && (
        <div className="flex flex-col gap-2">
          {providers.map((p) => (
            <button key={p} type="button" className="btn w-full" onClick={() => oauth(p)}>
              CONTINUE WITH {LABEL[p].toUpperCase()}
            </button>
          ))}
          <p className="text-center text-[18px] text-ink/60">or</p>
        </div>
      )}
      <form onSubmit={sendLink} className="flex flex-col gap-2">
        <label className="text-[20px]">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            className="w-full border-4 border-ink bg-parchment-hi px-2 py-1 text-[22px] text-ink"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <button type="submit" className={providers.length ? "btn btn-ghost" : "btn"} disabled={state === "sending"}>
          {state === "sending" ? "SENDING…" : "EMAIL ME A LINK"}
        </button>
      </form>
      {message && (
        <p role="alert" className="text-[20px] text-[#9b2a1c]">
          {message}
        </p>
      )}
    </div>
  );
}
