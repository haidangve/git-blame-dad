-- Four quests from Uncle Toan and Mom. Mirrors data/skills.ts.
insert into public.skills (id, region, xp) values
  ('moto', 'backyard', 90),
  ('cook', 'hands', 70),
  ('craft', 'hands', 70),
  ('peace', 'inner', 120)
on conflict (id) do nothing;
