"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { HANDLE_RE } from "@/lib/handle";
import { getBrowserSupabase } from "@/lib/supabase/client";

type Values = { handle: string; displayName: string; isPublic: boolean; shareMemories: boolean };

const INPUT = "w-full border-4 border-ink bg-parchment-hi px-2 py-1 text-[22px] text-ink";

export function ProfileSettings({ initial, welcome, email }: { initial: Values; welcome: boolean; email?: string }) {
  const router = useRouter();
  const [v, setV] = useState<Values>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<"no" | "confirm" | "working">("no");

  const set = <K extends keyof Values>(k: K, value: Values[K]) => {
    setV((prev) => ({ ...prev, [k]: value }));
    setState("idle");
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const handle = v.handle.trim().toLowerCase();
    if (!HANDLE_RE.test(handle)) {
      setError("Handles are 3–20 characters: lowercase letters, numbers and _.");
      return;
    }
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setState("saving");
    setError("");
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      router.push("/login?next=/me");
      return;
    }
    const { error: err } = await supabase
      .from("profiles")
      .update({
        handle,
        display_name: v.displayName.trim().slice(0, 40) || null,
        is_public: v.isPublic,
        share_memories: v.shareMemories,
      })
      .eq("id", auth.user.id);
    if (err) {
      setState("idle");
      setError(err.code === "23505" ? `@${handle} is taken. Try another.` : err.message);
      return;
    }
    setState("saved");
    if (welcome) router.push("/");
    else router.refresh();
  };

  const deleteAccount = async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setDeleting("working");
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      // Photo files first: Storage objects can't be removed by the SQL cascade.
      const { data: files } = await supabase.storage.from("photos").list(auth.user.id, { limit: 1000 });
      if (files?.length) await supabase.storage.from("photos").remove(files.map((f) => `${auth.user!.id}/${f.name}`));
    }
    const { error: err } = await supabase.rpc("delete_me");
    if (err) {
      setDeleting("no");
      setError(err.message);
      return;
    }
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={save} className="panel mx-auto mt-2 w-full max-w-xl p-5">
        <h1 className="font-pixel text-[14px] leading-[1.5] sm:text-[18px]">{welcome ? "PICK A HANDLE" : "YOUR PROFILE"}</h1>
        {welcome && (
          <p className="mt-2 text-[21px] leading-tight text-ink/80">
            This is how you show up in the Hall of Blame. You can change it later.
          </p>
        )}
        {email && <p className="mt-2 text-[19px] text-ink/60">Signed in as {email}</p>}

        <label className="mt-4 block text-[20px]">
          Handle
          <div className="flex items-center gap-1">
            <span className="text-[24px]">@</span>
            <input
              className={INPUT}
              value={v.handle}
              onChange={(e) => set("handle", e.target.value.toLowerCase())}
              maxLength={20}
              autoComplete="off"
              spellCheck={false}
              required
            />
          </div>
        </label>
        <label className="mt-3 block text-[20px]">
          Display name <span className="text-ink/50">(optional)</span>
          <input className={INPUT} value={v.displayName} onChange={(e) => set("displayName", e.target.value)} maxLength={40} />
        </label>

        <fieldset className="mt-4 flex flex-col gap-3 border-4 border-ink/20 p-3">
          <legend className="px-1 font-pixel text-[10px]">PRIVACY</legend>
          <label className="flex cursor-pointer items-start gap-3 text-[20px] leading-tight">
            <input type="checkbox" className="mt-1 h-5 w-5 accent-[#b5761f]" checked={v.isPublic} onChange={(e) => set("isPublic", e.target.checked)} />
            <span>
              <b>Show me in the Hall of Blame.</b> Your numbers (quests, XP, Dad&apos;s share, who taught you) appear on the
              leaderboard and your profile page. Off: only you can see your profile.
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-[20px] leading-tight">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-[#b5761f]"
              checked={v.shareMemories}
              onChange={(e) => set("shareMemories", e.target.checked)}
            />
            <span>
              <b>Share my words.</b> Teacher names, memories and side quest titles show on your public profile. Off: people see
              &quot;Uncle&quot;, not &quot;Uncle Minh&quot;, and no memories.
            </span>
          </label>
          <p className="text-[18px] text-ink/60">Photos are never shown to anyone but you.</p>
        </fieldset>

        {error && (
          <p role="alert" className="mt-3 text-[20px] text-[#9b2a1c]">
            {error}
          </p>
        )}
        <div className="mt-4 flex items-center justify-end gap-3">
          {state === "saved" && <span role="status" className="text-[20px] text-[#2f6b33]">Saved.</span>}
          <button type="submit" className="btn" disabled={state === "saving"}>
            {state === "saving" ? "SAVING…" : welcome ? "START PLAYING ▶" : "SAVE"}
          </button>
        </div>
      </form>

      {!welcome && (
        <section className="panel-dark mx-auto w-full max-w-xl p-4 text-[20px]">
          <div className="flex flex-wrap items-center gap-3">
            <form action="/auth/signout" method="post">
              <button type="submit" className="btn btn-ghost">
                LOG OUT
              </button>
            </form>
            <span className="ml-auto" />
            {deleting === "no" && (
              <button type="button" className="text-[#ff8a7a] underline" onClick={() => setDeleting("confirm")}>
                Delete my account
              </button>
            )}
          </div>
          {deleting !== "no" && (
            <div role="alertdialog" aria-label="Delete account" className="mt-3 border-4 border-[#9b2a1c] p-3">
              <p>This deletes your profile, your whole quest log, and every photo. It can&apos;t be undone.</p>
              <div className="mt-3 flex gap-3">
                <button type="button" className="btn" disabled={deleting === "working"} onClick={deleteAccount}>
                  {deleting === "working" ? "DELETING…" : "DELETE FOREVER"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setDeleting("no")}>
                  KEEP IT
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
