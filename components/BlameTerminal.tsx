"use client";

import { useEffect, useRef, useState } from "react";
import type { Skill, Teacher } from "@/data/skills";
import { BLAME, TEACHERS } from "@/data/story";
import { sfx } from "@/hooks/useSound";
import { authorCell, blameDate, blameOrder, fnName, shortHash, shortlog } from "@/lib/blame";
import { Epilogue } from "./Epilogue";

type Line =
  | { kind: "cmd"; text: string; done: boolean }
  | { kind: "blame"; skill: Skill }
  | { kind: "out"; text: string; color?: string }
  | { kind: "shortlog"; teacher: Teacher; count: number };

// The empty `git log --author="dad"` is the whole point. Do not shorten.
const DAD_PAUSE_MS = 3500;

const CANCELLED = Symbol("cancelled");

type Props = {
  skills: Skill[];
  onExit: () => void;
  onStartOwn: () => void;
};

export function BlameTerminal({ skills, onExit, onStartOwn }: Props) {
  const [lines, setLines] = useState<Line[]>([]);
  const [phase, setPhase] = useState<"terminal" | "epilogue">("terminal");
  const [run, setRun] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  // Snapshot the skills when the run starts so editing elsewhere can't reshuffle it mid-play.
  const skillsRef = useRef(skills);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

  useEffect(() => {
    let alive = true;
    const wait = (ms: number) =>
      new Promise<void>((resolve, reject) => setTimeout(() => (alive ? resolve() : reject(CANCELLED)), ms));
    const push = (line: Line) => setLines((prev) => [...prev, line]);
    const setLast = (line: Line) => setLines((prev) => [...prev.slice(0, -1), line]);
    const prompt = () => push({ kind: "cmd", text: "", done: false });

    const type = async (text: string, msPerChar: number) => {
      for (let i = 1; i <= text.length; i++) {
        setLast({ kind: "cmd", text: text.slice(0, i), done: false });
        if (i % 2 === 0) sfx.key();
        await wait(msPerChar);
      }
      await wait(350);
      setLast({ kind: "cmd", text, done: true });
    };

    const script = async () => {
      const all = skillsRef.current;
      const order = blameOrder(all);
      const dadSkills = order.filter((s) => s.teacher === "dad");
      const finalLine = BLAME.finalLine.trim() || BLAME.defaultFinalLine;

      setLines([]);
      setPhase("terminal");
      prompt();
      await wait(900);

      await type("git blame me.txt", 55);
      for (const skill of order) {
        push({ kind: "blame", skill });
        sfx.line();
        await wait(170);
      }
      prompt();
      await wait(1600);

      await type('git log --author="dad"', 75);
      for (const s of dadSkills) {
        push({ kind: "out", text: `commit ${shortHash(s.id)}`, color: "#e8d27a" });
        push({ kind: "out", text: `Author: ${s.teacherName || "Dad"}` });
        push({ kind: "out", text: `    ${fnName(s.title)}()` });
      }
      prompt();
      await wait(DAD_PAUSE_MS);

      await type("git shortlog -sn", 55);
      for (const row of shortlog(all)) {
        push({ kind: "shortlog", ...row });
        sfx.line();
        await wait(260);
      }
      prompt();
      await wait(2000);

      await type(`git commit -m "${finalLine}"`, 95);
      await wait(500);
      push({ kind: "out", text: `[main ${shortHash(finalLine)}] Author: ${BLAME.authorName}`, color: "#ffffff" });
      sfx.final();
      prompt();
      await wait(4000);

      setPhase("epilogue");
    };

    script().catch((e) => {
      if (e !== CANCELLED) throw e;
    });
    return () => {
      alive = false;
    };
  }, [run]);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  if (phase === "epilogue") {
    return <Epilogue onStartOwn={onStartOwn} onBack={onExit} onReplay={() => setRun((r) => r + 1)} />;
  }

  const open = pinned ?? hovered;
  const lastIndex = lines.length - 1;

  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-black text-term">
      <div className="crt-on flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 border-b-4 border-term-dim/40 px-4 py-2 text-[18px] text-term-dim">
          <span>kai@quest-log: ~/life</span>
          <button type="button" onClick={onExit} className="cursor-pointer hover:text-term">
            [esc] back
          </button>
        </div>

        <div
          ref={scroller}
          className="term-glow no-scrollbar flex-1 overflow-auto px-4 pb-10 pt-3 text-[19px] leading-[1.3] sm:text-[24px]"
          aria-live="polite"
        >
          <div className="mx-auto max-w-5xl">
            {lines.map((line, i) => {
              if (line.kind === "cmd") {
                return (
                  <div key={i} className="whitespace-pre">
                    <span className="text-term-dim">$ </span>
                    {line.text}
                    {i === lastIndex && !line.done && <span className="blink">█</span>}
                  </div>
                );
              }
              if (line.kind === "out") {
                return (
                  <div key={i} className="whitespace-pre" style={{ color: line.color }}>
                    {line.text}
                  </div>
                );
              }
              if (line.kind === "shortlog") {
                const t = TEACHERS[line.teacher];
                return (
                  <div key={i} className="whitespace-pre" style={{ opacity: line.count === 0 ? 0.6 : 1 }}>
                    {String(line.count).padStart(4)}
                    {"  "}
                    <span style={{ color: t.color }}>{t.short}</span>
                  </div>
                );
              }
              const s = line.skill;
              const t = s.teacher ? TEACHERS[s.teacher] : null;
              const isOpen = open === s.id;
              return (
                <div key={i}>
                  <button
                    type="button"
                    className="block w-full cursor-pointer whitespace-pre text-left hover:bg-term/10"
                    aria-expanded={isOpen}
                    onMouseEnter={() => setHovered(s.id)}
                    onMouseLeave={() => setHovered((h) => (h === s.id ? null : h))}
                    onClick={() => setPinned((p) => (p === s.id ? null : s.id))}
                  >
                    <span className="text-term-dim">{shortHash(s.id)}</span> (
                    <span style={{ color: t?.color }}>{authorCell(s)}</span> {blameDate(s)}){"  "}
                    {fnName(s.title)}()
                  </button>
                  {isOpen && (s.memory || s.photo) && (
                    <div className="flex items-start gap-3 py-1 pl-[9ch] text-term/75">
                      {s.photo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.photo} alt="" className="h-20 w-20 shrink-0 border-2 border-term-dim object-cover" />
                      )}
                      {s.memory && <span># {s.memory}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div aria-hidden className="scanlines pointer-events-none absolute inset-0" />
    </div>
  );
}
