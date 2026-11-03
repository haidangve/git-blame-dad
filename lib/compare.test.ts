import { describe, expect, it } from "vitest";
import { compareLogs } from "./compare";
import { hydrateSkills, type ProgressMap } from "./progress";

describe("compareLogs", () => {
  it("lines up shared quests and marks matching teachers", () => {
    const a = hydrateSkills({ shave: { done: true, teacher: "dad" }, tie: { done: true, teacher: "youtube" } }, []);
    const b = hydrateSkills(
      { shave: { done: true, teacher: "youtube" }, tie: { done: true, teacher: "youtube" }, iron: { done: true, teacher: "mom" } },
      [],
    );
    const c = compareLogs(a, b);
    expect(c.shared.map((s) => [s.id, s.same])).toEqual([
      ["shave", false],
      ["tie", true],
    ]);
    expect(c.onlyA).toEqual([]);
    expect(c.onlyB.map((s) => s.id)).toEqual(["iron"]);
    expect(c.dadDelta).toBe(50);
  });

  it("never pairs two players' side quests, even with the same id", () => {
    const p: ProgressMap = { "custom:x": { done: true, teacher: "self" } };
    const c = compareLogs(hydrateSkills(p, [{ id: "x", title: "Same" }]), hydrateSkills(p, [{ id: "x", title: "Same" }]));
    expect(c.shared).toEqual([]);
    expect(c.onlyA).toEqual([]);
  });
});
