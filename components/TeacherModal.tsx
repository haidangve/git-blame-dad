"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Skill, Teacher } from "@/data/skills";
import { MODAL, TEACHER_ORDER, TEACHERS } from "@/data/story";
import type { Progress } from "@/hooks/useSave";
import { sfx } from "@/hooks/useSound";
import { compressPhoto } from "@/lib/photo";
import { PixelSprite } from "./PixelSprite";

type Props = {
  skill: Skill;
  onSave: (p: Omit<Progress, "done">) => void;
  onCancel: () => void;
  onUncheck: () => void;
};

const INPUT = "w-full border-4 border-ink bg-parchment-hi px-2 py-1 text-[22px] text-ink placeholder:text-ink/45";

/** Asks who taught a quest. For an already-cleared quest it doubles as the editor (photo, memory, uncheck). */
export function TeacherModal({ skill, onSave, onCancel, onUncheck }: Props) {
  const editing = !!skill.done;
  const [teacher, setTeacher] = useState<Teacher | null>(skill.teacher ?? null);
  const [name, setName] = useState(skill.teacherName && skill.teacher && skill.teacherName !== TEACHERS[skill.teacher].label ? skill.teacherName : "");
  const [memory, setMemory] = useState(skill.memory ?? "");
  const [year, setYear] = useState(String(skill.year ?? new Date().getFullYear()));
  const [photo, setPhoto] = useState<string | undefined>(skill.photo);
  const [photoState, setPhotoState] = useState<"idle" | "loading" | "error">("idle");
  const firstRef = useRef<HTMLButtonElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const pickPhoto = async (file: File | undefined) => {
    if (!file) return;
    setPhotoState("loading");
    try {
      setPhoto(await compressPhoto(file));
      setPhotoState("idle");
    } catch {
      setPhotoState("error");
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!teacher) return;
    const y = Number.parseInt(year, 10);
    onSave({
      teacher,
      teacherName: name.trim() || TEACHERS[teacher].label,
      memory: memory.trim() || undefined,
      year: Number.isFinite(y) && y > 1900 && y < 2200 ? y : undefined,
      photo,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="tm-title"
        onSubmit={submit}
        className="panel modal-in max-h-[calc(100dvh-32px)] w-full max-w-2xl overflow-y-auto p-4 sm:p-5"
      >
        <p className="text-[20px] text-ink/70">
          {editing ? "QUEST LOG ENTRY" : "QUEST CLEARED"} · {skill.title}
        </p>
        <h2 id="tm-title" className="mt-1 font-pixel text-[14px] leading-[1.4] sm:text-[18px]">
          {MODAL.question}
        </h2>

        <div role="radiogroup" aria-label={MODAL.question} className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TEACHER_ORDER.map((id, i) => {
            const t = TEACHERS[id];
            const selected = teacher === id;
            return (
              <button
                key={id}
                ref={i === 0 ? firstRef : undefined}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setTeacher(id);
                  sfx.select();
                }}
                className="flex cursor-pointer flex-col items-center gap-2 border-4 px-1 py-2 text-[19px] leading-none"
                style={{
                  borderColor: selected ? "var(--ink)" : t.color,
                  background: selected ? t.color : "var(--parchment-hi)",
                  boxShadow: selected ? "inset -4px -4px 0 rgba(0,0,0,.25)" : "inset -4px -4px 0 var(--parchment-2)",
                }}
              >
                <PixelSprite rows={t.icon} palette={{ k: selected ? "#2b1d0e" : t.color, w: selected ? t.color : "#fff" }} scale={3} />
                <span className={selected ? "font-bold" : ""}>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="block text-[20px]">
            Name
            <input
              className={INPUT}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={teacher ? `${TEACHERS[teacher].label}, or their name` : MODAL.namePlaceholder}
              maxLength={40}
            />
          </label>
          <label className="block text-[20px]">
            {MODAL.yearLabel}
            <input
              className={`${INPUT} sm:w-28`}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              inputMode="numeric"
              maxLength={4}
            />
          </label>
        </div>
        <label className="mt-3 block text-[20px]">
          Memory
          <input
            className={INPUT}
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
            placeholder={MODAL.memoryPlaceholder}
            maxLength={120}
          />
        </label>

        <div className="mt-3 text-[20px]">
          <span>{MODAL.photoLabel}</span>
          <div className="mt-1 flex items-center gap-3">
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={`Your photo for ${skill.title}`} className="h-16 w-16 border-4 border-ink object-cover" />
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              id="tm-photo"
              onChange={(e) => {
                void pickPhoto(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button type="button" className="btn btn-ghost px-3 py-2 text-[10px]" onClick={() => fileRef.current?.click()}>
              {photoState === "loading" ? "LOADING…" : photo ? MODAL.photoChange : MODAL.photoAdd}
            </button>
            {photo && (
              <button type="button" className="text-[20px] underline" onClick={() => setPhoto(undefined)}>
                {MODAL.photoRemove}
              </button>
            )}
          </div>
          {photoState === "error" && <p className="mt-1 text-[#9b2a1c]">{MODAL.photoError}</p>}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
          {editing && (
            <button type="button" className="mr-auto text-[20px] underline" onClick={onUncheck}>
              {MODAL.uncheck}
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {MODAL.cancel}
          </button>
          <button type="submit" className="btn" disabled={!teacher || photoState === "loading"}>
            {MODAL.save}
          </button>
        </div>
      </form>
    </div>
  );
}
