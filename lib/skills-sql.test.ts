import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SKILLS } from "@/data/skills";
import { SIDE, TEACHER_ORDER } from "@/data/story";

// The leaderboard scores XP in SQL, so the database's copy of the quest map
// has to match data/skills.ts exactly. This reads every migration in order.
const dir = join(process.cwd(), "supabase", "migrations");
const sql = readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort()
  .map((f) => readFileSync(join(dir, f), "utf8"))
  .join("\n");

const seeded = new Map(
  [...sql.matchAll(/\('([a-z0-9_]+)', '([a-z]+)', (\d+)\)/g)].map((m) => [m[1], { region: m[2], xp: Number(m[3]) }]),
);

describe("skills table vs data/skills.ts", () => {
  it("has every quest with the same region and XP", () => {
    for (const s of SKILLS) expect(seeded.get(s.id), s.id).toEqual({ region: s.region, xp: s.xp });
  });

  it("has no quest the game doesn't know", () => {
    const ids = new Set(SKILLS.map((s) => s.id));
    expect([...seeded.keys()].filter((id) => !ids.has(id))).toEqual([]);
  });

  it("allows exactly the game's teachers", () => {
    const m = sql.match(/teacher in \(([^)]+)\)/);
    expect(m).not.toBeNull();
    const allowed = [...m![1].matchAll(/'([a-z]+)'/g)].map((x) => x[1]);
    expect(allowed.sort()).toEqual([...TEACHER_ORDER].sort());
  });

  it("caps side quests and prices them like the game does", () => {
    expect(sql).toContain(`>= ${SIDE.max} then`);
    expect(sql).toContain(`coalesce(s.xp, ${SIDE.xp})`);
  });
});
