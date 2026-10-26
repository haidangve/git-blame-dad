"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Skill } from "@/data/skills";
import { QUEST_LOG } from "@/data/story";
import type { Progress } from "@/hooks/useSave";
import { useSave } from "@/hooks/useSave";
import { sfx } from "@/hooks/useSound";
import { BlameCarousel } from "./BlameCarousel";
import { MuteToggle } from "./MuteToggle";
import { PhotoViewer } from "./PhotoViewer";
import { QuestLog } from "./QuestLog";
import { TeacherModal } from "./TeacherModal";
import { TitleScreen } from "./TitleScreen";
import { XPPops, type Pop } from "./XPPop";

type Screen = "title" | "log" | "blame";

export function Game() {
  const save = useSave();
  const [screen, setScreen] = useState<Screen>("title");
  const [pending, setPending] = useState<{ skill: Skill; x: number; y: number } | null>(null);
  const [pops, setPops] = useState<Pop[]>([]);
  const [viewing, setViewing] = useState<Skill | null>(null);
  const popId = useRef(0);

  const start = useCallback(() => setScreen("log"), []);
  const toLog = useCallback(() => setScreen("log"), []);
  const startOwn = useCallback(() => {
    save.clearAll();
    setScreen("log");
  }, [save]);

  // Hidden demo key: "B" jumps straight to git blame, ignoring the unlock threshold.
  useEffect(() => {
    if (screen !== "log" || pending || viewing) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.key === "b" || e.key === "B") setScreen("blame");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, pending, viewing]);
  const closeModal = useCallback(() => setPending(null), []);
  const closeViewer = useCallback(() => setViewing(null), []);

  const addPop = (pop: Omit<Pop, "id">, delay = 0) => {
    const id = ++popId.current;
    window.setTimeout(() => {
      setPops((p) => [...p, { ...pop, id }]);
      window.setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 1050);
    }, delay);
  };

  const toggle = (skill: Skill, rect: DOMRect) => {
    sfx.select();
    setPending({ skill, x: rect.left + rect.width / 2, y: rect.top + rect.height / 3 });
  };

  const onSave = (p: Omit<Progress, "done">) => {
    if (!pending) return;
    const { skill, x, y } = pending;
    if (skill.done) {
      // Editing an already-cleared quest: no XP, just save.
      save.complete(skill.id, p);
      setPending(null);
      sfx.select();
      return;
    }
    const nextLevel = Math.floor((save.totalXP + skill.xp) / 100) + 1;
    save.complete(skill.id, p);
    setPending(null);
    addPop({ x, y, text: `+${skill.xp} XP` });
    if (nextLevel > save.level) {
      addPop({ x, y: y - 72, text: `LEVEL ${nextLevel}!`, big: true }, 350);
      sfx.levelUp();
    } else {
      sfx.save();
    }
  };

  const onUncheck = () => {
    if (!pending) return;
    save.uncomplete(pending.skill.id);
    setPending(null);
    sfx.select();
  };

  const need = Math.max(0, QUEST_LOG.blameThreshold - save.doneCount);
  const footer = (
    <div className="flex flex-col items-center gap-3 pb-16">
      <button type="button" className="btn text-[12px] sm:text-[14px]" disabled={need > 0} onClick={() => setScreen("blame")}>
        ▶ {QUEST_LOG.blameButton}
      </button>
      {need > 0 && <p className="text-[20px] text-parchment/70">{QUEST_LOG.blameLocked(need)}</p>}
    </div>
  );

  return (
    <>
      {screen === "title" && <TitleScreen onStart={start} />}
      {screen === "log" && <QuestLog save={save} onToggle={toggle} onViewPhoto={setViewing} footer={footer} />}
      {screen === "blame" && <BlameCarousel skills={save.skills} onExit={toLog} onStartOwn={startOwn} />}
      {pending && <TeacherModal skill={pending.skill} onSave={onSave} onCancel={closeModal} onUncheck={onUncheck} />}
      {viewing && <PhotoViewer skill={viewing} onClose={closeViewer} />}
      <XPPops pops={pops} />
      <MuteToggle />
    </>
  );
}
