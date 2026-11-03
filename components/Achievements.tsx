"use client";

import { useEffect, useRef } from "react";
import type { Achievement } from "@/lib/achievements";
import { PixelSprite } from "./PixelSprite";

const STAR = ["...k...", "..kyk..", "kkkyykk", "kyyyyyk", ".kyyyk.", ".kykyk.", "kk...kk"];
const STAR_ON = { k: "#2b1d0e", y: "#f6d65a" };
const STAR_OFF = { k: "#6b5a3e", y: "#c9b68a" };

export function BadgeIcon({ unlocked, scale = 3 }: { unlocked: boolean; scale?: number }) {
  return <PixelSprite rows={STAR} palette={unlocked ? STAR_ON : STAR_OFF} scale={scale} />;
}

/** The full badge list. Locked badges stay visible so there is always something to aim for. */
export function BadgeGrid({ badges }: { badges: Achievement[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {badges.map((b) => (
        <li
          key={b.id}
          className={`flex items-center gap-3 border-4 px-2 py-1.5 ${b.unlocked ? "border-ink bg-parchment-hi" : "border-ink/25"}`}
        >
          <BadgeIcon unlocked={b.unlocked} />
          <div className="min-w-0">
            <p className={`font-pixel text-[10px] leading-[1.5] ${b.unlocked ? "" : "text-ink/50"}`}>{b.title}</p>
            <p className={`text-[19px] leading-tight ${b.unlocked ? "text-ink/80" : "text-ink/45"}`}>{b.detail}</p>
          </div>
          <span className="sr-only">{b.unlocked ? "Unlocked" : "Locked"}</span>
        </li>
      ))}
    </ul>
  );
}

export function AchievementsPanel({ badges, onClose }: { badges: Achievement[]; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const got = badges.filter((b) => b.unlocked).length;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="badges-title"
        className="panel modal-in max-h-[calc(100dvh-32px)] w-full max-w-3xl overflow-y-auto p-4"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="badges-title" className="font-pixel text-[14px] sm:text-[16px]">
            BADGES
          </h2>
          <span className="text-[20px] text-ink/70">
            {got}/{badges.length} unlocked
          </span>
        </div>
        <div className="mt-3">
          <BadgeGrid badges={badges} />
        </div>
        <div className="mt-4 flex justify-end">
          <button ref={closeRef} type="button" className="btn" onClick={onClose}>
            CLOSE
          </button>
        </div>
      </section>
    </div>
  );
}

/** "BADGE UNLOCKED" banners, stacked top-centre. Game removes each after a few seconds. */
export function AchievementToasts({ toasts }: { toasts: Achievement[] }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((b) => (
        <div key={b.id} className="panel slide-in flex items-center gap-3 px-3 py-2">
          <BadgeIcon unlocked scale={4} />
          <div>
            <p className="font-pixel text-[9px] text-[#8a5410]">BADGE UNLOCKED</p>
            <p className="font-pixel text-[11px] leading-[1.6]">{b.title}</p>
            <p className="text-[18px] text-ink/70">{b.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
