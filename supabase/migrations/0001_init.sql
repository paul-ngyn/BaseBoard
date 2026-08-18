-- Baseboard schema: crews, stages, projects, team_members, company_settings
-- Single-company (single-tenant) app. RLS restricts writes on admin tables to
-- users whose team_members.access_level = 'Full'.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- crews
-- ---------------------------------------------------------------------------
create table crews (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- stages (the pipeline, in order)
-- ---------------------------------------------------------------------------
create table stages (
  id uuid primary key default gen_random_uuid(),
  position int not null unique,
  name text not null unique,
  bg_color text not null,
  fg_color text not null,
  is_done boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- team_members (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create type access_level as enum ('Full', 'Standard', 'Field only');

create table team_members (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role text not null,
  crew_id uuid references crews (id) on delete set null,
  access_level access_level not null default 'Field only',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table projects (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  city text not null,
  client_name text not null,
  client_contact text,
  sqft int not null default 0,
  species text not null default '',
  crew_id uuid references crews (id) on delete set null,
  start_date date,
  end_date date,
  budget numeric(12, 2) not null default 0,
  stage_id uuid not null references stages (id),
  materials_list jsonb not null default '[]'::jsonb,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_stage_id_idx on projects (stage_id);
create index projects_crew_id_idx on projects (crew_id);

-- ---------------------------------------------------------------------------
-- schedule_events — the per-day items shown on the Schedule view (and used to
-- build mobile "Today's schedule"). A project can have several across a week
-- (e.g. "Install day 1", "Install day 2").
-- ---------------------------------------------------------------------------
create table schedule_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  event_date date not null,
  time_label text not null,
  label text not null,
  created_at timestamptz not null default now()
);

create index schedule_events_date_idx on schedule_events (event_date);
create index schedule_events_project_id_idx on schedule_events (project_id);

-- ---------------------------------------------------------------------------
-- company_settings (single row)
-- ---------------------------------------------------------------------------
create table company_settings (
  id boolean primary key default true constraint single_row check (id),
  business_name text not null default '',
  service_area text not null default '',
  default_markup numeric(5, 2) not null default 0,
  crew_count int not null default 0,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- helper: current user's access level
-- ---------------------------------------------------------------------------
create or replace function current_access_level()
returns access_level
language sql
stable
security definer
set search_path = public
as $$
  select access_level from team_members where id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at
  before update on projects
  for each row execute function set_updated_at();

create trigger company_settings_set_updated_at
  before update on company_settings
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table crews enable row level security;
alter table stages enable row level security;
alter table team_members enable row level security;
alter table projects enable row level security;
alter table schedule_events enable row level security;
alter table company_settings enable row level security;

-- Any authenticated user (any team member) can read everything.
create policy "read crews" on crews for select to authenticated using (true);
create policy "read stages" on stages for select to authenticated using (true);
create policy "read team_members" on team_members for select to authenticated using (true);
create policy "read projects" on projects for select to authenticated using (true);
create policy "read schedule_events" on schedule_events for select to authenticated using (true);
create policy "read company_settings" on company_settings for select to authenticated using (true);

create policy "write schedule_events" on schedule_events for insert to authenticated
  with check (current_access_level() in ('Full', 'Standard'));
create policy "update schedule_events" on schedule_events for update to authenticated
  using (current_access_level() in ('Full', 'Standard')) with check (current_access_level() in ('Full', 'Standard'));
create policy "delete schedule_events" on schedule_events for delete to authenticated
  using (current_access_level() in ('Full', 'Standard'));

-- Stage changes on projects: Standard and Full can update (the core day-to-day
-- action); Field-only crew members can also update stage (per README, this is
-- the field crew's core workflow action) but not other project fields.
-- Simplify: any authenticated team member can update projects (stage moves,
-- notes); only Full/Standard can insert/delete projects.
create policy "update projects" on projects for update to authenticated
  using (true) with check (true);
create policy "insert projects" on projects for insert to authenticated
  with check (current_access_level() in ('Full', 'Standard'));
create policy "delete projects" on projects for delete to authenticated
  using (current_access_level() = 'Full');

-- Admin-only tables: crews, stages, team_members, company_settings writes
-- require Full access.
create policy "write crews" on crews for insert to authenticated
  with check (current_access_level() = 'Full');
create policy "update crews" on crews for update to authenticated
  using (current_access_level() = 'Full') with check (current_access_level() = 'Full');
create policy "delete crews" on crews for delete to authenticated
  using (current_access_level() = 'Full');

create policy "write stages" on stages for insert to authenticated
  with check (current_access_level() = 'Full');
create policy "update stages" on stages for update to authenticated
  using (current_access_level() = 'Full') with check (current_access_level() = 'Full');
create policy "delete stages" on stages for delete to authenticated
  using (current_access_level() = 'Full');

create policy "write team_members" on team_members for insert to authenticated
  with check (current_access_level() = 'Full');
create policy "update team_members" on team_members for update to authenticated
  using (current_access_level() = 'Full') with check (current_access_level() = 'Full');
create policy "delete team_members" on team_members for delete to authenticated
  using (current_access_level() = 'Full');

create policy "update company_settings" on company_settings for update to authenticated
  using (current_access_level() = 'Full') with check (current_access_level() = 'Full');

-- ---------------------------------------------------------------------------
-- auto-create a team_members row whenever a new auth user signs up
-- (defaults to 'Field only' access; a Full-access admin promotes them in
-- Admin > Team & crews after the fact).
-- ---------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into team_members (id, name, email, role, access_level)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'Installer'),
    'Field only'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
