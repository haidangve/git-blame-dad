"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ICON_PALETTE } from "@/data/icons";
import type { Skill, Teacher } from "@/data/skills";
import { RECAP, REGIONS, TEACHERS } from "@/data/story";
import { sfx } from "@/hooks/useSound";
import { blameOrder } from "@/lib/blame";
import { Epilogue } from "./Epilogue";
import { PixelSprite } from "./PixelSprite";
import { RecapTally } from "./RecapTally";
import { NightSky } from "./TitleScreen";

// Photos get time to land; icon-only slides keep the montage moving.
const slideMs = (s: Skill) => (s.photo ? 5500 : s.memory ? 2600 : 1600);

type Props = {
  skills: Skill[];
  onExit: () => void;
  onStartOwn: () => void;
};

export function BlameCarousel({ skills, onExit, onStartOwn }: Props) {
  // Snapshot on open so nothing reshuffles mid-show.
  const snapshot = useRef(skills).current;
  const slides = useMemo(() => blameOrder(snapshot), [snapshot]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [phase, setPhase] = useState<"slides" | "tally" | "epilogue">(slides.length ? "slides" : "tally");

  const next = useCallback(() => {
    sfx.line();
    if (index + 1 < slides.length) setIndex(index + 1);
    else setPhase("tally");
  }, [index, slides.length]);
  const prev = useCallback(() => {
    sfx.line();
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  useEffect(() => {
    if (phase !== "slides" || paused || !slides[index]) return;
    const id = window.setTimeout(next, slideMs(slides[index]));
    return () => window.clearTimeout(id);
  }, [phase, paused, index, slides, next]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
      if (phase !== "slides") return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, next, prev, onExit]);

  const replay = () => {
    setIndex(0);
    setPaused(false);
    setPhase(slides.length ? "slides" : "tally");
  };

  if (phase === "epilogue") return <Epilogue onStartOwn={onStartOwn} onBack={onExit} onReplay={replay} />;

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-hidden">
      <NightSky count={40} />

      <header className="relative z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 pt-3">
        <span className="font-pixel text-[10px] text-parchment/70 sm:text-[12px]">$ {RECAP.header}</span>
        <button type="button" onClick={onExit} className="cursor-pointer text-[20px] text-parchment/60 hover:text-parchment">
          [esc] back
        </button>
      </header>

      {phase === "tally" ? (
        <RecapTally skills={snapshot} onDone={() => setPhase("epilogue")} />
      ) : (
        <>
          <DadMeter seen={slides.slice(0, index + 1)} />
          <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 py-2">
            <Slide key={slides[index].id} skill={slides[index]} />
          </main>
          <nav aria-label="Slides" className="relative z-10 flex flex-wrap items-center justify-center gap-3 px-4 pb-4">
            <button type="button" className="btn btn-ghost px-3 py-2" onClick={prev} disabled={index === 0} aria-label="Previous">
              {RECAP.prev}
            </button>
            <button type="button" className="btn btn-ghost px-3 py-2 text-[10px]" onClick={() => setPaused((p) => !p)}>
              {paused ? RECAP.play : RECAP.pause}
            </button>
            <button type="button" className="btn btn-ghost px-3 py-2" onClick={next} aria-label="Next">
              {RECAP.next}
            </button>
            <span className="w-16 text-center text-[20px] text-parchment/70">
              {index + 1}/{slides.length}
            </span>
            <button type="button" className="btn px-3 py-2 text-[10px]" onClick={() => setPhase("tally")}>
              {RECAP.skip}
            </button>
          </nav>
        </>
      )}
    </div>
  );
}

/** Running count while the slides play: who has shown up so far, and how many of those were Dad. */
function DadMeter({ seen }: { seen: Skill[] }) {
  const dad = seen.filter((s) => s.teacher === "dad").length;
  const counts = new Map<Teacher, number>();
  for (const s of seen) if (s.teacher && s.teacher !== "dad") counts.set(s.teacher, (counts.get(s.teacher) ?? 0) + 1);
  const pct = seen.length ? dad / seen.length : 0;

  return (
    <div className="relative z-10 mx-auto mt-2 flex w-full max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4">
      <div className="flex items-center gap-3">
        <span className="font-pixel text-[10px] text-lantern sm:text-[11px]">{RECAP.dadMeter}</span>
        <div className="flex gap-1" role="meter" aria-label={RECAP.dadPresent} aria-valuemin={0} aria-valuemax={seen.length} aria-valuenow={dad}>
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className="h-4 w-3 border-2 border-black"
              style={{ background: i < Math.round(pct * 10) ? "var(--lantern)" : "#0a0d22" }}
            />
          ))}
        </div>
        <span className="text-[20px] text-parchment">
          {RECAP.dadPresent}: <span className="text-lantern">{dad}</span>/{seen.length}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[18px] text-parchment/80">
        <span className="text-parchment/60">{RECAP.showedUp}:</span>
        {[...counts].map(([t, n]) => (
          <span key={t} style={{ color: TEACHERS[t].color }}>
            {TEACHERS[t].short}×{n}
          </span>
        ))}
      </div>
    </div>
  );
}

function Slide({ skill }: { skill: Skill }) {
  const t = skill.teacher ? TEACHERS[skill.teacher] : null;
  const region = REGIONS.find((r) => r.id === skill.region)?.name;

  return (
    <article className="slide-in panel grid max-h-full w-full max-w-5xl gap-4 p-3 sm:p-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="flex h-[34dvh] items-center justify-center overflow-hidden border-4 border-ink bg-ink md:h-[50dvh]">
        {skill.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={skill.photo} alt={skill.memory ?? skill.title} className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-parchment-2">
            <PixelSprite rows={skill.pixelIcon} palette={ICON_PALETTE} scale={14} />
            <span className="text-[18px] text-ink/50">{RECAP.noPhoto}</span>
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-3">
        <p className="text-[20px] text-ink/60">
          {region}
          {skill.year ? ` · ${skill.year}` : ""} · +{skill.xp} XP
        </p>
        <h2 className="font-pixel text-[15px] leading-[1.5] sm:text-[20px]">{skill.title}</h2>
        {t && (
          <p className="flex items-center gap-2 text-[22px]">
            <span className="text-ink/60">{RECAP.taughtBy}</span>
            <PixelSprite rows={t.icon} palette={{ k: t.color, w: "#fff" }} scale={3} />
            <span className="font-bold" style={{ color: t.color, textShadow: "1px 1px 0 #2b1d0e" }}>
              {skill.teacherName || t.label}
            </span>
          </p>
        )}
        {skill.memory && <blockquote className="text-[24px] leading-tight sm:text-[28px]">“{skill.memory}”</blockquote>}
      </div>
    </article>
  );
}
