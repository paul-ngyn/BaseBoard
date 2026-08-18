-- Quick-add a team member with just a name — email and role are no longer
-- required. (The email unique constraint from migration 0003 still holds:
-- Postgres treats multiple NULLs as distinct, so any number of no-email
-- rows can coexist.) Fill email in later, whenever that person actually
-- needs a real login (Admin > Invite).
alter table team_members alter column email drop not null;
alter table team_members alter column role drop not null;
