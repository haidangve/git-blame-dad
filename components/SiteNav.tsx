import Link from "next/link";
import { NAV } from "@/data/story";
import type { Viewer } from "@/lib/viewer";

type Props = { viewer: Viewer | null; online: boolean; className?: string };

/** The thin bar of links shared by the quest log and every other page. */
export function SiteNav({ viewer, online, className }: Props) {
  return (
    <nav aria-label="Site" className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[18px] sm:gap-x-4 sm:text-[20px] ${className ?? ""}`}>
      <Link href="/" className="font-pixel text-[10px] text-lantern hover:underline sm:text-[11px]">
        {NAV.home}
      </Link>
      <span className="ml-auto" />
      {online && (
        <Link href="/hall" className="text-parchment/85 underline-offset-4 hover:text-parchment hover:underline">
          {NAV.hall}
        </Link>
      )}
      {online &&
        (viewer ? (
          <Link href={viewer.handle ? `/u/${viewer.handle}` : "/me"} className="text-parchment/85 hover:text-parchment hover:underline">
            {viewer.handle ? `@${viewer.handle}` : NAV.me}
          </Link>
        ) : (
          <Link href="/login" className="text-lantern hover:underline">
            {NAV.login}
          </Link>
        ))}
    </nav>
  );
}
