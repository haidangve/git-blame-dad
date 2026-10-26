import type { Skill, Teacher } from "@/data/skills";
import { TEACHER_ORDER } from "@/data/story";

// FNV-1a, so the same text always gets the same fake commit hash.
function fnv(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export const shortHash = (seed: string) => fnv(seed).toString(16).padStart(8, "0").slice(0, 7);

/** Cleared quests, oldest memory first. */
export function blameOrder(skills: Skill[]): Skill[] {
  return skills
    .filter((s) => s.done)
    .sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999) || a.title.localeCompare(b.title));
}

/** `git shortlog -sn`: every teacher who taught something, then Dad, always, even at zero. */
export function shortlog(skills: Skill[]): { teacher: Teacher; count: number }[] {
  const counts = new Map<Teacher, number>();
  for (const s of skills) if (s.done && s.teacher) counts.set(s.teacher, (counts.get(s.teacher) ?? 0) + 1);
  const rows = TEACHER_ORDER.filter((t) => t !== "dad" && counts.get(t)).map((t) => ({ teacher: t, count: counts.get(t)! }));
  rows.sort((a, b) => b.count - a.count);
  return [...rows, { teacher: "dad", count: counts.get("dad") ?? 0 }];
}

export type Tally = {
  quests: number;
  totalXP: number;
  firstYear?: number;
  lastYear?: number;
  dadQuests: number;
  dadXP: number;
  /** Dad's share of the XP, 0–100, rounded. Honest: if he taught something, it shows. */
  dadSharePct: number;
};

export function tally(skills: Skill[]): Tally {
  const done = skills.filter((s) => s.done);
  const years = done.map((s) => s.year).filter((y): y is number => typeof y === "number");
  const totalXP = done.reduce((n, s) => n + s.xp, 0);
  const dad = done.filter((s) => s.teacher === "dad");
  const dadXP = dad.reduce((n, s) => n + s.xp, 0);
  return {
    quests: done.length,
    totalXP,
    firstYear: years.length ? Math.min(...years) : undefined,
    lastYear: years.length ? Math.max(...years) : undefined,
    dadQuests: dad.length,
    dadXP,
    dadSharePct: totalXP ? Math.round((dadXP / totalXP) * 100) : 0,
  };
}
