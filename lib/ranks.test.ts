import { describe, expect, it } from "vitest";
import { levelFor, rankFor } from "./ranks";

describe("levels and ranks", () => {
  it("levels up every 100 XP, starting at 1", () => {
    expect([0, 99, 100, 250].map(levelFor)).toEqual([1, 1, 2, 3]);
  });

  it("never goes below level 1", () => {
    expect(levelFor(-50)).toBe(1);
  });

  it("names the rank by the highest threshold reached", () => {
    expect(rankFor(1)).toBe("Lost Kid");
    expect(rankFor(9)).toBe("Journeyman");
    expect(rankFor(10)).toBe("Self-Taught");
    expect(rankFor(99)).toBe("The One Who Teaches");
  });
});
