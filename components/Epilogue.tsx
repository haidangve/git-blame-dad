"use client";

import { HERO_OLDER, HERO_PALETTE, NEW_KID, NEW_KID_PALETTE } from "@/data/sprites";
import { BLAME } from "@/data/story";
import { PixelSprite } from "./PixelSprite";
import { NightSky } from "./TitleScreen";

type Props = { onStartOwn: () => void; onBack: () => void; onReplay: () => void };

export function Epilogue({ onStartOwn, onBack, onReplay }: Props) {
  return (
    <main className="fade-in fixed inset-0 z-40 flex flex-col items-center justify-center overflow-y-auto px-4 pb-6 pt-10 text-center">
      <NightSky count={50} />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="flex items-end gap-5" role="img" aria-label="The hero, grown up, standing beside a small new kid">
          <PixelSprite rows={HERO_OLDER} palette={HERO_PALETTE} scale={6} />
          <PixelSprite rows={NEW_KID} palette={NEW_KID_PALETTE} scale={6} />
        </div>
        <div aria-hidden className="-mt-6 h-4 w-72 max-w-full bg-[#0a0d22]" />

        <p className="max-w-[34ch] font-pixel text-[13px] leading-[1.7] text-lantern sm:text-[16px]">{BLAME.epilogue}</p>

        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" className="btn" onClick={onStartOwn}>
            ▶ {BLAME.startOwn}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onReplay}>
            REPLAY
          </button>
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            MY LOG
          </button>
        </div>
      </div>

      <p className="relative z-10 mt-10 max-w-[60ch] text-[18px] text-parchment/60">{BLAME.helpLine}</p>
    </main>
  );
}
