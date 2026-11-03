import type { Teacher } from "@/data/skills";
import { TEACHERS } from "@/data/story";
import type { Viewer } from "@/lib/viewer";
import { PixelSprite } from "./PixelSprite";
import { SiteNav } from "./SiteNav";

/** Frame for every page that isn't the game itself. */
export function PageShell({ viewer, online, children }: { viewer: Viewer | null; online: boolean; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh" style={{ background: "linear-gradient(to bottom, #070a1f 0, #0f1330 320px)" }}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-4 pb-20">
        <SiteNav viewer={viewer} online={online} />
        {children}
      </div>
    </div>
  );
}

export function TeacherLabel({ teacher, name, scale = 2 }: { teacher: Teacher; name?: string; scale?: number }) {
  const t = TEACHERS[teacher];
  return (
    <span className="inline-flex items-center gap-1.5">
      <PixelSprite rows={t.icon} palette={{ k: t.color, w: "#fff" }} scale={scale} />
      <span className="font-bold" style={{ color: t.color, textShadow: "1px 1px 0 #2b1d0e" }}>
        {name || t.short}
      </span>
    </span>
  );
}

/** One bar per teacher, the git-shortlog look from the tally. */
export function TeacherBars({ rows }: { rows: { teacher: Teacher; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="flex flex-col gap-1">
      {rows.map((r) => {
        const t = TEACHERS[r.teacher];
        return (
          <div key={r.teacher} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3 text-[20px]">
            <span className="font-bold" style={{ color: t.color, textShadow: "1px 1px 0 #2b1d0e" }}>
              {t.short}
            </span>
            <div className="h-5 border-4 border-ink bg-parchment-hi">
              <div className="h-full" style={{ width: `${(r.count / max) * 100}%`, background: t.color }} />
            </div>
            <span className="text-right">{r.count}</span>
          </div>
        );
      })}
    </div>
  );
}

/** A single horizontal bar split by teacher. Used for "who taught the world this quest". */
export function StackedBar({ parts, label }: { parts: { teacher: Teacher; n: number }[]; label: string }) {
  const total = parts.reduce((n, p) => n + p.n, 0) || 1;
  return (
    <div
      className="flex h-5 w-full overflow-hidden border-4 border-ink bg-parchment-hi"
      role="img"
      aria-label={`${label}: ${parts.map((p) => `${TEACHERS[p.teacher].label} ${Math.round((p.n / total) * 100)}%`).join(", ")}`}
    >
      {parts.map((p) => (
        <span key={p.teacher} style={{ width: `${(p.n / total) * 100}%`, background: TEACHERS[p.teacher].color }} />
      ))}
    </div>
  );
}

export function Stat({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="panel px-3 py-2">
      <p className="text-[18px] text-ink/60">{label}</p>
      <p className={`font-pixel text-[16px] leading-[1.5] sm:text-[20px] ${accent ? "text-[#9b2a1c]" : ""}`}>{value}</p>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-pixel text-[12px] leading-[1.6] text-lantern sm:text-[14px]">{children}</h2>;
}

/** The legend for teacher colours, for any chart that only shows colour. */
export function TeacherLegend({ teachers }: { teachers: Teacher[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[18px]">
      {teachers.map((t) => (
        <span key={t} className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 border-2 border-black" style={{ background: TEACHERS[t].color }} />
          <span className="text-parchment/85">{TEACHERS[t].short}</span>
        </span>
      ))}
    </div>
  );
}
