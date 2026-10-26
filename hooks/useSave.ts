"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SKILLS, type Skill, type Teacher } from "@/data/skills";

export type Progress = {
  done: boolean;
  teacher?: Teacher;
  teacherName?: string;
  memory?: string;
  year?: number;
};

type SaveFile = { v: 1; progress: Record<string, Progress> };

const KEY = "questlog.save.v1";

function seedProgress(): Record<string, Progress> {
  const out: Record<string, Progress> = {};
  for (const s of SKILLS) {
    if (s.done) {
      out[s.id] = { done: true, teacher: s.teacher, teacherName: s.teacherName, memory: s.memory, year: s.year };
    }
  }
  return out;
}

function readSave(): Record<string, Progress> | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SaveFile;
    return parsed?.v === 1 && parsed.progress && typeof parsed.progress === "object" ? parsed.progress : null;
  } catch {
    return null;
  }
}

function writeSave(progress: Record<string, Progress>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ v: 1, progress } satisfies SaveFile));
  } catch {
    // Private mode or storage blocked: the game still works, it just won't remember.
  }
}

export function useSave() {
  // Server and first client render both use the seed, so hydration matches;
  // the saved file is swapped in after mount.
  const [progress, setProgress] = useState<Record<string, Progress>>(seedProgress);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = readSave();
    if (saved) setProgress(saved);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) writeSave(progress);
  }, [progress, loaded]);

  const skills: Skill[] = useMemo(
    () =>
      SKILLS.map((s) => {
        const p = progress[s.id];
        return {
          ...s,
          done: !!p?.done,
          teacher: p?.teacher,
          teacherName: p?.teacherName,
          memory: p?.memory,
          year: p?.year,
        };
      }),
    [progress],
  );

  const totalXP = skills.reduce((sum, s) => sum + (s.done ? s.xp : 0), 0);
  const level = Math.floor(totalXP / 100) + 1;
  const doneCount = skills.filter((s) => s.done).length;

  const complete = useCallback((id: string, p: Omit<Progress, "done">) => {
    setProgress((prev) => ({ ...prev, [id]: { ...p, done: true } }));
  }, []);

  const uncomplete = useCallback((id: string) => {
    setProgress((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const resetToSeed = useCallback(() => setProgress(seedProgress()), []);
  const clearAll = useCallback(() => setProgress({}), []);

  return { skills, totalXP, level, doneCount, complete, uncomplete, resetToSeed, clearAll };
}

export type Save = ReturnType<typeof useSave>;
