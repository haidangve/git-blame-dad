import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyLink } from "@/components/CopyLink";
import { ProfileBody } from "@/components/ProfileView";
import { PageShell } from "@/components/Stats";
import { tally } from "@/lib/blame";
import { loadProfile } from "@/lib/profiles";
import { onlineEnabled } from "@/lib/supabase/env";
import { getServerSupabase, getViewer } from "@/lib/supabase/server";

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const supabase = await getServerSupabase();
  const profile = supabase ? await loadProfile(supabase, handle) : null;
  if (!profile) return { title: "Not found · git blame --dad" };
  const t = tally(profile.skills);
  return {
    title: `@${profile.handle} · git blame --dad`,
    description: `${t.quests} quests cleared. Dad's share: ${t.dadSharePct}%.`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { handle } = await params;
  const [viewer, supabase] = await Promise.all([getViewer(), getServerSupabase()]);
  if (!supabase) notFound();
  const profile = await loadProfile(supabase, handle);
  if (!profile) notFound();

  return (
    <PageShell viewer={viewer} online={onlineEnabled}>
      <header className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h1 className="font-pixel text-[16px] leading-[1.4] text-lantern sm:text-[24px]" style={{ textShadow: "4px 4px 0 #000" }}>
            @{profile.handle}
          </h1>
          {profile.displayName && <p className="text-[22px] text-parchment/80">{profile.displayName}</p>}
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <CopyLink path={`/u/${profile.handle}`} />
          {viewer?.handle && !profile.isMe && (
            <Link href={`/compare?a=${viewer.handle}&b=${profile.handle}`} className="btn px-3 py-2 text-[10px]">
              COMPARE WITH ME
            </Link>
          )}
          {profile.isMe && (
            <Link href="/me" className="btn btn-ghost px-3 py-2 text-[10px]">
              EDIT PROFILE
            </Link>
          )}
        </div>
      </header>

      {profile.isMe && !profile.isPublic && (
        <p className="panel px-3 py-2 text-[20px]">Your profile is private. Only you can see this page.</p>
      )}

      <ProfileBody skills={profile.skills} />
    </PageShell>
  );
}
