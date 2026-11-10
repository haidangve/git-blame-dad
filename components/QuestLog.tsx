"use client";

import { useState } from "react";
import type { Region, Skill } from "@/data/skills";
import { MODAL, NAV, QUEST_LOG, REGIONS, SIDE } from "@/data/story";
import type { Save } from "@/hooks/useSave";
import type { Achievement } from "@/lib/achievements";
import { rankFor, XP_PER_LEVEL } from "@/lib/ranks";
import type { Viewer } from "@/lib/viewer";
import { BadgeIcon } from "./Achievements";
import { Hero } from "./Hero";
import { QuestCard } from "./QuestCard";
import { SiteNav } from "./SiteNav";

function XPBar({ totalXP, level }: { totalXP: number; level: number }) {
  const into = totalXP % XP_PER_LEVEL;
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <span className="font-pixel text-[12px] text-lantern sm:text-[14px]">
          LV {level} <span className="text-[10px] text-parchment/80 sm:text-[11px]">{rankFor(level)}</span>
        </span>
        <span className="text-[18px] text-parchment/80">
          {into}/{XP_PER_LEVEL} XP · {totalXP} total
        </span>
      </div>
      <div
        className="mt-1 h-5 border-4 border-black bg-[#0a0d22]"
        role="progressbar"
        aria-label="XP to next level"
        aria-valuemin={0}
        aria-valuemax={XP_PER_LEVEL}
        aria-valuenow={into}
      >
        <div
          className="h-full bg-lantern transition-[width] duration-500"
          style={{ width: `${(into / XP_PER_LEVEL) * 100}%`, boxShadow: "inset 0 -4px 0 var(--lantern-dim)" }}
        />
      </div>
    </div>
  );
}

function Settings({ demo, onReset, onClear }: { demo: boolean; onReset: () => void; onClear: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const question = demo ? QUEST_LOG.resetConfirm : QUEST_LOG.clearConfirm;
  const action = demo ? onReset : onClear;

  return (
    <div className="relative">
      <button
        type="button"
        className="btn btn-ghost px-3 py-2 text-[10px]"
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
          setConfirming(false);
        }}
      >
        {QUEST_LOG.settings}
      </button>
      {open && (
        <div className="panel absolute right-0 top-full z-30 mt-2 w-60 p-3">
          {confirming ? (
            <div className="flex flex-col gap-2">
              <p className="text-[20px]">{question}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn px-3 py-2 text-[10px]"
                  onClick={() => {
                    action();
                    setOpen(false);
                    setConfirming(false);
                  }}
                >
                  YES
                </button>
                <button type="button" className="btn btn-ghost px-3 py-2 text-[10px]" onClick={() => setConfirming(false)}>
                  NO
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn w-full px-3 py-2 text-[10px]" onClick={() => setConfirming(true)}>
              {demo ? QUEST_LOG.resetSave : QUEST_LOG.clearSave}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

type Props = {
  save: Save;
  viewer: Viewer | null;
  online: boolean;
  badges: Achievement[];
  onToggle: (skill: Skill, rect: DOMRect) => void;
  onViewPhoto: (skill: Skill) => void;
  onOpenBadges: () => void;
  onWriteSide: () => void;
  footer?: React.ReactNode;
};

export function QuestLog({ save, viewer, online, badges, onToggle, onViewPhoto, onOpenBadges, onWriteSide, footer }: Props) {
  const [region, setRegion] = useState<Region>("grooming");
  const active = REGIONS.find((r) => r.id === region)!;
  const visible = save.skills.filter((s) => s.region === region);
  const demo = save.mode === "demo";
  const got = badges.filter((b) => b.unlocked).length;
  // Kai's story is his log; side quests are for players writing their own.
  const regions = demo ? REGIONS.filter((r) => r.id !== "side") : REGIONS;
  const total = save.skills.filter((s) => !s.custom).length;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-4 px-4 py-4">
      <SiteNav viewer={viewer} online={online} />

      <header className="panel-dark flex items-center gap-4 p-3 sm:p-4">
        <Hero scale={3} className="shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* On phones the buttons drop under the heading instead of pushing past the panel. */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="whitespace-nowrap font-pixel text-[12px] text-parchment sm:text-[16px]">{QUEST_LOG.heading}</h1>
            <div className="flex items-center gap-2">
              <span className="hidden text-[20px] text-parchment/80 sm:inline">
                {save.doneCount}/{total + save.customCount} quests
              </span>
              <button
                type="button"
                className="btn btn-ghost flex items-center gap-2 px-3 py-2 text-[10px]"
                onClick={onOpenBadges}
                aria-label={`Badges: ${got} of ${badges.length} unlocked`}
              >
                <BadgeIcon unlocked={got > 0} scale={2} />
                {got}/{badges.length}
              </button>
              <Settings demo={demo} onReset={save.resetToSeed} onClear={save.clearAll} />
            </div>
          </div>
          <XPBar totalXP={save.totalXP} level={save.level} />
        </div>
      </header>

      {save.saveFailed && (
        <p role="alert" className="panel px-3 py-2 text-[20px] text-[#9b2a1c]">
          {save.mode === "cloud" ? "Couldn't sync the last change. Check your connection and try again." : MODAL.saveFailed}
        </p>
      )}
      {save.imported > 0 && (
        <p role="status" className="panel px-3 py-2 text-[20px]">
          Brought {save.imported} quest{save.imported === 1 ? "" : "s"} over from this browser into your account.
        </p>
      )}
      {save.mode === "guest" && online && <p className="text-[19px] text-parchment/60">{NAV.offline}</p>}

      {/* One scrolling row on phones; wraps on wider screens. Padding keeps the button shadows inside the scroll box. */}
      <nav
        role="tablist"
        aria-label="Regions"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-2"
      >
        {regions.map((r) => {
          const all = save.skills.filter((s) => s.region === r.id);
          const done = all.filter((s) => s.done).length;
          const selected = r.id === region;
          return (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={(e) => {
                setRegion(r.id);
                e.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
              }}
              className={`btn shrink-0 px-3 py-2 text-[10px] sm:text-[11px] ${selected ? "" : "btn-ghost"}`}
            >
              {r.name} <span className="opacity-70">{r.id === "side" && !all.length ? "+" : `${done}/${all.length}`}</span>
            </button>
          );
        })}
      </nav>

      <p className="text-[22px] text-parchment/80">{active.blurb}</p>

      <section role="tabpanel" aria-label={active.name} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((s) => (
          <QuestCard key={s.id} skill={s} onToggle={onToggle} onViewPhoto={onViewPhoto} />
        ))}
        {region === "side" &&
          (save.customCount < SIDE.max ? (
            <button
              type="button"
              onClick={onWriteSide}
              className="flex min-h-[88px] cursor-pointer items-center justify-center border-4 border-dashed border-parchment/40 p-3 font-pixel text-[11px] text-parchment/80 hover:border-lantern hover:text-lantern"
            >
              {QUEST_LOG.addSide}
            </button>
          ) : (
            <p className="text-[20px] text-parchment/70">{QUEST_LOG.sideLimit(SIDE.max)}</p>
          ))}
      </section>

      {footer && <div className="mt-auto pt-4">{footer}</div>}
    </main>
  );
}
