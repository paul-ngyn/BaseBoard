-- Decouples team_members from requiring a real auth.users account.
--
-- Previously team_members.id *was* the auth.users id (1:1, required). That
-- meant every team member had to sign up or be invited before they could
-- exist as a row at all. This migration adds a separate, nullable
-- auth_user_id column instead, so a "placeholder" team member (no login)
-- can be added directly — e.g. straight in Supabase's Table Editor, which
-- is already a spreadsheet-style grid for any table — and linked to a real
-- login later if/when they need one.

alter table team_members add column auth_user_id uuid unique references auth.users (id) on delete set null;
alter table team_members add constraint team_members_email_key unique (email);

-- Backfill: every existing row today *is* tied 1:1 to an auth user via id.
update team_members set auth_user_id = id;

-- team_members.id becomes a plain generated id, no longer required to match
-- an auth user.
alter table team_members alter column id set default gen_random_uuid();

do $$
declare
  fk_name text;
begin
  select tc.constraint_name into fk_name
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu on tc.constraint_name = kcu.constraint_name
  where tc.table_name = 'team_members'
    and tc.constraint_type = 'FOREIGN KEY'
    and kcu.column_name = 'id';
  if fk_name is not null then
    execute format('alter table team_members drop constraint %I', fk_name);
  end if;
end $$;

-- Access checks now key off auth_user_id, not id.
create or replace function current_access_level()
returns access_level
language sql
stable
security definer
set search_path = public
as $$
  select access_level from team_members where auth_user_id = auth.uid();
$$;

-- When someone signs up (invited or added directly), link them to a
-- matching placeholder row by email if one exists; otherwise create a new
-- row as before.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update team_members
  set auth_user_id = new.id
  where email = new.email and auth_user_id is null;

  if not found then
    insert into team_members (auth_user_id, name, email, role, access_level)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
      new.email,
      coalesce(new.raw_user_meta_data ->> 'role', 'Installer'),
      'Field only'
    );
  end if;

  return new;
end;
$$;
