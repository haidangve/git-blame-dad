import type { SupabaseClient } from "@supabase/supabase-js";
import type { Skill, Teacher } from "@/data/skills";
import { HANDLE_RE } from "./handle";
import { isTeacher, hydrateSkills, rowsToProgress, type CustomQuest, type ProgressRow } from "./progress";

export type PublicProfile = {
  handle: string;
  displayName: string | null;
  isPublic: boolean;
  shareMemories: boolean;
  isMe: boolean;
  joined: string;
  skills: Skill[];
};

type ProfileJson = {
  handle: string;
  display_name: string | null;
  is_public: boolean;
  share_memories: boolean;
  is_me: boolean;
  joined: string;
  progress: ProgressRow[];
  custom: { id: string; title: string | null }[];
};


/** A profile as get_profile() returns it, with the quest log rebuilt. Null when missing or private. */
export async function loadProfile(supabase: SupabaseClient, handle: string): Promise<PublicProfile | null> {
  const clean = handle.toLowerCase();
  if (!HANDLE_RE.test(clean)) return null;
  const { data, error } = await supabase.rpc("get_profile", { p_handle: clean });
  if (error || !data) return null;
  const p = data as ProfileJson;
  // Private side quest titles come back null; they still count, under a neutral name.
  const custom: CustomQuest[] = p.custom.map((c) => ({ id: c.id, title: c.title ?? "Side quest" }));
  return {
    handle: p.handle,
    displayName: p.display_name,
    isPublic: p.is_public,
    shareMemories: p.share_memories,
    isMe: p.is_me,
    joined: p.joined,
    skills: hydrateSkills(rowsToProgress(p.progress), custom),
  };
}

export type LeaderRow = {
  handle: string;
  display_name: string | null;
  quests: number;
  xp: number;
  dad_quests: number;
  dad_xp: number;
  dad_share: number | null;
  village: number;
  top_teacher: string | null;
};

export type Totals = { players: number; quests: number; xp: number; dad_quests: number; dad_xp: number; dad_share: number };

export const SORTS = ["xp", "quests", "dad", "village"] as const;
export type Sort = (typeof SORTS)[number];
export const isSort = (s: unknown): s is Sort => typeof s === "string" && (SORTS as readonly string[]).includes(s);

export type SkillStat = { skillId: string; total: number; byTeacher: { teacher: Teacher; n: number }[]; dadPct: number };

/** skill_stats() rows grouped per quest, biggest teacher first. */
export function groupSkillStats(rows: { skill_id: string; teacher: string; n: number }[]): Map<string, SkillStat> {
  const out = new Map<string, SkillStat>();
  for (const r of rows) {
    if (!isTeacher(r.teacher)) continue;
    const s = out.get(r.skill_id) ?? { skillId: r.skill_id, total: 0, byTeacher: [], dadPct: 0 };
    s.total += r.n;
    s.byTeacher.push({ teacher: r.teacher, n: r.n });
    out.set(r.skill_id, s);
  }
  for (const s of out.values()) {
    s.byTeacher.sort((a, b) => b.n - a.n);
    const dad = s.byTeacher.find((b) => b.teacher === "dad")?.n ?? 0;
    s.dadPct = s.total ? Math.round((dad / s.total) * 100) : 0;
  }
  return out;
}
