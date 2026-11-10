import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Game } from "@/components/Game";
import { STORY_PUBLIC } from "@/data/story";

export const metadata: Metadata = {
  title: "Kai's story · git blame --dad",
  description: "The original log: every skill Kai learned without a dad, and who taught it instead.",
};

/** Kai's seeded log, exactly as it was demoed. Saves to this browser only. */
export default function StoryPage() {
  if (!STORY_PUBLIC) notFound();
  return <Game mode={{ kind: "demo" }} />;
}
