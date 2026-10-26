"use client";

import { useState } from "react";
import type { Region, Skill } from "@/data/skills";
import { MODAL, QUEST_LOG, REGIONS } from "@/data/story";
import type { Save } from "@/hooks/useSave";
import { Hero } from "./Hero";
import { QuestCard } from "./QuestCard";

function XPBar({ totalXP, level }: { totalXP: number; level: number }) {
  const into = totalXP % 100;
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-pixel text-[12px] text-lantern sm:text-[14px]">LV {level}</span>
        <span className="text-[18px] text-parchment/80">
          {into}/100 XP · {totalXP} total
        </span>
      </div>
      <div
        className="mt-1 h-5 border-4 border-black bg-[#0a0d22]"
        role="progressbar"
        aria-label="XP to next level"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={into}
      >
        <div
          className="h-full bg-lantern transition-[width] duration-500"
          style={{ width: `${into}%`, boxShadow: "inset 0 -4px 0 var(--lantern-dim)" }}
        />
      </div>
    </div>
  );
}

function Settings({ onReset }: { onReset: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

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
        <div className="panel absolute right-0 top-full z-30 mt-2 w-56 p-3">
          {confirming ? (
            <div className="flex flex-col gap-2">
              <p className="text-[20px]">{QUEST_LOG.resetConfirm}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn px-3 py-2 text-[10px]"
                  onClick={() => {
                    onReset();
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
              {QUEST_LOG.resetSave}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

type Props = {
  save: Save;
  onToggle: (skill: Skill, rect: DOMRect) => void;
  onViewPhoto: (skill: Skill) => void;
  footer?: React.ReactNode;
};

export function QuestLog({ save, onToggle, onViewPhoto, footer }: Props) {
  const [region, setRegion] = useState<Region>("grooming");
  const active = REGIONS.find((r) => r.id === region)!;
  const visible = save.skills.filter((s) => s.region === region);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-4 px-4 py-4">
      <header className="panel-dark flex items-center gap-4 p-3 sm:p-4">
        <Hero scale={3} className="shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-pixel text-[12px] text-parchment sm:text-[16px]">{QUEST_LOG.heading}</h1>
            <div className="flex items-center gap-2">
              <span className="hidden text-[20px] text-parchment/80 sm:inline">
                {save.doneCount}/{save.skills.length} quests
              </span>
              <Settings onReset={save.resetToSeed} />
            </div>
          </div>
          <XPBar totalXP={save.totalXP} level={save.level} />
        </div>
      </header>

      {save.saveFailed && (
        <p role="alert" className="panel px-3 py-2 text-[20px] text-[#9b2a1c]">
          {MODAL.saveFailed}
        </p>
      )}

      <nav role="tablist" aria-label="Regions" className="flex flex-wrap gap-2 pb-2">
        {REGIONS.map((r) => {
          const all = save.skills.filter((s) => s.region === r.id);
          const done = all.filter((s) => s.done).length;
          const selected = r.id === region;
          return (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setRegion(r.id)}
              className={`btn shrink-0 px-3 py-2 text-[10px] sm:text-[11px] ${selected ? "" : "btn-ghost"}`}
            >
              {r.name} <span className="opacity-70">{done}/{all.length}</span>
            </button>
          );
        })}
      </nav>

      <p className="text-[22px] text-parchment/80">{active.blurb}</p>

      <section role="tabpanel" aria-label={active.name} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((s) => (
          <QuestCard key={s.id} skill={s} onToggle={onToggle} onViewPhoto={onViewPhoto} />
        ))}
      </section>

      {footer && <div className="mt-auto pt-4">{footer}</div>}
    </main>
  );
}
