-- Gameday v2 schema: teams + games, public read, authenticated write.
-- Run once in the Supabase SQL editor. Includes synthetic seed data so the
-- scoreboard looks right immediately; delete or replace with real data anytime.

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  sport text not null,
  level text not null default 'Varsity',
  created_at timestamptz not null default now()
);

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams (id) on delete cascade,
  opponent text not null,
  starts_at timestamptz not null,
  venue text,
  home_away text not null default 'Home' check (home_away in ('Home', 'Away', 'Neutral')),
  status text not null default 'upcoming' check (status in ('upcoming', 'final')),
  score_us int,
  score_them int,
  placement_us int,
  field_size int,
  created_at timestamptz not null default now()
);

alter table teams enable row level security;
alter table games enable row level security;

drop policy if exists "public read" on teams;
create policy "public read" on teams for select using (true);
drop policy if exists "public read" on games;
create policy "public read" on games for select using (true);

drop policy if exists "authenticated write" on teams;
create policy "authenticated write" on teams
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "authenticated write" on games;
create policy "authenticated write" on games
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Seed: synthetic demo data, dates relative to today.
insert into teams (sport, level) values
  ('Football', 'Varsity'),
  ('Football', 'JV'),
  ('Volleyball', 'Varsity'),
  ('Volleyball', 'JV'),
  ('Girls Soccer', 'Varsity'),
  ('Cross Country', 'Varsity')
on conflict do nothing;

insert into games (team_id, opponent, starts_at, venue, home_away, status, score_us, score_them, placement_us, field_size)
values
  -- upcoming
  ((select id from teams where sport = 'Football' and level = 'Varsity'),
   'Riverside Raiders', (current_date + 4) + time '19:00', 'Sabers Stadium', 'Home', 'upcoming', null, null, null, null),
  ((select id from teams where sport = 'Volleyball' and level = 'Varsity'),
   'Oakdale Eagles', (current_date + 1) + time '18:00', 'Sabers Gymnasium', 'Home', 'upcoming', null, null, null, null),
  ((select id from teams where sport = 'Girls Soccer' and level = 'Varsity'),
   'Brookfield Bears', (current_date + 3) + time '17:30', 'Brookfield Community Park', 'Away', 'upcoming', null, null, null, null),
  ((select id from teams where sport = 'Football' and level = 'JV'),
   'Riverside Raiders', (current_date + 3) + time '18:00', 'Sabers Stadium', 'Home', 'upcoming', null, null, null, null),
  ((select id from teams where sport = 'Cross Country' and level = 'Varsity'),
   'Maplewood Invitational', (current_date + 5) + time '09:00', 'Maplewood Park', 'Away', 'upcoming', null, null, null, null),
  ((select id from teams where sport = 'Volleyball' and level = 'JV'),
   'Hillcrest Hawks', (current_date + 6) + time '12:00', 'Hillcrest High School', 'Away', 'upcoming', null, null, null, null),
  -- finals
  ((select id from teams where sport = 'Football' and level = 'Varsity'),
   'Cedar Grove Cardinals', (current_date - 3) + time '19:00', 'Sabers Stadium', 'Home', 'final', 28, 21, null, null),
  ((select id from teams where sport = 'Volleyball' and level = 'Varsity'),
   'Cedar Grove Cardinals', (current_date - 2) + time '18:00', 'Cedar Grove High School', 'Away', 'final', 2, 3, null, null),
  ((select id from teams where sport = 'Girls Soccer' and level = 'Varsity'),
   'Hillcrest Hawks', (current_date - 4) + time '17:30', 'Sabers Field', 'Home', 'final', 3, 1, null, null),
  ((select id from teams where sport = 'Cross Country' and level = 'Varsity'),
   'Sabers Early-Bird Invite', (current_date - 5) + time '09:00', 'Sabers Trail Course', 'Home', 'final', null, null, 2, 12),
  ((select id from teams where sport = 'Football' and level = 'JV'),
   'Cedar Grove Cardinals', (current_date - 6) + time '18:00', 'Cedar Grove High School', 'Away', 'final', 14, 17, null, null);
