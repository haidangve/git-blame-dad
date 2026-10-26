"use client";

import { useEffect, useState } from "react";
import { HERO, HERO_IDLE, HERO_PALETTE } from "@/data/sprites";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { PixelSprite } from "./PixelSprite";

/** The kid with the backpack, idling: two-frame loop plus a bob. Still under reduced motion. */
export function Hero({ scale = 4, className }: { scale?: number; className?: string }) {
  const reduced = useReducedMotion();
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setFrame((f) => (f + 1) % 2), 600);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <div className={`bob ${className ?? ""}`}>
      <PixelSprite rows={frame === 0 ? HERO : HERO_IDLE} palette={HERO_PALETTE} scale={scale} label="The hero: a kid with a backpack" />
    </div>
  );
}
