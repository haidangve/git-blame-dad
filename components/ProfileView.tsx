import type { Skill } from "@/data/skills";
import { REGIONS, TEACHERS } from "@/data/story";
import { achievements } from "@/lib/achievements";
import { regionBreakdown, shortlog, tally, villageSize } from "@/lib/blame";
import { levelFor, rankFor } from "@/lib/ranks";
import { BadgeGrid } from "./Achievements";
import { SectionTitle, Stat, TeacherBars, TeacherLabel } from "./Stats";

/** The numbers block for one log. Shared by the profile page and each side of a comparison. */
export function LogSummary({ skills, compact = false }: { skills: Skill[]; compact?: boolean }) {
  const t = tally(skills);
  const level = levelFor(t.totalXP);
  const rows = shortlog(skills).filter((r) => r.count > 0 || r.teacher === "dad");
  return (
    <div className="flex flex-col gap-3">
      <div className={`grid gap-3 ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
        <Stat label={`Level · ${rankFor(level)}`} value={level} />
        <Stat label="Quests" value={t.quests} />
        <Stat label="Village" value={villageSize(skills)} />
        <Stat label="Dad's share" value={`${t.dadSharePct}%`} accent />
      </div>
      <div className="panel p-3">
        <p className="font-pixel text-[10px]">WHO SHOWED UP</p>
        <div className="mt-2">
          <TeacherBars rows={rows} />
        </div>
      </div>
    </div>
  );
}

export function RegionTable({ skills }: { skills: Skill[] }) {
  const regions = regionBreakdown(skills);
  return (
    <div className="panel overflow-x-auto p-0">
      <table className="w-full min-w-[420px] border-collapse text-left text-[20px]">
        <thead>
          <tr className="border-b-4 border-ink font-pixel text-[9px] sm:text-[10px]">
            <th scope="col" className="px-3 py-2">REGION</th>
            <th scope="col" className="px-3 py-2 text-right">CLEARED</th>
            <th scope="col" className="px-3 py-2 text-right">DAD</th>
            <th scope="col" className="px-3 py-2">MOSTLY</th>
          </tr>
        </thead>
        <tbody>
          {regions.map((r) => (
            <tr key={r.region} className="border-b-2 border-ink/15">
              <td className="px-3 py-1.5">{REGIONS.find((x) => x.id === r.region)?.name}</td>
              <td className="px-3 py-1.5 text-right">
                {r.done}/{r.total}
              </td>
              <td className="px-3 py-1.5 text-right font-bold text-[#9b2a1c]">{r.done ? `${r.dadShare}%` : "—"}</td>
              <td className="px-3 py-1.5">{r.top ? <TeacherLabel teacher={r.top} /> : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function QuestList({ skills }: { skills: Skill[] }) {
  const done = skills.filter((s) => s.done).sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999) || a.title.localeCompare(b.title));
  if (!done.length) return <p className="panel p-3 text-[20px]">No quests cleared yet.</p>;
  return (
    <ol className="panel flex flex-col gap-2 p-3">
      {done.map((s) => (
        <li key={s.id} className="grid gap-x-3 border-b-2 border-ink/10 pb-2 last:border-0 last:pb-0 sm:grid-cols-[4rem_1fr_auto]">
          <span className="text-[19px] text-ink/55">{s.year ?? "—"}</span>
          <span className="text-[21px]">
            {s.title}
            {s.memory && <span className="block text-[19px] leading-tight text-ink/70">“{s.memory}”</span>}
          </span>
          <span className="text-[19px]">{s.teacher && <TeacherLabel teacher={s.teacher} name={s.teacherName ?? TEACHERS[s.teacher].short} />}</span>
        </li>
      ))}
    </ol>
  );
}

export function ProfileBody({ skills }: { skills: Skill[] }) {
  return (
    <>
      <LogSummary skills={skills} />
      <section className="flex flex-col gap-2">
        <SectionTitle>BY REGION</SectionTitle>
        <RegionTable skills={skills} />
      </section>
      <section className="flex flex-col gap-2">
        <SectionTitle>BADGES</SectionTitle>
        <div className="panel p-3">
          <BadgeGrid badges={achievements(skills)} />
        </div>
      </section>
      <section className="flex flex-col gap-2">
        <SectionTitle>git log --reverse</SectionTitle>
        <QuestList skills={skills} />
      </section>
    </>
  );
}
