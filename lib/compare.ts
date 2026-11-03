import type { Skill } from "@/data/skills";
import { tally } from "./blame";

export type SharedQuest = { id: string; title: string; a: Skill; b: Skill; same: boolean };

export type Comparison = {
  shared: SharedQuest[];
  onlyA: Skill[];
  onlyB: Skill[];
  /** Percentage points: A's Dad's share minus B's. */
  dadDelta: number;
};

/**
 * Two logs side by side. Side quests are left out of the quest-by-quest
 * part: two players' side quests are never the same quest, even with the same title.
 */
export function compareLogs(a: Skill[], b: Skill[]): Comparison {
  const doneA = new Map(a.filter((s) => s.done && !s.custom).map((s) => [s.id, s]));
  const doneB = new Map(b.filter((s) => s.done && !s.custom).map((s) => [s.id, s]));
  const shared: SharedQuest[] = [];
  for (const [id, sa] of doneA) {
    const sb = doneB.get(id);
    if (sb) shared.push({ id, title: sa.title, a: sa, b: sb, same: sa.teacher === sb.teacher });
  }
  return {
    shared,
    onlyA: [...doneA.values()].filter((s) => !doneB.has(s.id)),
    onlyB: [...doneB.values()].filter((s) => !doneA.has(s.id)),
    dadDelta: tally(a).dadSharePct - tally(b).dadSharePct,
  };
}
