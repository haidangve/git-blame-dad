import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LogSummary } from "@/components/ProfileView";
import { PageShell, SectionTitle, TeacherLabel } from "@/components/Stats";
import { compareLogs } from "@/lib/compare";
import { loadProfile } from "@/lib/profiles";
import { onlineEnabled } from "@/lib/supabase/env";
import { getServerSupabase, getViewer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Compare · git blame --dad" };

type Props = { searchParams: Promise<{ a?: string; b?: string }> };

export default async function ComparePage({ searchParams }: Props) {
  const { a, b } = await searchParams;
  const [viewer, supabase] = await Promise.all([getViewer(), getServerSupabase()]);
  if (!supabase || !a || !b) notFound();
  const [pa, pb] = await Promise.all([loadProfile(supabase, a), loadProfile(supabase, b)]);
  if (!pa || !pb) notFound();
  const cmp = compareLogs(pa.skills, pb.skills);
  const sameCount = cmp.shared.filter((s) => s.same).length;

  const verdict =
    cmp.dadDelta === 0
      ? "Same Dad's share, to the percent."
      : `@${cmp.dadDelta > 0 ? pa.handle : pb.handle}'s dad showed up ${Math.abs(cmp.dadDelta)} points more.`;

  return (
    <PageShell viewer={viewer} online={onlineEnabled}>
      <header>
        <h1 className="font-pixel text-[14px] leading-[1.6] text-lantern sm:text-[20px]" style={{ textShadow: "4px 4px 0 #000" }}>
          git diff{" "}
          <Link href={`/u/${pa.handle}`} className="hover:underline">
            @{pa.handle}
          </Link>{" "}
          <Link href={`/u/${pb.handle}`} className="hover:underline">
            @{pb.handle}
          </Link>
        </h1>
        <p className="mt-2 text-[22px] text-parchment/85">
          {verdict} {cmp.shared.length > 0 && `Same teacher on ${sameCount} of the ${cmp.shared.length} quests both cleared.`}
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {[pa, pb].map((p) => (
          <section key={p.handle} className="flex flex-col gap-2">
            <SectionTitle>@{p.handle}</SectionTitle>
            <LogSummary skills={p.skills} compact />
          </section>
        ))}
      </div>

      {cmp.shared.length > 0 && (
        <section className="flex flex-col gap-2">
          <SectionTitle>SAME QUEST, DIFFERENT TEACHER</SectionTitle>
          <div className="panel overflow-x-auto p-0">
            <table className="w-full min-w-[480px] border-collapse text-left text-[20px]">
              <thead>
                <tr className="border-b-4 border-ink font-pixel text-[9px] sm:text-[10px]">
                  <th scope="col" className="px-3 py-2">QUEST</th>
                  <th scope="col" className="px-3 py-2">@{pa.handle}</th>
                  <th scope="col" className="px-3 py-2">@{pb.handle}</th>
                </tr>
              </thead>
              <tbody>
                {[...cmp.shared]
                  .sort((x, y) => Number(x.same) - Number(y.same) || x.title.localeCompare(y.title))
                  .map((s) => (
                    <tr key={s.id} className={`border-b-2 border-ink/15 ${s.same ? "opacity-60" : ""}`}>
                      <td className="px-3 py-1.5">
                        {s.title}
                        {s.same && <span className="ml-2 text-[17px] text-ink/60">same</span>}
                      </td>
                      <td className="px-3 py-1.5">{s.a.teacher && <TeacherLabel teacher={s.a.teacher} />}</td>
                      <td className="px-3 py-1.5">{s.b.teacher && <TeacherLabel teacher={s.b.teacher} />}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {[
          { p: pa, only: cmp.onlyA },
          { p: pb, only: cmp.onlyB },
        ].map(({ p, only }) => (
          <section key={p.handle} className="flex flex-col gap-2">
            <SectionTitle>ONLY @{p.handle}</SectionTitle>
            {only.length ? (
              <ul className="panel flex flex-col gap-1 p-3 text-[20px]">
                {only.map((s) => (
                  <li key={s.id} className="flex justify-between gap-3">
                    <span>{s.title}</span>
                    {s.teacher && <TeacherLabel teacher={s.teacher} />}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="panel p-3 text-[20px]">Nothing the other hasn&apos;t cleared too.</p>
            )}
          </section>
        ))}
      </div>
    </PageShell>
  );
}
