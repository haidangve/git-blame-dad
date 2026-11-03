// End-to-end checks of the database rules against a running local Supabase:
// row-level security, the privacy rules in get_profile, the leaderboard, and
// the guards that stop the leaderboard being padded.
//
//   npx supabase start
//   npm run test:db
//
// Creates throwaway users through the admin API and deletes them at the end.
// Refuses to run against anything but a local stack.

import { createClient } from "@supabase/supabase-js";
import { execSync } from "node:child_process";

const env = Object.fromEntries(
  execSync("npx supabase status -o env", { encoding: "utf8" })
    .split(/\r?\n/)
    .map((l) => l.match(/^([A-Z_]+)="(.*)"$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);
const url = env.API_URL;
if (!url || !/^http:\/\/(127\.0\.0\.1|localhost)[:/]/.test(url)) {
  console.error(`Refusing to run: API URL ${url ?? "(none)"} is not local.`);
  process.exit(1);
}

const admin = createClient(url, env.SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const anon = createClient(url, env.ANON_KEY, { auth: { persistSession: false } });
const run = Date.now().toString(36);
const created = [];
let failures = 0;

function check(name, ok, detail = "") {
  console.log(`${ok ? "  ok  " : "  FAIL"} ${name}${!ok && detail ? `\n         ${detail}` : ""}`);
  if (!ok) failures++;
}

async function player(handle, profile = {}) {
  const email = `${handle}-${run}@example.test`;
  const password = `pw-${run}-${handle}`;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  created.push(data.user.id);
  const client = createClient(url, env.ANON_KEY, { auth: { persistSession: false } });
  const signIn = await client.auth.signInWithPassword({ email, password });
  if (signIn.error) throw signIn.error;
  const h = `${handle}_${run}`.slice(0, 20);
  const up = await client.from("profiles").update({ handle: h, ...profile }).eq("id", data.user.id);
  if (up.error) throw up.error;
  return { id: data.user.id, handle: h, client };
}

try {
  console.log("profiles");
  const ana = await player("ana", { share_memories: true });
  const ben = await player("ben");
  const cy = await player("cy", { is_public: false });

  const { data: auto } = await admin.from("profiles").select("display_name").eq("id", ana.id).single();
  check("signup trigger creates a profile with a display name", !!auto?.display_name);

  const taken = await ben.client.from("profiles").update({ handle: ana.handle }).eq("id", ben.id);
  check("handles are unique", taken.error?.code === "23505", JSON.stringify(taken.error));

  const bad = await ben.client.from("profiles").update({ handle: "Not OK!" }).eq("id", ben.id);
  check("handles must match the allowed pattern", !!bad.error);

  console.log("progress");
  const a1 = await ana.client.from("progress").insert([
    { skill_id: "shave", teacher: "youtube", teacher_name: "YouTube", memory: "Cut my chin", year: 2014 },
    { skill_id: "tire", teacher: "dad", teacher_name: "Dad", memory: "Parking lot", year: 2012 },
  ]);
  check("a player can save their own progress", !a1.error, JSON.stringify(a1.error));

  const b1 = await ben.client.from("progress").insert([
    { skill_id: "shave", teacher: "dad", teacher_name: "Pops", memory: "secret memory", year: 2010 },
    { skill_id: "tire", teacher: "uncle", year: 2015 },
    { skill_id: "taxes", teacher: "youtube", year: 2020 },
  ]);
  check("a second player can save theirs", !b1.error, JSON.stringify(b1.error));
  await cy.client.from("progress").insert({ skill_id: "shave", teacher: "mom" });

  const peek = await ben.client.from("progress").select("*").eq("user_id", ana.id);
  check("RLS: a player cannot read someone else's progress", !peek.error && peek.data.length === 0, JSON.stringify(peek));

  const forge = await ben.client.from("progress").insert({ user_id: ana.id, skill_id: "iron", teacher: "dad" });
  check("RLS: a player cannot write into someone else's log", !!forge.error);

  const fake = await ana.client.from("progress").insert({ skill_id: "fly_a_jet", teacher: "dad" });
  check("unknown quest ids are rejected", fake.error?.code === "23503", JSON.stringify(fake.error));

  const teacher = await ana.client.from("progress").insert({ skill_id: "iron", teacher: "grandpa" });
  check("unknown teachers are rejected", !!teacher.error);

  const anonRead = await anon.from("progress").select("*");
  check("anonymous visitors read no progress rows", !anonRead.error && anonRead.data.length === 0);

  const view = await anon.from("public_progress").select("*");
  check("the cross-player view is not directly readable", !!view.error);

  console.log("side quests");
  const side = await ana.client.from("custom_quests").insert({ title: "Hold a baby" }).select("id").single();
  check("a player can write a side quest", !side.error);
  const sideDone = await ana.client.from("progress").insert({ skill_id: `custom:${side.data.id}`, teacher: "aunt" });
  check("a side quest can be cleared", !sideDone.error, JSON.stringify(sideDone.error));
  const steal = await ben.client.from("progress").insert({ skill_id: `custom:${side.data.id}`, teacher: "dad" });
  check("nobody can clear someone else's side quest", !!steal.error);
  for (let i = 0; i < 11; i++) await ana.client.from("custom_quests").insert({ title: `Quest ${i}` });
  const thirteenth = await ana.client.from("custom_quests").insert({ title: "One too many" });
  check("side quests are capped at 12", !!thirteenth.error, JSON.stringify(thirteenth.error));
  await ana.client.from("custom_quests").delete().eq("title", "Quest 0");
  const extra = await ana.client.from("custom_quests").select("id").eq("title", "Quest 1").single();
  await ana.client.from("progress").insert({ skill_id: `custom:${extra.data.id}`, teacher: "self" });
  await ana.client.from("custom_quests").delete().eq("id", extra.data.id);
  const orphan = await ana.client.from("progress").select("skill_id").eq("skill_id", `custom:${extra.data.id}`);
  check("deleting a side quest removes its progress row", orphan.data?.length === 0);

  console.log("leaderboard");
  const lb = await anon.rpc("leaderboard", { p_sort: "xp", p_limit: 200 });
  const row = (h) => lb.data?.find((r) => r.handle === h);
  check("leaderboard is readable by anonymous visitors", !lb.error, JSON.stringify(lb.error));
  // ana: shave 50 (youtube) + tire 80 (dad) + side 40 (aunt) = 170 XP, dad 80 → 47%
  check("XP is scored from the skills table plus 40 per side quest", row(ana.handle)?.xp === 170, JSON.stringify(row(ana.handle)));
  check("Dad's share is XP-weighted", row(ana.handle)?.dad_share === 47, JSON.stringify(row(ana.handle)));
  check("village counts distinct teachers", row(ana.handle)?.village === 3);
  check("private profiles are left off the leaderboard", !row(cy.handle));
  const byDad = await anon.rpc("leaderboard", { p_sort: "dad", p_limit: 200 });
  const order = byDad.data.map((r) => r.handle).filter((h) => h === ana.handle || h === ben.handle);
  // ben: shave 50 dad, tire 80 uncle, taxes 90 youtube → 50/220 = 23%
  check("sorting by Dad's share puts the higher share first", order[0] === ana.handle, JSON.stringify(order));

  const totals = await anon.rpc("global_totals");
  check("global totals load", !totals.error && totals.data[0].players >= 2, JSON.stringify(totals));

  const stats = await anon.rpc("skill_stats");
  check("skill stats leave side quests out", !stats.error && !stats.data.some((r) => r.skill_id.startsWith("custom:")));

  console.log("profiles, privacy");
  const pubAna = await anon.rpc("get_profile", { p_handle: ana.handle });
  const shave = pubAna.data?.progress.find((p) => p.skill_id === "shave");
  check("an opted-in profile shares memories", shave?.memory === "Cut my chin", JSON.stringify(shave));
  check("an opted-in profile shares side quest titles", pubAna.data?.custom.some((c) => c.title === "Hold a baby"));

  const pubBen = await anon.rpc("get_profile", { p_handle: ben.handle });
  const benShave = pubBen.data?.progress.find((p) => p.skill_id === "shave");
  check("by default, memories stay private", benShave && benShave.memory === null, JSON.stringify(benShave));
  check("by default, teacher names stay private", benShave && benShave.teacher_name === null);
  check("the kind of teacher is still public", benShave?.teacher === "dad");

  const ownBen = await ben.client.rpc("get_profile", { p_handle: ben.handle });
  check("the owner sees their own memories", ownBen.data?.progress.find((p) => p.skill_id === "shave")?.memory === "secret memory");
  check("is_me is true only for the owner", ownBen.data?.is_me === true && pubBen.data?.is_me === false);

  const pubCy = await anon.rpc("get_profile", { p_handle: cy.handle });
  check("a private profile is hidden from others", pubCy.data === null, JSON.stringify(pubCy));
  const ownCy = await cy.client.rpc("get_profile", { p_handle: cy.handle });
  check("a private profile is visible to its owner", ownCy.data?.handle === cy.handle);

  console.log("photos");
  const png = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], { type: "image/jpeg" });
  const up = await ana.client.storage.from("photos").upload(`${ana.id}/shave.jpg`, png, { contentType: "image/jpeg" });
  check("a player can upload into their own folder", !up.error, JSON.stringify(up.error));
  const intrude = await ben.client.storage.from("photos").upload(`${ana.id}/evil.jpg`, png, { contentType: "image/jpeg" });
  check("nobody can upload into someone else's folder", !!intrude.error);
  const signed = await ben.client.storage.from("photos").createSignedUrl(`${ana.id}/shave.jpg`, 60);
  check("nobody can sign a URL for someone else's photo", !!signed.error);
  const own = await ana.client.storage.from("photos").createSignedUrl(`${ana.id}/shave.jpg`, 60);
  check("the owner can sign their own photo", !own.error);
  await ana.client.storage.from("photos").remove([`${ana.id}/shave.jpg`]);

  console.log("account deletion");
  const anonDelete = await anon.rpc("delete_me");
  check("anonymous visitors can't call delete_me", !!anonDelete.error);
  const del = await ben.client.rpc("delete_me");
  check("a player can delete their account", !del.error, JSON.stringify(del.error));
  const gone = await admin.from("progress").select("skill_id").eq("user_id", ben.id);
  check("deleting the account deletes the log", gone.data?.length === 0);
} catch (e) {
  console.error(e);
  failures++;
} finally {
  // ben already deleted himself; every other test user must go, or the run fails.
  for (const id of created) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error && error.status !== 404) {
      console.error(`  FAIL cleanup: could not delete test user ${id}: ${error.message}`);
      failures++;
    }
  }
}

console.log(failures ? `\n${failures} check(s) failed` : "\nall checks passed");
process.exit(failures ? 1 : 0);
