import { ICONS } from "@/data/icons";
import { SKILLS, type Skill, type Teacher } from "@/data/skills";
import { SIDE, TEACHER_ORDER } from "@/data/story";

export type Progress = {
  done: boolean;
  teacher?: Teacher;
  teacherName?: string;
  memory?: string;
  year?: number;
  /** Data URL (uploaded), signed URL (cloud), or a path under /public (seeded). */
  photo?: string;
};

export type CustomQuest = { id: string; title: string };

export type ProgressMap = Record<string, Progress>;

export const CUSTOM_PREFIX = "custom:";
export const customSkillId = (questId: string) => `${CUSTOM_PREFIX}${questId}`;
export const isCustomId = (skillId: string) => skillId.startsWith(CUSTOM_PREFIX);

export const isTeacher = (v: unknown): v is Teacher => typeof v === "string" && (TEACHER_ORDER as string[]).includes(v);

/** Every quest on the map plus the player's side quests, with their progress merged in. */
export function hydrateSkills(progress: ProgressMap, custom: CustomQuest[]): Skill[] {
  const sides: Skill[] = custom.map((c) => ({
    id: customSkillId(c.id),
    region: "side",
    title: c.title,
    xp: SIDE.xp,
    tutorialQuery: `how to ${c.title}`,
    pixelIcon: ICONS.scroll,
    custom: true,
  }));
  return [...SKILLS, ...sides].map((s) => {
    const p = progress[s.id];
    return {
      ...s,
      done: !!p?.done,
      teacher: p?.teacher,
      teacherName: p?.teacherName,
      memory: p?.memory,
      year: p?.year,
      photo: p?.photo,
    };
  });
}

/** One row of the `progress` table, as the database speaks it. */
export type ProgressRow = {
  skill_id: string;
  teacher: string;
  teacher_name?: string | null;
  memory?: string | null;
  year?: number | null;
  photo_path?: string | null;
};

/** Rows from the database to a ProgressMap. Rows with an unknown teacher are dropped, not guessed. */
export function rowsToProgress(rows: ProgressRow[], photos: Record<string, string> = {}): ProgressMap {
  const out: ProgressMap = {};
  for (const r of rows) {
    if (!isTeacher(r.teacher)) continue;
    out[r.skill_id] = {
      done: true,
      teacher: r.teacher,
      teacherName: r.teacher_name ?? undefined,
      memory: r.memory ?? undefined,
      year: r.year ?? undefined,
      photo: r.photo_path ? photos[r.photo_path] : undefined,
    };
  }
  return out;
}

/**
 * What a guest save adds to a cloud save on first sign-in: only quests the
 * cloud doesn't have yet. The cloud copy always wins a conflict, so signing in
 * on a second device can never overwrite the first device's answers.
 */
export function guestEntriesToImport(guest: ProgressMap, cloud: ProgressMap): [string, Progress][] {
  return Object.entries(guest).filter(([id, p]) => p.done && p.teacher && !cloud[id]);
}
