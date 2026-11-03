import { describe, expect, it } from "vitest";
import { SKILLS, type Skill, type Teacher } from "@/data/skills";
import { achievements, newlyUnlocked } from "./achievements";
import { hydrateSkills, type Progress, type ProgressMap } from "./progress";

const log = (entries: Record<string, Teacher>, extra: Record<string, Partial<Progress>> = {}) => {
  const p: ProgressMap = {};
  for (const [id, teacher] of Object.entries(entries)) p[id] = { done: true, teacher, ...(extra[id] ?? {}) };
  return hydrateSkills(p, []);
};
const unlocked = (skills: Skill[]) => new Set(achievements(skills).filter((a) => a.unlocked).map((a) => a.id));

describe("achievements", () => {
  it("unlocks nothing on an empty log", () => {
    expect(unlocked(hydrateSkills({}, [])).size).toBe(0);
  });

  it("gives He Showed Up for one Dad quest, and not for a log with none", () => {
    expect(unlocked(log({ shave: "dad" })).has("he-showed-up")).toBe(true);
    expect(unlocked(log({ shave: "mom", tie: "uncle" })).has("he-showed-up")).toBe(false);
  });

  it("counts YouTube and Reddit together for Raised by the Internet, from exactly 5", () => {
    const four = log({ shave: "youtube", tie: "youtube", iron: "reddit", nails: "reddit" });
    expect(unlocked(four).has("internet")).toBe(false);
    const five = log({ shave: "youtube", tie: "youtube", iron: "reddit", nails: "reddit", cologne: "youtube" });
    expect(unlocked(five).has("internet")).toBe(true);
  });

  it("gives Cartographer for a full map region, and not for a full side-quest tab", () => {
    const grooming = Object.fromEntries(SKILLS.filter((s) => s.region === "grooming").map((s) => [s.id, "self" as Teacher]));
    expect(unlocked(log(grooming)).has("cartographer")).toBe(true);
    const sideOnly = hydrateSkills({ "custom:a": { done: true, teacher: "self" } }, [{ id: "a", title: "x" }]);
    expect(unlocked(sideOnly).has("cartographer")).toBe(false);
  });

  it("keeps Every Line locked until every map quest is cleared", () => {
    const all: Record<string, Teacher> = Object.fromEntries(SKILLS.map((s) => [s.id, "self" as Teacher]));
    expect(unlocked(log(all)).has("completionist")).toBe(true);
    const missingOne = { ...all };
    delete missingOne.laces;
    expect(unlocked(log(missingOne)).has("completionist")).toBe(false);
  });

  it("measures The Long Road from years, ignoring quests with no year", () => {
    const nine = log({ shave: "mom", tie: "mom", iron: "mom" }, { shave: { year: 2010 }, tie: { year: 2019 } });
    expect(unlocked(nine).has("long-road")).toBe(false);
    const ten = log({ shave: "mom", tie: "mom" }, { shave: { year: 2010 }, tie: { year: 2020 } });
    expect(unlocked(ten).has("long-road")).toBe(true);
  });
});

describe("newlyUnlocked", () => {
  it("reports only badges that flipped on", () => {
    const before = achievements(log({ shave: "mom" }));
    const after = achievements(log({ shave: "mom", tie: "dad" }));
    expect(newlyUnlocked(before, after).map((a) => a.id)).toEqual(["he-showed-up"]);
  });

  it("reports nothing when a badge is taken away", () => {
    const before = achievements(log({ shave: "dad" }));
    const after = achievements(log({ shave: "mom" }));
    expect(newlyUnlocked(before, after)).toEqual([]);
  });
});
