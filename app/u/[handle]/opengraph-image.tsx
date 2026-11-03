import { ImageResponse } from "next/og";
import { TEACHERS } from "@/data/story";
import { shortlog, tally } from "@/lib/blame";
import { loadProfile } from "@/lib/profiles";
import { levelFor, rankFor } from "@/lib/ranks";
import { getServerSupabase } from "@/lib/supabase/server";

export const alt = "A git blame --dad quest log: Dad's share and who showed up";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The card a profile link unfurls into: Dad's share, big, and the bars for everyone else. */
export default async function Image({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const supabase = await getServerSupabase();
  const profile = supabase ? await loadProfile(supabase, handle) : null;
  const skills = profile?.skills ?? [];
  const t = tally(skills);
  const rows = shortlog(skills).filter((r) => r.count > 0).slice(0, 5);
  const max = Math.max(1, ...rows.map((r) => r.count));
  const level = levelFor(t.totalXP);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0f1330",
          color: "#e8d9b0",
          padding: 56,
          fontFamily: "monospace",
          border: "16px solid #000",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, color: "#f2a93b" }}>$ git blame --dad</div>
        <div style={{ display: "flex", fontSize: 64, marginTop: 12 }}>{profile ? `@${profile.handle}` : "git blame --dad"}</div>
        <div style={{ display: "flex", fontSize: 30, color: "#b9b0d9", marginTop: 4 }}>
          {profile ? `LV ${level} ${rankFor(level)} · ${t.quests} quests` : "Skills I was supposed to learn from my dad."}
        </div>
        <div style={{ display: "flex", flex: 1, marginTop: 40, gap: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 420 }}>
            <div style={{ display: "flex", fontSize: 28, color: "#b9b0d9" }}>DAD&apos;S SHARE</div>
            <div style={{ display: "flex", fontSize: 168, color: "#ff6a55", lineHeight: 1 }}>{t.dadSharePct}%</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, gap: 14 }}>
            {rows.map((r) => (
              <div key={r.teacher} style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28 }}>
                <div style={{ display: "flex", width: 170, color: TEACHERS[r.teacher].color }}>{TEACHERS[r.teacher].short}</div>
                <div style={{ display: "flex", flex: 1, height: 28, background: "#1a1f4a", border: "4px solid #000" }}>
                  <div style={{ display: "flex", width: `${(r.count / max) * 100}%`, background: TEACHERS[r.teacher].color }} />
                </div>
                <div style={{ display: "flex", width: 40, justifyContent: "flex-end" }}>{r.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
