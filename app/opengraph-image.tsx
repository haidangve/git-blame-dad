import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The link preview LinkedIn, Slack and iMessage show for any page on the site.
// Built once at deploy time from the same palette and sprite as app/icon.svg.

export const alt = "git blame --dad: a pixel-art quest log of skills I was supposed to learn from my dad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const C = {
  night: "#0f1330",
  night2: "#1a1f4a",
  night3: "#2b3270",
  lantern: "#f2a93b",
  lanternHi: "#ffd27a",
  parchment: "#e8d9b0",
  ink: "#2b1d0e",
};

// app/icon.svg, one entry per rect: [x, y, w, h, fill] on an 8x8 grid.
const SPRITE: [number, number, number, number, string][] = [
  [2, 1, 4, 2, "#3b2414"],
  [2, 3, 4, 2, "#e8b07a"],
  [3, 3, 1, 1, "#1b1410"],
  [5, 3, 1, 1, "#1b1410"],
  [1, 5, 6, 2, "#3f8f8a"],
  [6, 5, 1, 2, "#f2a93b"],
];

// Fixed star positions so every build renders the same image.
const STARS: [number, number, number][] = [
  [60, 50, 6], [190, 110, 4], [330, 40, 6], [520, 80, 4], [700, 36, 6], [880, 96, 4],
  [1040, 48, 6], [1140, 130, 4], [90, 560, 4], [260, 590, 6], [980, 580, 6], [1120, 540, 4],
];

const CELL = 34;

export default async function Image() {
  const [pixel, body] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/PressStart2P-Regular.ttf")),
    readFile(join(process.cwd(), "assets/fonts/VT323-Regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: C.night,
          position: "relative",
        }}
      >
        {STARS.map(([x, y, s], i) => (
          <div
            key={i}
            style={{ position: "absolute", left: x, top: y, width: s, height: s, background: i % 3 ? C.parchment : C.lanternHi }}
          />
        ))}

        {/* Parchment panel: 6px ink border plus a hard drop shadow, like .panel in globals.css. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 56,
            padding: "52px 64px",
            background: C.parchment,
            border: `6px solid ${C.ink}`,
            boxShadow: `12px 12px 0 0 ${C.night3}`,
          }}
        >
          <div style={{ display: "flex", position: "relative", width: CELL * 8, height: CELL * 8, background: C.night2 }}>
            {SPRITE.map(([x, y, w, h, fill], i) => (
              <div
                key={i}
                style={{ position: "absolute", left: x * CELL, top: y * CELL, width: w * CELL, height: h * CELL, background: fill }}
              />
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", maxWidth: 600 }}>
            <div style={{ fontFamily: "Pixel", fontSize: 50, color: C.ink, lineHeight: 1.3 }}>git blame</div>
            <div style={{ fontFamily: "Pixel", fontSize: 50, color: C.lantern, lineHeight: 1.3, textShadow: `4px 4px 0 ${C.ink}` }}>
              --dad
            </div>
            <div style={{ fontFamily: "Body", fontSize: 44, color: C.ink, marginTop: 28, lineHeight: 1.1 }}>
              Skills I was supposed to learn from my dad.
            </div>
            <div style={{ fontFamily: "Body", fontSize: 32, color: C.night3, marginTop: 20 }}>A pixel-art quest log</div>
            <div style={{ fontFamily: "Body", fontSize: 32, color: C.night3 }}>git-blame-dad.vercel.app</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pixel", data: pixel, style: "normal", weight: 400 },
        { name: "Body", data: body, style: "normal", weight: 400 },
      ],
    },
  );
}
