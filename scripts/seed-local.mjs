// Fills a LOCAL Supabase with a handful of public players, so the Hall of
// Blame, profiles and compare have something to show during development.
//
//   npx supabase start
//   npm run seed:local
//
// Safe to re-run: existing demo players are deleted and recreated. Refuses to
// run against anything but a local stack.

import { createClient } from "@supabase/supabase-js";
import { execSync } from "node:child_process";

const env = Object.fromEntries(
  execSync("npx supabase status -o env", { encoding: "utf8" })
    .split(/\r?\n/)
    .map((l) => l.match(/^([A-Z_]+)="(.*)"$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);
if (!env.API_URL || !/^http:\/\/(127\.0\.0\.1|localhost)[:/]/.test(env.API_URL)) {
  console.error(`Refusing to run: API URL ${env.API_URL ?? "(none)"} is not local.`);
  process.exit(1);
}
const admin = createClient(env.API_URL, env.SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// handle → [display name, share words?, { quest: teacher }]
const PLAYERS = {
  night_owl: ["Minh", true, { shave: "youtube", tie: "youtube", tire: "uncle", jump: "reddit", taxes: "youtube", salary: "reddit", cry: "friend", help: "uncle", bike: "self", swim: "teacher" }],
  dad_was_there: ["Priya", true, { shave: "dad", tie: "dad", tire: "dad", drive: "dad", bike: "dad", fish: "dad", taxes: "mom", askout: "friend", cry: "mom" }],
  self_patched: ["Jordan", false, { shave: "self", drill: "self", tap: "youtube", credit: "self", budget: "self", anger: "teacher", notokay: "teacher", laces: "mom", throw: "self" }],
  mom_did_both: ["Sam", false, { shave: "mom", iron: "mom", nails: "mom", bank: "mom", apologise: "mom", bike: "mom", swim: "aunt", tire: "youtube", breakup: "friend", loveyou: "mom" }],
  village_kid: ["Alex", true, { shave: "uncle", tie: "aunt", tire: "uncle", steak: "friend", bbq: "aunt", taxes: "reddit", handshake: "teacher", toast: "friend", tent: "uncle", fish: "dad" }],
};

const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
for (const u of list.users) if (u.email?.endsWith("@seed.local")) await admin.auth.admin.deleteUser(u.id);

let year = 2006;
for (const [handle, [name, share, log]] of Object.entries(PLAYERS)) {
  const { data, error } = await admin.auth.admin.createUser({
    email: `${handle}@seed.local`,
    email_confirm: true,
    user_metadata: { full_name: name },
  });
  if (error) throw error;
  const id = data.user.id;
  await admin.from("profiles").update({ handle, display_name: name, share_memories: share }).eq("id", id);
  const rows = Object.entries(log).map(([skill_id, teacher], i) => ({
    user_id: id,
    skill_id,
    teacher,
    year: year + i,
    memory: i % 3 === 0 ? "Demo memory from the local seed." : null,
  }));
  const ins = await admin.from("progress").insert(rows);
  if (ins.error) throw ins.error;
  year++;
  console.log(`seeded @${handle} (${rows.length} quests)`);
}
