import type { Skill, Teacher } from "@/data/skills";
import { MAP_REGIONS, REGIONS } from "@/data/story";
import { tally, villageSize } from "./blame";
import { levelFor } from "./ranks";

export type Achievement = { id: string; title: string; detail: string; unlocked: boolean };

const by = (done: Skill[], ...teachers: Teacher[]) => done.filter((s) => s.teacher && teachers.includes(s.teacher)).length;

/** Badges, computed fresh from the log every time. Nothing is stored, so unchecking a quest can take one back. */
export function achievements(skills: Skill[]): Achievement[] {
  const done = skills.filter((s) => s.done);
  const t = tally(skills);
  const span = t.firstYear && t.lastYear ? t.lastYear - t.firstYear : 0;
  const mapSkills = skills.filter((s) => !s.custom);
  const clearedRegions = MAP_REGIONS.filter((r) => {
    const all = skills.filter((s) => s.region === r);
    return all.length > 0 && all.every((s) => s.done);
  });

  const list: Omit<Achievement, "unlocked">[] = [];
  const has: Record<string, boolean> = {};
  const add = (id: string, title: string, detail: string, ok: boolean) => {
    list.push({ id, title, detail });
    has[id] = ok;
  };

  add("day-one", "Day One", "Clear your first quest.", done.length >= 1);
  add("internet", "Raised by the Internet", "5 quests taught by YouTube or Reddit.", by(done, "youtube", "reddit") >= 5);
  add("village", "It Takes a Village", "5 different kinds of teacher showed up.", villageSize(skills) >= 5);
  add("self-patched", "Self-Patched", "5 quests learned by trial & error.", by(done, "self") >= 5);
  add("both-jobs", "Both Jobs", "Mom taught you 5 quests.", by(done, "mom") >= 5);
  add("found-family", "Found Family", "Friends taught you 5 quests.", by(done, "friend") >= 5);
  add("he-showed-up", "He Showed Up", "Dad taught you something. It counts.", by(done, "dad") >= 1);
  add("storyteller", "Storyteller", "Write a memory for 10 quests.", done.filter((s) => s.memory).length >= 10);
  add("album", "Photo Album", "Add a photo to 5 quests.", done.filter((s) => s.photo).length >= 5);
  add("long-road", "The Long Road", "Your log spans 10 years or more.", span >= 10);
  add("off-the-map", "Off the Map", "Clear a side quest you wrote yourself.", done.some((s) => s.custom));
  add("cartographer", "Cartographer", "Clear every quest in one region.", clearedRegions.length >= 1);
  add("inner-work", "Inner Work", "Clear the whole Inner region.", clearedRegions.includes("inner"));
  add("grown-up", "Grown Up", "Reach level 10.", levelFor(t.totalXP) >= 10);
  add("completionist", "Every Line", "Clear every quest on the map.", mapSkills.length > 0 && mapSkills.every((s) => s.done));

  return list.map((a) => ({ ...a, unlocked: has[a.id] }));
}

/** Badges in `after` that weren't unlocked in `before`. Used for the unlock toast. */
export function newlyUnlocked(before: Achievement[], after: Achievement[]): Achievement[] {
  const had = new Set(before.filter((a) => a.unlocked).map((a) => a.id));
  return after.filter((a) => a.unlocked && !had.has(a.id));
}

export const regionName = (id: string) => REGIONS.find((r) => r.id === id)?.name ?? id;
