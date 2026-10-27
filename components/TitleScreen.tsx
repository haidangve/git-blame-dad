"use client";

import { useEffect, useMemo } from "react";
import { MOON, MOON_PALETTE } from "@/data/sprites";
import { TITLE } from "@/data/story";
import { Hero } from "./Hero";
import { PixelSprite } from "./PixelSprite";

// Deterministic so server and client draw the same sky.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function NightSky({ count = 70 }: { count?: number }) {
  const stars = useMemo(() => {
    const rand = mulberry32(1989);
    return Array.from({ length: count }, () => ({
      x: rand() * 100,
      y: rand() * 70,
      big: rand() > 0.85,
      dur: 1.5 + rand() * 3,
      delay: rand() * 3,
    }));
  }, [count]);

  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #070a1f 0 28%, #0b0f2a 28% 48%, #0f1330 48% 64%, #181c48 64% 78%, #241f58 78% 100%)",
      }}
    >
      {stars.map((s, i) => (
        <span
          key={i}
          className="twinkle absolute"
          style={
            {
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: 4,
              height: 4,
              background: s.big ? "#fff6d8" : "#9fa8e0",
              boxShadow: s.big ? "4px 0 #fff6d8, -4px 0 #fff6d8, 0 4px #fff6d8, 0 -4px #fff6d8" : undefined,
              "--dur": `${s.dur}s`,
              "--delay": `${s.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function TitleScreen({ onStart }: { onStart: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStart]);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 pb-24 text-center">
      <NightSky />
      <div className="absolute right-[8%] top-[8%]">
        <PixelSprite rows={MOON} palette={MOON_PALETTE} scale={8} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <h1
          className="font-pixel text-[20px] leading-none text-lantern sm:text-[44px]"
          style={{ textShadow: "4px 4px 0 #000, -4px 0 0 #6b3d0a" }}
        >
          {TITLE.title}
        </h1>
        <p className="max-w-[28ch] text-[26px] text-parchment sm:text-[30px]">{TITLE.subtitle}</p>

        <Hero scale={6} className="mt-4" />

        <button type="button" onClick={onStart} className="btn blink mt-2 text-[14px]">
          ▶ {TITLE.start}
        </button>
        <p className="text-[18px] text-parchment/60">ENTER / SPACE</p>
      </div>

      {/* Ground the hero stands on. */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-20 border-t-4 border-[#262c66] bg-[#0a0d22]" />
    </main>
  );
}
