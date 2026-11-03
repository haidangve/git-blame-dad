"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { SIDE } from "@/data/story";

type Props = { onCreate: (title: string) => void | Promise<void>; onCancel: () => void };

/** Write a quest that isn't on the map. Saving opens "who taught you?" for it straight away. */
export function SideQuestModal({ onCreate, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    await onCreate(title);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="side-title"
        onSubmit={submit}
        className="panel modal-in w-full max-w-lg p-4"
      >
        <h2 id="side-title" className="font-pixel text-[14px] leading-[1.4] sm:text-[16px]">
          {SIDE.title}
        </h2>
        <label className="mt-3 block text-[20px]">
          {SIDE.label}
          <input
            ref={inputRef}
            className="w-full border-4 border-ink bg-parchment-hi px-2 py-1 text-[22px] text-ink placeholder:text-ink/45"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={SIDE.placeholder}
            maxLength={40}
          />
        </label>
        <p className="mt-1 text-[18px] text-ink/60">Worth {SIDE.xp} XP. You can write up to {SIDE.max}.</p>
        <div className="mt-4 flex justify-end gap-3">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            BACK
          </button>
          <button type="submit" className="btn" disabled={!title.trim() || busy}>
            {busy ? "SAVING…" : SIDE.create}
          </button>
        </div>
      </form>
    </div>
  );
}
