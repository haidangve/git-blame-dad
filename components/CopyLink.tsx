"use client";

import { useState } from "react";

/** Copies an absolute link to this site. Falls back to selecting nothing: the button just says it failed. */
export function CopyLink({ path, label = "COPY LINK" }: { path: string; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  return (
    <button
      type="button"
      className="btn btn-ghost px-3 py-2 text-[10px]"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(`${window.location.origin}${path}`);
          setState("copied");
        } catch {
          setState("failed");
        }
        window.setTimeout(() => setState("idle"), 1800);
      }}
    >
      {state === "copied" ? "COPIED!" : state === "failed" ? "COPY FAILED" : label}
    </button>
  );
}
