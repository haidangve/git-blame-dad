import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { PageShell } from "@/components/Stats";
import { safeNext } from "@/lib/safe-next";
import { oauthProviders, onlineEnabled } from "@/lib/supabase/env";
import { getViewer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Log in · git blame --dad" };

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;
  const viewer = await getViewer();
  if (viewer) redirect(safeNext(next));

  return (
    <PageShell viewer={null} online={onlineEnabled}>
      <section className="panel mx-auto mt-6 w-full max-w-lg p-5">
        <h1 className="font-pixel text-[14px] leading-[1.5] sm:text-[18px]">SAVE YOUR LOG</h1>
        <p className="mt-2 text-[21px] leading-tight text-ink/80">
          Keep your quest log across devices, get a profile, and see how your Dad&apos;s share stacks up against everyone
          else&apos;s. What you&apos;ve logged in this browser comes with you.
        </p>
        {onlineEnabled ? (
          <LoginForm next={safeNext(next)} providers={oauthProviders} linkError={error === "link"} />
        ) : (
          <p className="mt-4 text-[20px] text-[#9b2a1c]">
            Accounts aren&apos;t switched on for this copy of the game. Set NEXT_PUBLIC_SUPABASE_URL and
            NEXT_PUBLIC_SUPABASE_ANON_KEY to enable them.
          </p>
        )}
        <p className="mt-4 text-[18px] text-ink/70">
          <a className="underline" href="/privacy">
            What gets saved, and who can see it
          </a>
        </p>
      </section>
    </PageShell>
  );
}
