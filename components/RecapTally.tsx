"use client";

import { useEffect, useMemo, useState } from "react";
import type { Skill } from "@/data/skills";
import { BLAME, RECAP, TEACHERS } from "@/data/story";
import { sfx } from "@/hooks/useSound";
import { shortHash, shortlog, tally } from "@/lib/blame";

// Dad's row sits on "…" this long before resolving. This silence is the whole point. Do not shorten.
const DAD_PAUSE_MS = 3500;

type Props = { skills: Skill[]; onDone: () => void };

/** The end-of-show count, revealed one row at a time. */
export function RecapTally({ skills, onDone }: Props) {
  const t = useMemo(() => tally(skills), [skills]);
  const rows = useMemo(() => shortlog(skills), [skills]);
  const others = useMemo(() => rows.filter((r) => r.teacher !== "dad"), [rows]);
  const dadRow = rows.find((r) => r.teacher === "dad")!;
  const max = Math.max(1, ...rows.map((r) => r.count));
  const finalLine = BLAME.finalLine.trim() || BLAME.defaultFinalLine;

  // Reveal schedule: [delay before this step]. Step indices are named below.
  const schedule = useMemo(
    () => [
      400, // 1 quests
      700, // 2 years
      700, // 3 xp
      900, // 4 "who showed up" heading
      ...others.map(() => 320), // bars
      600, // dad row, unresolved
      DAD_PAUSE_MS, // dad row resolves
      1400, // share
      2600, // final line
      1800, // continue button
    ],
    [others],
  );
  const S = {
    quests: 1,
    years: 2,
    xp: 3,
    heading: 4,
    firstBar: 5,
    dadRow: 5 + others.length,
    dadResolved: 6 + others.length,
    share: 7 + others.length,
    final: 8 + others.length,
    cont: 9 + others.length,
  };
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= schedule.length) return;
    const id = window.setTimeout(() => {
      const nextStep = step + 1;
      setStep(nextStep);
      if (nextStep === S.final) sfx.final();
      else if (nextStep !== S.dadRow && nextStep !== S.dadResolved) sfx.line();
    }, schedule[step]);
    return () => window.clearTimeout(id);
  }, [step, schedule, S.final, S.dadRow, S.dadResolved]);

  const years =
    t.firstYear && t.lastYear ? `${t.firstYear} → ${t.lastYear} · ${t.lastYear - t.firstYear} years` : "—";

  return (
    <main className="relative z-10 flex min-h-0 flex-1 overflow-y-auto px-4 py-4">
      <section
        className="panel slide-in m-auto grid w-full max-w-5xl gap-x-8 gap-y-5 p-4 sm:p-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
        aria-live="polite"
      >
        <div>
          <h2 className="font-pixel text-[14px] sm:text-[18px]">{RECAP.tallyTitle}</h2>

          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 text-[22px]">
            {step >= S.quests && <Stat label={RECAP.questsCleared} value={String(t.quests)} />}
            {step >= S.years && <Stat label={RECAP.years} value={years} />}
            {step >= S.xp && <Stat label={RECAP.xp} value={t.totalXP.toLocaleString("en-US")} />}
          </dl>

          {step >= S.heading && <h3 className="mt-4 font-pixel text-[11px] sm:text-[12px]">{RECAP.whoShowedUp}</h3>}
          <div className="mt-2 flex flex-col gap-1">
            {others.map((r, i) =>
              step >= S.firstBar + i ? (
                <Bar key={r.teacher} label={TEACHERS[r.teacher].short} count={r.count} max={max} color={TEACHERS[r.teacher].color} />
              ) : null,
            )}
            {step >= S.dadRow && (
              <Bar label={TEACHERS.dad.short} count={step >= S.dadResolved ? dadRow.count : null} max={max} color={TEACHERS.dad.color} />
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-5 text-center md:border-l-4 md:border-ink/15 md:pl-8">
          {step >= S.share && (
            <div>
              <p className="font-pixel text-[10px] leading-[1.6] text-ink/70 sm:text-[12px]">{RECAP.dadShare}</p>
              <p
                className="mt-3 font-pixel text-[48px] leading-none text-[#9b2a1c] sm:text-[72px]"
                style={{ textShadow: "4px 4px 0 rgba(0,0,0,.15)" }}
              >
                {t.dadSharePct}%
              </p>
              <p className="mt-3 text-[20px] text-ink/60">{RECAP.dadShareDetail(t.dadQuests, t.quests, t.dadXP)}</p>
            </div>
          )}

          {step >= S.final && (
            <div className="fade-in">
              <p className="text-[18px] text-ink/50">
                [main {shortHash(finalLine)}] Author: {BLAME.authorName}
              </p>
              <p className="mt-1 text-[26px] leading-tight sm:text-[30px]">“{finalLine}”</p>
            </div>
          )}

          {step >= S.cont && (
            <button type="button" className="btn" onClick={onDone} autoFocus>
              {RECAP.continue}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-ink/60">{label}</dt>
      <dd className="text-right">{value}</dd>
    </>
  );
}

/** One pixel bar. count === null renders the waiting state: an empty track and a blinking cursor. */
function Bar({ label, count, max, color }: { label: string; count: number | null; max: number; color: string }) {
  const pct = count === null ? 0 : (count / max) * 100;
  return (
    <div className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3 text-[20px] sm:grid-cols-[8rem_1fr_2rem] sm:text-[21px]">
      <span className="font-bold" style={{ color, textShadow: "1px 1px 0 #2b1d0e" }}>
        {label}
      </span>
      <div className="h-5 border-4 border-ink bg-parchment-hi">
        <div className="h-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-right">{count === null ? <span className="blink">█</span> : count}</span>
    </div>
  );
}
