import type { Skill, Teacher } from "@/data/skills";
import { TEACHER_ORDER, TEACHERS } from "@/data/story";

// FNV-1a, so every skill gets the same fake commit hash on every run.
function fnv(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export const shortHash = (seed: string) => fnv(seed).toString(16).padStart(8, "0").slice(0, 7);

/** "Change a tire" → change_a_tire, "Shave" → how_to_shave, "Say \"I'm not okay\"" → say_im_not_okay */
export function fnName(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/['"’]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return slug.includes("_") ? slug : `how_to_${slug}`;
}

export function blameDate(skill: Skill): string {
  const h = fnv(skill.id + "date");
  const year = skill.year ?? new Date().getFullYear();
  const month = String((h % 12) + 1).padStart(2, "0");
  const day = String(((h >>> 8) % 28) + 1).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const AUTHOR_WIDTH = 15;

export function authorCell(skill: Skill): string {
  const name = skill.teacherName || (skill.teacher ? TEACHERS[skill.teacher].label : "unknown");
  return name.length > AUTHOR_WIDTH ? name.slice(0, AUTHOR_WIDTH - 1) + "…" : name.padEnd(AUTHOR_WIDTH);
}

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
  const dad = { teacher: "dad" as const, count: counts.get("dad") ?? 0 };
  return dad.count > 0 ? [...rows, dad].sort((a, b) => b.count - a.count) : [...rows, dad];
}
