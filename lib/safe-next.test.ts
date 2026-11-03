import { describe, expect, it } from "vitest";
import { safeNext } from "./safe-next";

describe("safeNext", () => {
  it("keeps same-site paths", () => {
    expect(safeNext("/hall?sort=dad")).toBe("/hall?sort=dad");
  });

  it.each([null, undefined, "", "hall", "https://evil.com", "//evil.com", "/\\evil.com"])("falls back to / for %j", (v) => {
    expect(safeNext(v)).toBe("/");
  });
});
