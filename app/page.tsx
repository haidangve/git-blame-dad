import { redirect } from "next/navigation";
import { Game } from "@/components/Game";
import { onlineEnabled } from "@/lib/supabase/env";
import { getViewer } from "@/lib/supabase/server";

export default async function Page() {
  const viewer = await getViewer();
  // A new account picks a handle before playing, so the Hall can link to them.
  if (viewer && !viewer.handle) redirect("/me?welcome=1");
  return (
    <Game
      key={viewer?.id ?? "guest"}
      mode={viewer ? { kind: "cloud", userId: viewer.id } : { kind: "guest" }}
      viewer={viewer}
      online={onlineEnabled}
    />
  );
}
