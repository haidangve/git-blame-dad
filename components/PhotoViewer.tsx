"use client";

import { useEffect, useRef } from "react";
import type { Skill } from "@/data/skills";
import { MODAL, TEACHERS } from "@/data/story";

export function PhotoViewer({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const t = skill.teacher ? TEACHERS[skill.teacher] : null;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!skill.photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <figure role="dialog" aria-modal="true" aria-label={skill.title} className="panel modal-in max-w-xl p-3">
        <img src={skill.photo} alt={skill.memory ?? skill.title} className="block max-h-[60dvh] w-full border-4 border-ink object-contain" />
        <figcaption className="mt-3 text-[22px]">
          <span className="font-pixel text-[11px]">{skill.title}</span>
          {t && (
            <span className="ml-2" style={{ color: t.color }}>
              · {skill.teacherName || t.label}
              {skill.year ? `, ${skill.year}` : ""}
            </span>
          )}
          {skill.memory && <p className="mt-1">“{skill.memory}”</p>}
        </figcaption>
        <div className="mt-3 flex justify-end">
          <button ref={closeRef} type="button" className="btn" onClick={onClose}>
            {MODAL.close}
          </button>
        </div>
      </figure>
    </div>
  );
}
