import { describe, expect, it } from "vitest";
import { SKILLS } from "@/data/skills";
import { guestEntriesToImport, hydrateSkills, rowsToProgress, type ProgressMap } from "./progress";

describe("guestEntriesToImport", () => {
  it("brings over quests the account doesn't have", () => {
    const guest: ProgressMap = { shave: { done: true, teacher: "youtube" } };
    expect(guestEntriesToImport(guest, {})).toEqual([["shave", { done: true, teacher: "youtube" }]]);
  });

  it("never overwrites an answer the account already has", () => {
    const guest: ProgressMap = { shave: { done: true, teacher: "youtube" } };
    const cloud: ProgressMap = { shave: { done: true, teacher: "dad" } };
    expect(guestEntriesToImport(guest, cloud)).toEqual([]);
  });

  it("skips entries with no teacher, which the database would reject", () => {
    expect(guestEntriesToImport({ shave: { done: true } }, {})).toEqual([]);
  });

  it("skips entries that aren't done", () => {
    expect(guestEntriesToImport({ shave: { done: false, teacher: "mom" } }, {})).toEqual([]);
  });
});

describe("rowsToProgress", () => {
  it("drops rows with a teacher the game doesn't know instead of guessing", () => {
    const p = rowsToProgress([
      { skill_id: "shave", teacher: "youtube" },
      { skill_id: "tie", teacher: "grandpa" },
    ]);
    expect(Object.keys(p)).toEqual(["shave"]);
  });

  it("swaps a stored photo path for its signed URL, and leaves unsigned paths empty", () => {
    const p = rowsToProgress(
      [
        { skill_id: "shave", teacher: "youtube", photo_path: "u/shave.jpg" },
        { skill_id: "tie", teacher: "youtube", photo_path: "u/tie.jpg" },
      ],
      { "u/shave.jpg": "https://signed/shave" },
    );
    expect(p.shave.photo).toBe("https://signed/shave");
    expect(p.tie.photo).toBeUndefined();
  });

  it("turns database nulls into absent fields", () => {
    const p = rowsToProgress([{ skill_id: "shave", teacher: "mom", memory: null, year: null, teacher_name: null }]);
    expect(p.shave).toEqual({
      done: true,
      teacher: "mom",
      teacherName: undefined,
      memory: undefined,
      year: undefined,
      photo: undefined,
    });
  });
});

describe("hydrateSkills", () => {
  it("adds side quests after the map, flagged custom, at flat XP", () => {
    const skills = hydrateSkills({}, [{ id: "abc", title: "Hold a baby" }]);
    expect(skills).toHaveLength(SKILLS.length + 1);
    expect(skills.at(-1)).toMatchObject({ id: "custom:abc", region: "side", title: "Hold a baby", xp: 40, custom: true, done: false });
  });

  it("does not inherit Kai's seeded answers into a fresh log", () => {
    // SKILLS carries the demo's seeded answers; only the progress map may mark a quest done.
    const skills = hydrateSkills({}, []);
    expect(skills.some((s) => s.done || s.teacher || s.memory)).toBe(false);
  });
});
