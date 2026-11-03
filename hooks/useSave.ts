"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SKILLS, type Skill } from "@/data/skills";
import { SIDE } from "@/data/story";
import {
  customSkillId,
  guestEntriesToImport,
  hydrateSkills,
  isCustomId,
  rowsToProgress,
  type CustomQuest,
  type Progress,
  type ProgressMap,
  type ProgressRow,
} from "@/lib/progress";
import { levelFor } from "@/lib/ranks";
import { getBrowserSupabase } from "@/lib/supabase/client";

export type { Progress };

/**
 * Where a log lives.
 * - demo: Kai's story, seeded, in this browser. The hackathon build.
 * - guest: a fresh log in this browser, for anyone not signed in.
 * - cloud: the signed-in player's log in Supabase, photos in Storage.
 */
export type SaveMode = { kind: "demo" } | { kind: "guest" } | { kind: "cloud"; userId: string };

type SaveFile = { v: 1; progress: ProgressMap; custom?: CustomQuest[] };
type State = { progress: ProgressMap; custom: CustomQuest[] };

// Bump DEMO_KEY when the seeded answers change, so a demo browser picks up the new seed.
const DEMO_KEY = "questlog.save.v2";
export const GUEST_KEY = "gbd.guest.v1";
const PHOTO_BUCKET = "photos";
const SIGNED_URL_TTL = 60 * 60 * 24;

function seedProgress(): ProgressMap {
  const out: ProgressMap = {};
  for (const s of SKILLS) {
    if (s.done) {
      out[s.id] = { done: true, teacher: s.teacher, teacherName: s.teacherName, memory: s.memory, year: s.year, photo: s.photo };
    }
  }
  return out;
}

const initialState = (kind: SaveMode["kind"]): State => ({ progress: kind === "demo" ? seedProgress() : {}, custom: [] });

export function readLocal(key: string): State | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SaveFile;
    if (parsed?.v !== 1 || !parsed.progress || typeof parsed.progress !== "object") return null;
    return { progress: parsed.progress, custom: Array.isArray(parsed.custom) ? parsed.custom : [] };
  } catch {
    return null;
  }
}

function writeLocal(key: string, state: State): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify({ v: 1, progress: state.progress, custom: state.custom } satisfies SaveFile));
    return true;
  } catch {
    // Private mode, storage blocked, or full (too many photos): the game keeps
    // working, it just can't remember this change.
    return false;
  }
}

const photoPathFor = (userId: string, skillId: string) => `${userId}/${skillId.replace(":", "_")}.jpg`;
const isDataUrl = (s?: string): s is string => !!s && s.startsWith("data:");

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}

type Supa = NonNullable<ReturnType<typeof getBrowserSupabase>>;

// One import per user per page load, shared by every caller. React runs effects
// twice in development, and two concurrent imports would each create the
// guest's side quests, duplicating them.
const imports = new Map<string, Promise<number>>();

/** Moves a guest log into the signed-in account, once. Resolves to how many quests it added. */
function importGuestOnce(supabase: Supa, userId: string): Promise<number> {
  let p = imports.get(userId);
  if (!p) {
    // Claim the guest save before the first await, so nothing else can read it too.
    const guest = readLocal(GUEST_KEY);
    try {
      window.localStorage.removeItem(GUEST_KEY);
    } catch {
      // ignore
    }
    p = guest ? importGuest(supabase, userId, guest) : Promise.resolve(0);
    imports.set(userId, p);
  }
  return p;
}

/** Cloud answers win every conflict. On a failed read the guest save is put back for next time. */
async function importGuest(supabase: Supa, userId: string, guest: State): Promise<number> {
  const [rowsRes, customRes] = await Promise.all([
    supabase.from("progress").select("skill_id, teacher"),
    supabase.from("custom_quests").select("id"),
  ]);
  if (rowsRes.error || customRes.error) {
    writeLocal(GUEST_KEY, guest);
    return 0;
  }
  const rows = rowsRes.data as ProgressRow[];
  let customCount = customRes.data.length;
  const idMap = new Map<string, string>();
  for (const c of guest.custom) {
    if (customCount >= SIDE.max) break;
    const { data, error } = await supabase.from("custom_quests").insert({ title: c.title }).select("id").single();
    if (!error && data) {
      idMap.set(customSkillId(c.id), customSkillId(data.id));
      customCount++;
    }
  }
  let count = 0;
  for (const [guestId, p] of guestEntriesToImport(guest.progress, rowsToProgress(rows))) {
    const skillId = isCustomId(guestId) ? idMap.get(guestId) : guestId;
    if (!skillId) continue;
    let photo_path: string | null = null;
    if (isDataUrl(p.photo)) {
      photo_path = photoPathFor(userId, skillId);
      const up = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(photo_path, await dataUrlToBlob(p.photo), { upsert: true, contentType: "image/jpeg" });
      if (up.error) photo_path = null;
    }
    const row = {
      skill_id: skillId,
      teacher: p.teacher!,
      teacher_name: p.teacherName ?? null,
      memory: p.memory ?? null,
      year: p.year ?? null,
      photo_path,
    };
    const { error } = await supabase.from("progress").upsert(row);
    if (!error) count++;
  }
  return count;
}

export function useSave(mode: SaveMode) {
  const kind = mode.kind;
  const userId = mode.kind === "cloud" ? mode.userId : null;
  const localKey = kind === "demo" ? DEMO_KEY : kind === "guest" ? GUEST_KEY : null;

  // Server and first client render both use the initial state, so hydration
  // matches; the real save is swapped in after mount.
  const [state, setState] = useState<State>(() => initialState(kind));
  const [loaded, setLoaded] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [imported, setImported] = useState(0);
  const photoPaths = useRef<Record<string, string>>({});

  // ── Load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    if (localKey) {
      setState(readLocal(localKey) ?? initialState(kind));
      setLoaded(true);
      return;
    }
    const supabase = getBrowserSupabase();
    if (!supabase || !userId) return;

    (async () => {
      const count = await importGuestOnce(supabase, userId);
      const [rowsRes, customRes] = await Promise.all([
        supabase.from("progress").select("skill_id, teacher, teacher_name, memory, year, photo_path"),
        supabase.from("custom_quests").select("id, title").order("created_at"),
      ]);
      if (rowsRes.error || customRes.error) {
        if (!cancelled) {
          setSaveFailed(true);
          setLoaded(true);
        }
        return;
      }
      const rows = rowsRes.data as ProgressRow[];
      const custom = customRes.data as CustomQuest[];

      const paths = rows.map((r) => r.photo_path).filter((p): p is string => !!p);
      const urls: Record<string, string> = {};
      if (paths.length) {
        const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, SIGNED_URL_TTL);
        for (const d of data ?? []) if (d.path && d.signedUrl) urls[d.path] = d.signedUrl;
      }
      if (cancelled) return;
      photoPaths.current = Object.fromEntries(rows.filter((r) => r.photo_path).map((r) => [r.skill_id, r.photo_path!]));
      setState({ progress: rowsToProgress(rows, urls), custom });
      setImported(count);
      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [kind, localKey, userId]);

  // Local saves write the whole file on every change.
  useEffect(() => {
    if (loaded && localKey) setSaveFailed(!writeLocal(localKey, state));
  }, [state, loaded, localKey]);

  // ── Cloud writes: optimistic, with a banner if one fails ──────────────
  const cloud = useCallback(
    (op: (supabase: Supa, uid: string) => PromiseLike<{ error: unknown } | void>) => {
      const supabase = getBrowserSupabase();
      if (!supabase || !userId) return;
      void (async () => {
        try {
          const res = await op(supabase, userId);
          setSaveFailed(!!(res && res.error));
        } catch {
          setSaveFailed(true);
        }
      })();
    },
    [userId],
  );

  const complete = useCallback(
    (id: string, p: Omit<Progress, "done">) => {
      setState((prev) => ({ ...prev, progress: { ...prev.progress, [id]: { ...p, done: true } } }));
      cloud(async (supabase, uid) => {
        let photo_path: string | null = photoPaths.current[id] ?? null;
        if (isDataUrl(p.photo)) {
          photo_path = photoPathFor(uid, id);
          const up = await supabase.storage
            .from(PHOTO_BUCKET)
            .upload(photo_path, await dataUrlToBlob(p.photo), { upsert: true, contentType: "image/jpeg" });
          if (up.error) return up;
        } else if (!p.photo && photo_path) {
          await supabase.storage.from(PHOTO_BUCKET).remove([photo_path]);
          photo_path = null;
        }
        if (photo_path) photoPaths.current[id] = photo_path;
        else delete photoPaths.current[id];
        return supabase.from("progress").upsert({
          skill_id: id,
          teacher: p.teacher,
          teacher_name: p.teacherName ?? null,
          memory: p.memory ?? null,
          year: p.year ?? null,
          photo_path,
        });
      });
    },
    [cloud],
  );

  const uncomplete = useCallback(
    (id: string) => {
      setState((prev) => {
        const progress = { ...prev.progress };
        delete progress[id];
        return { ...prev, progress };
      });
      cloud(async (supabase) => {
        const path = photoPaths.current[id];
        if (path) {
          await supabase.storage.from(PHOTO_BUCKET).remove([path]);
          delete photoPaths.current[id];
        }
        return supabase.from("progress").delete().eq("skill_id", id);
      });
    },
    [cloud],
  );

  /** Adds a side quest. Resolves to its skill id, or null if the log is full or the write failed. */
  const addCustom = useCallback(
    async (title: string): Promise<string | null> => {
      const clean = title.trim().slice(0, 40);
      if (!clean || state.custom.length >= SIDE.max) return null;
      let quest: CustomQuest;
      const supabase = getBrowserSupabase();
      if (userId && supabase) {
        const res = await supabase.from("custom_quests").insert({ title: clean }).select("id, title").single();
        if (res.error || !res.data) {
          setSaveFailed(true);
          return null;
        }
        quest = res.data as CustomQuest;
      } else {
        quest = { id: crypto.randomUUID(), title: clean };
      }
      setState((prev) => ({ ...prev, custom: [...prev.custom, quest] }));
      return customSkillId(quest.id);
    },
    [state.custom.length, userId],
  );

  const removeCustom = useCallback(
    (skillId: string) => {
      const questId = skillId.slice("custom:".length);
      setState((prev) => {
        const progress = { ...prev.progress };
        delete progress[skillId];
        return { progress, custom: prev.custom.filter((c) => c.id !== questId) };
      });
      cloud(async (supabase) => {
        const path = photoPaths.current[skillId];
        if (path) {
          await supabase.storage.from(PHOTO_BUCKET).remove([path]);
          delete photoPaths.current[skillId];
        }
        // A database trigger removes the quest's progress row with it.
        return supabase.from("custom_quests").delete().eq("id", questId);
      });
    },
    [cloud],
  );

  const resetToSeed = useCallback(() => setState({ progress: seedProgress(), custom: [] }), []);

  const clearAll = useCallback(() => {
    setState({ progress: {}, custom: [] });
    cloud(async (supabase, uid) => {
      const paths = Object.values(photoPaths.current);
      if (paths.length) await supabase.storage.from(PHOTO_BUCKET).remove(paths);
      photoPaths.current = {};
      const a = await supabase.from("custom_quests").delete().eq("user_id", uid);
      if (a.error) return a;
      return supabase.from("progress").delete().eq("user_id", uid);
    });
  }, [cloud]);

  const skills: Skill[] = useMemo(() => hydrateSkills(state.progress, state.custom), [state]);
  const totalXP = skills.reduce((sum, s) => sum + (s.done ? s.xp : 0), 0);
  const level = levelFor(totalXP);
  const doneCount = skills.filter((s) => s.done).length;

  return {
    mode: kind,
    skills,
    loaded,
    saveFailed,
    imported,
    totalXP,
    level,
    doneCount,
    customCount: state.custom.length,
    complete,
    uncomplete,
    addCustom,
    removeCustom,
    resetToSeed,
    clearAll,
  };
}

export type Save = ReturnType<typeof useSave>;
