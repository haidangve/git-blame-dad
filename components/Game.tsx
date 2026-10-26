"use client";

import { useCallback, useState } from "react";
import type { Skill } from "@/data/skills";
import { useSave } from "@/hooks/useSave";
import { QuestLog } from "./QuestLog";
import { TitleScreen } from "./TitleScreen";

type Screen = "title" | "log";

export function Game() {
  const save = useSave();
  const [screen, setScreen] = useState<Screen>("title");

  const start = useCallback(() => setScreen("log"), []);

  const toggle = (skill: Skill) => {
    if (skill.done) save.uncomplete(skill.id);
    else save.complete(skill.id, { teacher: "self", teacherName: "Trial & Error", year: new Date().getFullYear() });
  };

  if (screen === "title") return <TitleScreen onStart={start} />;
  return <QuestLog save={save} onToggle={toggle} />;
}
