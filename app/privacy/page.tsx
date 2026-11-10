import type { Metadata } from "next";
import { PageShell } from "@/components/Stats";
import { onlineEnabled } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Privacy · git blame --dad" };

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "PLAYING AS A GUEST",
    body: ["Without an account, your log and photos stay in this browser. Nothing is sent to a server."],
  },
  {
    title: "WHAT AN ACCOUNT STORES",
    body: [
      "Your email address, so you can log in.",
      "If you log in with Google or GitHub, your name from that account, used as your display name. You can change it.",
      "The quests you check off, who taught you, the years, your memories and your photos.",
    ],
  },
  {
    title: "WHO CAN SEE WHAT",
    body: [
      "Numbers (quests, XP, Dad's share, which kind of teacher) are public unless you make your profile private.",
      "Words (teacher names, memories, side quest titles) are only yours unless you turn on Share my words.",
      "Photos are only yours, always.",
      "Your email address is never shown to other players.",
    ],
  },
  {
    title: "WHERE IT LIVES",
    body: [
      "Accounts and saves are stored with Supabase in Canada. The site runs on Vercel.",
      "There are no ads and no analytics in this game.",
    ],
  },
  {
    title: "DELETING IT",
    body: ["You can delete your account and everything in it from your profile page, at any time."],
  },
];

export default function PrivacyPage() {
  return (
    <PageShell viewer={null} online={onlineEnabled}>
      <section className="panel mx-auto mt-6 flex w-full max-w-lg flex-col gap-4 p-5">
        <h1 className="font-pixel text-[14px] leading-[1.5] sm:text-[18px]">PRIVACY</h1>
        {SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-1">
            <h2 className="font-pixel text-[11px] leading-[1.6]">{section.title}</h2>
            {section.body.map((line) => (
              <p key={line} className="text-[21px] leading-tight text-ink/80">
                {line}
              </p>
            ))}
          </div>
        ))}
        <p className="text-[21px] leading-tight text-ink/80">
          Questions?{" "}
          <a className="underline" href="https://github.com/haidangve/git-blame-dad/issues">
            Open an issue on GitHub
          </a>
          .
        </p>
      </section>
    </PageShell>
  );
}
