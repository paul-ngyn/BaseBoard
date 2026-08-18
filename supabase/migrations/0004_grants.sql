-- Defensive fix: RLS policies only apply *after* Postgres checks the base
-- table-level grant for a role. If a table is missing the standard grant to
-- 'authenticated' (can happen depending on how/when it was created via the
-- SQL Editor), every query on it fails with "permission denied for table
-- X" regardless of how permissive the RLS policies are. This grants the
-- baseline privileges explicitly on every app table — safe to re-run.
grant select, insert, update, delete on
  projects, stages, crews, schedule_events, company_settings, team_members
to authenticated;
