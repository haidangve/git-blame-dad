"use client";

import { useEffect, useRef } from "react";

type Props = {
  rows: string[];
  palette: Record<string, string>;
  /** CSS pixels per sprite pixel. */
  scale?: number;
  label?: string;
  className?: string;
};

/** Draws a sprite from rows of palette keys onto a tiny canvas, scaled up crisp. */
export function PixelSprite({ rows, palette, scale = 4, label, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const color = palette[row[x]];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    });
  }, [rows, palette, w, h]);

  return (
    <canvas
      ref={ref}
      width={w}
      height={h}
      className={`pixelated ${className ?? ""}`}
      style={{ width: w * scale, height: h * scale }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
