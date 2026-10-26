"use client";

import { ICON_PALETTE } from "@/data/icons";
import { tutorialUrl, type Skill } from "@/data/skills";
import { QUEST_LOG, TEACHERS } from "@/data/story";
import { PixelSprite } from "./PixelSprite";

const CHECK = ["......k", ".....kk", "k...kk.", "kk.kk..", ".kkk...", "..k...."];
const INK = { k: "#2b1d0e" };

export function QuestCard({ skill, onToggle }: { skill: Skill; onToggle: (skill: Skill) => void }) {
  const t = skill.teacher ? TEACHERS[skill.teacher] : null;

  return (
    <article className={`panel flex gap-3 p-3 ${skill.done ? "" : "opacity-90"}`}>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center border-4 border-ink bg-parchment-2">
        <PixelSprite rows={skill.pixelIcon} palette={ICON_PALETTE} scale={4} />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-pixel text-[11px] leading-[1.5]">{skill.title}</h3>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 text-[20px]">
          <span className="text-[#8a5410]">+{skill.xp} XP</span>
          <a
            href={tutorialUrl(skill.tutorialQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-2 underline-offset-2 hover:text-[#7a2e1f]"
          >
            {QUEST_LOG.tutorial}
          </a>
        </div>
        {skill.done && t && (
          <div className="mt-1 flex items-center gap-2 text-[18px]">
            <PixelSprite rows={t.icon} palette={{ k: t.color, w: "#fff" }} scale={2} />
            <span style={{ color: t.color, textShadow: "1px 1px 0 #2b1d0e" }} className="font-bold">
              {skill.teacherName || t.label}
            </span>
            {skill.year && <span className="opacity-70">· {skill.year}</span>}
          </div>
        )}
      </div>

      <button
        type="button"
        role="checkbox"
        aria-checked={!!skill.done}
        aria-label={`${skill.title}: ${skill.done ? "learned" : "not learned yet"}`}
        onClick={() => onToggle(skill)}
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center self-center border-4 border-ink bg-parchment-hi hover:bg-white"
        style={{ background: skill.done ? "var(--lantern)" : undefined }}
      >
        {skill.done && <PixelSprite rows={CHECK} palette={INK} scale={3} />}
      </button>
    </article>
  );
}
