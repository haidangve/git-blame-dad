"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Skill } from "@/data/skills";
import { BLAME, QUEST_LOG, SIDE } from "@/data/story";
import type { Progress, SaveMode } from "@/hooks/useSave";
import { useSave } from "@/hooks/useSave";
import { sfx } from "@/hooks/useSound";
import { achievements, newlyUnlocked, type Achievement } from "@/lib/achievements";
import { levelFor } from "@/lib/ranks";
import type { Viewer } from "@/lib/viewer";
import { AchievementsPanel, AchievementToasts } from "./Achievements";
import { BlameCarousel } from "./BlameCarousel";
import { MuteToggle } from "./MuteToggle";
import { PhotoViewer } from "./PhotoViewer";
import { QuestLog } from "./QuestLog";
import { SideQuestModal } from "./SideQuestModal";
import { TeacherModal } from "./TeacherModal";
import { TitleScreen } from "./TitleScreen";
import { XPPops, type Pop } from "./XPPop";

type Screen = "title" | "log" | "blame";

type Props = {
  mode: SaveMode;
  viewer?: Viewer | null;
  online?: boolean;
};

export function Game({ mode, viewer = null, online = false }: Props) {
  const save = useSave(mode);
  const demo = mode.kind === "demo";
  const [screen, setScreen] = useState<Screen>("title");
  const [pending, setPending] = useState<{ skill: Skill; x: number; y: number } | null>(null);
  const [pops, setPops] = useState<Pop[]>([]);
  const [viewing, setViewing] = useState<Skill | null>(null);
  const [badgesOpen, setBadgesOpen] = useState(false);
  const [writingSide, setWritingSide] = useState(false);
  const [toasts, setToasts] = useState<Achievement[]>([]);
  const popId = useRef(0);

  const badges = useMemo(() => achievements(save.skills), [save.skills]);
  // Badge toasts fire on changes the player makes, never on the initial load.
  const prevBadges = useRef<Achievement[] | null>(null);
  useEffect(() => {
    if (!save.loaded) {
      prevBadges.current = null;
      return;
    }
    const before = prevBadges.current;
    prevBadges.current = badges;
    if (!before) return;
    const fresh = newlyUnlocked(before, badges);
    if (!fresh.length) return;
    setToasts((t) => [...t, ...fresh]);
    window.setTimeout(() => sfx.badge(), 500);
    window.setTimeout(() => setToasts((t) => t.filter((x) => !fresh.includes(x))), 4200);
  }, [badges, save.loaded]);

  const start = useCallback(() => setScreen("log"), []);
  const toLog = useCallback(() => setScreen("log"), []);
  const startOwn = useCallback(() => {
    if (demo) {
      window.location.href = "/";
      return;
    }
    save.clearAll();
    setScreen("log");
  }, [demo, save]);

  const modalOpen = !!pending || !!viewing || badgesOpen || writingSide;

  // Hidden demo key: "B" jumps straight to git blame, ignoring the unlock threshold.
  useEffect(() => {
    if (screen !== "log" || modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.key === "b" || e.key === "B") setScreen("blame");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, modalOpen]);
  const closeModal = useCallback(() => setPending(null), []);
  const closeViewer = useCallback(() => setViewing(null), []);
  const closeBadges = useCallback(() => setBadgesOpen(false), []);
  const closeSide = useCallback(() => setWritingSide(false), []);

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
    const nextLevel = levelFor(save.totalXP + skill.xp);
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

  const onDeleteSide = () => {
    if (!pending) return;
    save.removeCustom(pending.skill.id);
    setPending(null);
    sfx.select();
  };

  const onCreateSide = async (title: string) => {
    const id = await save.addCustom(title);
    setWritingSide(false);
    if (!id) return;
    sfx.select();
    // Straight into "who taught you?" so a new side quest is written and cleared in one go.
    setPending({
      skill: { id, region: "side", title: title.trim(), xp: SIDE.xp, tutorialQuery: title, pixelIcon: [], custom: true },
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
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

  const authorName = demo ? BLAME.authorName : viewer?.displayName || viewer?.handle || "you";

  return (
    <>
      {screen === "title" && (
        <TitleScreen onStart={start} demo={demo} viewer={viewer} online={online} returning={save.doneCount > 0} />
      )}
      {screen === "log" && (
        <QuestLog
          save={save}
          viewer={viewer}
          online={online}
          badges={badges}
          onToggle={toggle}
          onViewPhoto={setViewing}
          onOpenBadges={() => setBadgesOpen(true)}
          onWriteSide={() => setWritingSide(true)}
          footer={footer}
        />
      )}
      {screen === "blame" && (
        <BlameCarousel
          skills={save.skills}
          authorName={authorName}
          demo={demo}
          viewer={viewer}
          online={online}
          onExit={toLog}
          onStartOwn={startOwn}
        />
      )}
      {pending && (
        <TeacherModal
          skill={pending.skill}
          onSave={onSave}
          onCancel={closeModal}
          onUncheck={onUncheck}
          onDelete={pending.skill.custom ? onDeleteSide : undefined}
        />
      )}
      {viewing && <PhotoViewer skill={viewing} onClose={closeViewer} />}
      {badgesOpen && <AchievementsPanel badges={badges} onClose={closeBadges} />}
      {writingSide && <SideQuestModal onCreate={onCreateSide} onCancel={closeSide} />}
      <AchievementToasts toasts={toasts} />
      <XPPops pops={pops} />
      <MuteToggle />
    </>
  );
}
