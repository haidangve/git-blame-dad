-- git blame --dad: accounts, cloud saves, and the Hall of Blame.
--
-- Privacy model: a profile's numbers (quests, XP, Dad's share, who showed
-- up) are public unless the player turns their profile private. The words,
-- teacher names and memories, only leave the account when the player opts in
-- with share_memories. Photos are never public. Nothing reads another
-- player's rows directly: every cross-player read goes through the security
-- definer functions at the bottom, which apply those rules in one place.

-- ── Profiles ─────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  handle text unique check (handle ~ '^[a-z0-9_]{3,20}$'),
  display_name text check (char_length(display_name) <= 40),
  is_public boolean not null default true,
  share_memories boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles: insert own" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles: update own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)), 40)
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ── The quest map ────────────────────────────────────────────────────────
-- Mirrors data/skills.ts; lib/skills-sql.test.ts fails if the two drift.
-- To add a quest: add it there, then add a migration that inserts it here.
create table public.skills (
  id text primary key,
  region text not null,
  xp int not null check (xp > 0)
);

alter table public.skills enable row level security;
create policy "skills: read all" on public.skills for select using (true);

insert into public.skills (id, region, xp) values
  ('shave', 'grooming', 50),
  ('tie', 'grooming', 50),
  ('iron', 'grooming', 40),
  ('nails', 'grooming', 20),
  ('cologne', 'grooming', 30),
  ('haircut', 'grooming', 40),
  ('tire', 'hands', 80),
  ('jump', 'hands', 70),
  ('drill', 'hands', 50),
  ('tap', 'hands', 60),
  ('steak', 'hands', 50),
  ('flowers', 'hands', 60),
  ('bbq', 'hands', 80),
  ('drive', 'hands', 100),
  ('oil', 'hands', 60),
  ('drain', 'hands', 40),
  ('bank', 'money', 40),
  ('taxes', 'money', 90),
  ('salary', 'money', 100),
  ('credit', 'money', 70),
  ('budget', 'money', 60),
  ('lease', 'money', 80),
  ('invest', 'money', 90),
  ('handshake', 'people', 30),
  ('askout', 'people', 80),
  ('apologise', 'people', 70),
  ('breakup', 'people', 90),
  ('interview', 'people', 90),
  ('toast', 'people', 70),
  ('friends', 'people', 100),
  ('notokay', 'inner', 120),
  ('cry', 'inner', 120),
  ('anger', 'inner', 100),
  ('help', 'inner', 120),
  ('loveyou', 'inner', 110),
  ('boundary', 'inner', 100),
  ('grudge', 'inner', 120),
  ('bike', 'backyard', 50),
  ('swim', 'backyard', 70),
  ('throw', 'backyard', 30),
  ('fish', 'backyard', 50),
  ('tent', 'backyard', 50),
  ('laces', 'backyard', 20);

-- ── Side quests ──────────────────────────────────────────────────────────
create table public.custom_quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 40),
  created_at timestamptz not null default now()
);

create index custom_quests_user on public.custom_quests (user_id);

alter table public.custom_quests enable row level security;
create policy "custom_quests: own" on public.custom_quests
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Twelve side quests each (SIDE.max in data/story.ts). Stops the Hall of
-- Blame being farmed with a hundred one-word quests.
create function public.custom_quests_cap() returns trigger language plpgsql as $$
begin
  if (select count(*) from public.custom_quests where user_id = new.user_id) >= 12 then
    raise exception 'side quest log is full' using errcode = 'check_violation';
  end if;
  return new;
end $$;

create trigger custom_quests_cap before insert on public.custom_quests
  for each row execute function public.custom_quests_cap();

-- ── Progress: one row per cleared quest ─────────────────────────────────
create table public.progress (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  skill_id text not null check (skill_id ~ '^(custom:[0-9a-f-]{36}|[a-z0-9_]{1,32})$'),
  teacher text not null check (teacher in ('youtube', 'reddit', 'uncle', 'aunt', 'friend', 'mom', 'teacher', 'self', 'dad')),
  teacher_name text check (char_length(teacher_name) <= 40),
  memory text check (char_length(memory) <= 120),
  year int check (year between 1900 and 2199),
  photo_path text,
  updated_at timestamptz not null default now(),
  primary key (user_id, skill_id)
);

alter table public.progress enable row level security;
create policy "progress: own" on public.progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create trigger progress_touch before update on public.progress
  for each row execute function public.touch_updated_at();

-- A row must point at a real quest: one on the map, or one of the player's
-- own side quests. Without this, made-up skill ids would pad the leaderboard.
create function public.progress_validate() returns trigger language plpgsql as $$
begin
  if new.skill_id like 'custom:%' then
    if not exists (
      select 1 from public.custom_quests
      where id = substr(new.skill_id, 8)::uuid and user_id = new.user_id
    ) then
      raise exception 'unknown side quest %', new.skill_id using errcode = 'foreign_key_violation';
    end if;
  elsif not exists (select 1 from public.skills where id = new.skill_id) then
    raise exception 'unknown quest %', new.skill_id using errcode = 'foreign_key_violation';
  end if;
  return new;
end $$;

create trigger progress_validate before insert or update on public.progress
  for each row execute function public.progress_validate();

-- security definer: this also fires inside account deletion, where the
-- deleting role (supabase_auth_admin, from the dashboard or admin API) has no
-- rights on public.progress.
create function public.custom_quests_cleanup() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from public.progress where user_id = old.user_id and skill_id = 'custom:' || old.id;
  return old;
end $$;

create trigger custom_quests_cleanup after delete on public.custom_quests
  for each row execute function public.custom_quests_cleanup();

-- ── Photos: private, one folder per player ──────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 1048576, array['image/jpeg'])
on conflict (id) do nothing;

create policy "photos: own folder" on storage.objects
  for all to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ── Cross-player reads ───────────────────────────────────────────────────
-- Side quests are worth a flat 40 XP (SIDE.xp in data/story.ts).

create view public.public_progress with (security_barrier) as
select pr.id as user_id, p.skill_id, p.teacher, coalesce(s.xp, 40) as xp, s.id is null as custom
from public.progress p
join public.profiles pr on pr.id = p.user_id and pr.is_public and pr.handle is not null
left join public.skills s on s.id = p.skill_id;

-- The view reads across players, so nobody queries it directly; the
-- functions below are the only way in.
revoke all on public.public_progress from public, anon, authenticated;

create function public.leaderboard(p_sort text default 'xp', p_limit int default 100)
returns table (
  handle text, display_name text, quests int, xp int,
  dad_quests int, dad_xp int, dad_share int, village int, top_teacher text
)
language sql stable security definer set search_path = public as $$
  with agg as (
    select user_id,
      count(*)::int as quests,
      sum(xp)::int as xp,
      (count(*) filter (where teacher = 'dad'))::int as dad_quests,
      coalesce(sum(xp) filter (where teacher = 'dad'), 0)::int as dad_xp,
      count(distinct teacher)::int as village
    from public_progress group by user_id
  ),
  top as (
    select distinct on (user_id) user_id, teacher
    from public_progress where teacher <> 'dad'
    group by user_id, teacher
    order by user_id, count(*) desc, teacher
  )
  select pr.handle, pr.display_name, a.quests, a.xp, a.dad_quests, a.dad_xp,
    round(100.0 * a.dad_xp / nullif(a.xp, 0))::int, a.village, t.teacher
  from agg a
  join profiles pr on pr.id = a.user_id
  left join top t on t.user_id = a.user_id
  order by
    case when p_sort = 'dad' then a.dad_xp::numeric / nullif(a.xp, 0) end desc nulls last,
    case when p_sort = 'village' then a.village end desc,
    case when p_sort = 'quests' then a.quests end desc,
    a.xp desc, pr.handle
  limit least(greatest(p_limit, 1), 200);
$$;

create function public.global_totals()
returns table (players int, quests int, xp int, dad_quests int, dad_xp int, dad_share int)
language sql stable security definer set search_path = public as $$
  select count(distinct user_id)::int, count(*)::int, coalesce(sum(xp), 0)::int,
    (count(*) filter (where teacher = 'dad'))::int,
    coalesce(sum(xp) filter (where teacher = 'dad'), 0)::int,
    coalesce(round(100.0 * sum(xp) filter (where teacher = 'dad') / nullif(sum(xp), 0)), 0)::int
  from public_progress;
$$;

-- Who taught each map quest, across every public player. Side quests are
-- left out: no two players share one, and their titles aren't public.
create function public.skill_stats()
returns table (skill_id text, teacher text, n int)
language sql stable security definer set search_path = public as $$
  select skill_id, teacher, count(*)::int
  from public_progress where not custom
  group by skill_id, teacher;
$$;

-- One profile: a public one for anyone, your own always. Teacher names,
-- memories and side quest titles only travel when the owner opted in, or the
-- owner is asking.
create function public.get_profile(p_handle text)
returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'handle', pr.handle,
    'display_name', pr.display_name,
    'is_public', pr.is_public,
    'share_memories', pr.share_memories,
    -- auth.uid() is null for anonymous visitors, and null = id is null, not false.
    'is_me', coalesce(pr.id = auth.uid(), false),
    'joined', pr.created_at,
    'progress', coalesce((
      select json_agg(json_build_object(
        'skill_id', p.skill_id,
        'teacher', p.teacher,
        'year', p.year,
        'teacher_name', case when pr.share_memories or pr.id = auth.uid() then p.teacher_name end,
        'memory', case when pr.share_memories or pr.id = auth.uid() then p.memory end
      ))
      from progress p where p.user_id = pr.id
    ), '[]'::json),
    'custom', coalesce((
      select json_agg(json_build_object(
        'id', c.id,
        'title', case when pr.share_memories or pr.id = auth.uid() then c.title end
      ) order by c.created_at)
      from custom_quests c where c.user_id = pr.id
    ), '[]'::json)
  )
  from profiles pr
  where pr.handle = lower(p_handle) and (pr.is_public or pr.id = auth.uid());
$$;

-- Deletes the caller's account. The cascades take the profile, progress and
-- side quests with it. The app removes photo files first, because Storage
-- objects can't be deleted from SQL.
create function public.delete_me() returns void
language sql security definer set search_path = public as $$
  delete from auth.users where id = auth.uid();
$$;

revoke execute on function public.delete_me() from public, anon;
grant execute on function public.delete_me() to authenticated;
