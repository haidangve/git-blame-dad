import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileSettings } from "@/components/ProfileSettings";
import { PageShell } from "@/components/Stats";
import { onlineEnabled } from "@/lib/supabase/env";
import { getServerSupabase, getViewer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your profile · git blame --dad" };

type Props = { searchParams: Promise<{ welcome?: string }> };

export default async function MePage({ searchParams }: Props) {
  const { welcome } = await searchParams;
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/me");
  const supabase = (await getServerSupabase())!;
  const { data } = await supabase
    .from("profiles")
    .select("handle, display_name, is_public, share_memories")
    .eq("id", viewer.id)
    .single();

  return (
    <PageShell viewer={viewer} online={onlineEnabled}>
      <ProfileSettings
        welcome={!!welcome || !viewer.handle}
        email={viewer.email}
        initial={{
          handle: data?.handle ?? "",
          displayName: data?.display_name ?? "",
          isPublic: data?.is_public ?? true,
          shareMemories: data?.share_memories ?? false,
        }}
      />
    </PageShell>
  );
}
