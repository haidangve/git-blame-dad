import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, SectionTitle, Stat, StackedBar, TeacherLabel, TeacherLegend } from "@/components/Stats";
import { SKILLS } from "@/data/skills";
import { REGIONS, TEACHER_ORDER } from "@/data/story";
import { isTeacher } from "@/lib/progress";
import { groupSkillStats, isSort, type LeaderRow, type Sort, type Totals } from "@/lib/profiles";
import { levelFor } from "@/lib/ranks";
import { onlineEnabled } from "@/lib/supabase/env";
import { getServerSupabase, getViewer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Hall of Blame · git blame --dad",
  description: "Who taught everyone else: the leaderboard and Dad's share across every public quest log.",
};

const SORT_LABEL: Record<Sort, string> = { xp: "XP", quests: "Quests", dad: "Dad's share", village: "Village" };

type Props = { searchParams: Promise<{ sort?: string }> };

export default async function HallPage({ searchParams }: Props) {
  const { sort: rawSort } = await searchParams;
  const sort: Sort = isSort(rawSort) ? rawSort : "xp";
  const viewer = await getViewer();
  const supabase = await getServerSupabase();

  if (!supabase) {
    return (
      <PageShell viewer={null} online={false}>
        <p className="panel p-4 text-[21px]">The Hall of Blame needs online features switched on for this copy of the game.</p>
      </PageShell>
    );
  }

  const [board, totalsRes, statsRes] = await Promise.all([
    supabase.rpc("leaderboard", { p_sort: sort, p_limit: 100 }),
    supabase.rpc("global_totals"),
    supabase.rpc("skill_stats"),
  ]);
  const rows = (board.data ?? []) as LeaderRow[];
  const totals = ((totalsRes.data ?? [])[0] ?? null) as Totals | null;
  const stats = groupSkillStats(statsRes.data ?? []);
  const failed = !!(board.error || totalsRes.error || statsRes.error);

  // Quests with enough answers to say something, most and least Dad-taught.
  const ranked = SKILLS.map((s) => ({ skill: s, stat: stats.get(s.id) }))
    .filter((x): x is { skill: (typeof SKILLS)[number]; stat: NonNullable<typeof x.stat> } => !!x.stat && x.stat.total >= 3)
    .sort((a, b) => b.stat.dadPct - a.stat.dadPct || b.stat.total - a.stat.total);
  const mostDad = ranked[0];
  const leastDad = ranked.length > 1 ? ranked[ranked.length - 1] : undefined;
  const legend = TEACHER_ORDER.filter((t) => [...stats.values()].some((s) => s.byTeacher.some((b) => b.teacher === t)));

  return (
    <PageShell viewer={viewer} online={onlineEnabled}>
      <header className="flex flex-col gap-2">
        <h1 className="font-pixel text-[18px] leading-[1.4] text-lantern sm:text-[28px]" style={{ textShadow: "4px 4px 0 #000" }}>
          HALL OF BLAME
        </h1>
        <p className="max-w-[60ch] text-[22px] text-parchment/85">
          Everyone who made their log public, and who actually taught them. Your own row is one{" "}
          {viewer ? (
            <Link className="text-lantern underline" href="/">
              quest log
            </Link>
          ) : (
            <Link className="text-lantern underline" href="/login?next=/hall">
              sign-in
            </Link>
          )}{" "}
          away.
        </p>
      </header>

      {failed && (
        <p role="alert" className="panel px-3 py-2 text-[20px] text-[#9b2a1c]">
          Some of the Hall couldn&apos;t load. Refresh to try again.
        </p>
      )}

      {totals && (
        <section aria-label="Everyone" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Players" value={totals.players.toLocaleString("en-US")} />
          <Stat label="Quests logged" value={totals.quests.toLocaleString("en-US")} />
          <Stat label="Taught by Dad" value={totals.dad_quests.toLocaleString("en-US")} />
          <Stat label="Dad's share, everyone" value={`${totals.dad_share}%`} accent />
        </section>
      )}

      {(mostDad || leastDad) && (
        <section className="grid gap-3 sm:grid-cols-2">
          {mostDad && (
            <div className="panel-dark p-3 text-[20px]">
              <p className="font-pixel text-[10px] text-lantern">MOST LIKELY FROM DAD</p>
              <p className="mt-1 text-[24px]">{mostDad.skill.title}</p>
              <p className="text-parchment/70">
                {mostDad.stat.dadPct}% of {mostDad.stat.total} players
              </p>
            </div>
          )}
          {leastDad && (
            <div className="panel-dark p-3 text-[20px]">
              <p className="font-pixel text-[10px] text-lantern">LEAST LIKELY FROM DAD</p>
              <p className="mt-1 text-[24px]">{leastDad.skill.title}</p>
              <p className="text-parchment/70">
                {leastDad.stat.dadPct}% of {leastDad.stat.total} players
              </p>
            </div>
          )}
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle>LEADERBOARD</SectionTitle>
          <nav aria-label="Sort leaderboard" className="flex flex-wrap gap-2">
            {(Object.keys(SORT_LABEL) as Sort[]).map((s) => (
              <Link
                key={s}
                href={s === "xp" ? "/hall" : `/hall?sort=${s}`}
                aria-current={s === sort ? "true" : undefined}
                className={`btn px-3 py-2 text-[10px] ${s === sort ? "" : "btn-ghost"}`}
              >
                {SORT_LABEL[s]}
              </Link>
            ))}
          </nav>
        </div>

        {rows.length === 0 ? (
          <p className="panel p-4 text-[21px]">Nobody here yet. Clear a quest while signed in and you&apos;re first.</p>
        ) : (
          <div className="panel overflow-x-auto p-0">
            <table className="w-full min-w-[640px] border-collapse text-left text-[20px]">
              <thead>
                <tr className="border-b-4 border-ink font-pixel text-[9px] sm:text-[10px]">
                  <th scope="col" className="px-3 py-2">#</th>
                  <th scope="col" className="px-3 py-2">PLAYER</th>
                  <th scope="col" className="px-3 py-2 text-right">LV</th>
                  <th scope="col" className="px-3 py-2 text-right">QUESTS</th>
                  <th scope="col" className="px-3 py-2 text-right">XP</th>
                  <th scope="col" className="px-3 py-2 text-right">DAD</th>
                  <th scope="col" className="px-3 py-2 text-right" title="Different kinds of teacher who showed up">
                    VILLAGE
                  </th>
                  <th scope="col" className="px-3 py-2">MOSTLY</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const me = viewer?.handle === r.handle;
                  return (
                    <tr key={r.handle} className={`border-b-2 border-ink/15 ${me ? "bg-[#f6d65a]/40" : ""}`}>
                      <td className="px-3 py-1.5 font-pixel text-[10px]">{i + 1}</td>
                      <td className="px-3 py-1.5">
                        <Link href={`/u/${r.handle}`} className="font-bold underline-offset-2 hover:underline">
                          @{r.handle}
                        </Link>
                        {r.display_name && <span className="ml-2 text-ink/55">{r.display_name}</span>}
                        {me && <span className="ml-2 text-[#8a5410]">(you)</span>}
                      </td>
                      <td className="px-3 py-1.5 text-right">{levelFor(r.xp)}</td>
                      <td className="px-3 py-1.5 text-right">{r.quests}</td>
                      <td className="px-3 py-1.5 text-right">{r.xp.toLocaleString("en-US")}</td>
                      <td className="px-3 py-1.5 text-right font-bold text-[#9b2a1c]">{r.dad_share ?? 0}%</td>
                      <td className="px-3 py-1.5 text-right">{r.village}</td>
                      <td className="px-3 py-1.5">
                        {r.top_teacher && isTeacher(r.top_teacher) ? <TeacherLabel teacher={r.top_teacher} /> : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {stats.size > 0 && (
        <section className="flex flex-col gap-3">
          <SectionTitle>WHO TAUGHT THE WORLD</SectionTitle>
          <p className="text-[20px] text-parchment/75">Every public answer, quest by quest. The red number is Dad&apos;s share.</p>
          <TeacherLegend teachers={legend} />
          {REGIONS.filter((r) => r.id !== "side").map((region) => {
            const quests = SKILLS.filter((s) => s.region === region.id && stats.has(s.id));
            if (!quests.length) return null;
            return (
              <div key={region.id} className="panel p-3">
                <h3 className="font-pixel text-[11px]">{region.name}</h3>
                <ul className="mt-2 flex flex-col gap-2">
                  {quests.map((q) => {
                    const st = stats.get(q.id)!;
                    return (
                      <li key={q.id} className="grid items-center gap-x-3 sm:grid-cols-[14rem_1fr_7rem]">
                        <span className="text-[20px]">{q.title}</span>
                        <StackedBar parts={st.byTeacher} label={q.title} />
                        <span className="text-[19px] sm:text-right">
                          <b className="text-[#9b2a1c]">{st.dadPct}%</b> <span className="text-ink/55">of {st.total}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </section>
      )}
    </PageShell>
  );
}
