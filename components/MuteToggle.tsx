"use client";

import { setMuted, useMuted } from "@/hooks/useSound";
import { PixelSprite } from "./PixelSprite";

const SPEAKER_ON = ["...k....", "..kk.k..", "kkkk..k.", "kkkk.k.k", "kkkk.k.k", "kkkk..k.", "..kk.k..", "...k...."];
const SPEAKER_OFF = ["...k....", "..kk....", "kkkkk.k.", "kkkk.k.k", "kkkk..k.", "kkkkk.k.", "..kk....", "...k...."];

export function MuteToggle() {
  const muted = useMuted();
  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      aria-pressed={muted}
      aria-label={muted ? "Sound off. Turn sound on" : "Sound on. Turn sound off"}
      className="btn btn-ghost fixed bottom-3 right-3 z-[45] flex items-center gap-2 px-2 py-2 text-[10px] sm:bottom-4 sm:right-4 sm:px-3"
    >
      <PixelSprite rows={muted ? SPEAKER_OFF : SPEAKER_ON} palette={{ k: "#e8d9b0" }} scale={2} />
      {/* Icon only on phones, where the button sits over the content. */}
      <span className="hidden sm:inline">{muted ? "OFF" : "ON"}</span>
    </button>
  );
}
