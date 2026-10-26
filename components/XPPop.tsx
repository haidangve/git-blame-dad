"use client";

export type Pop = { id: number; x: number; y: number; text: string; big?: boolean };

/** Floating "+50 XP" text. Rendered fixed at the card that was cleared; Game removes it after ~1s. */
export function XPPops({ pops }: { pops: Pop[] }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-0 z-[55]">
      {pops.map((p) => (
        <span
          key={p.id}
          className={`xp-pop absolute -translate-x-1/2 font-pixel ${p.big ? "text-[20px] sm:text-[26px]" : "text-[16px] sm:text-[20px]"}`}
          style={{
            left: p.x,
            top: p.y,
            color: p.big ? "#fff6d8" : "var(--lantern)",
            textShadow: "4px 4px 0 #000",
          }}
        >
          {p.text}
        </span>
      ))}
    </div>
  );
}
