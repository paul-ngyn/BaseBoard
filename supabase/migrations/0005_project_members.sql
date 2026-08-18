-- Replaces the "designated crew" concept (projects.crew_id -> crews, a
-- single group like "Crew A") with a many-to-many list of specific people
-- assigned to each project. Any number of people can be on a project, and a
-- person can be on any number of projects.

create table project_members (
  project_id uuid not null references projects (id) on delete cascade,
  team_member_id uuid not null references team_members (id) on delete cascade,
  primary key (project_id, team_member_id)
);

create index project_members_team_member_id_idx on project_members (team_member_id);

alter table project_members enable row level security;

create policy "read project_members" on project_members for select to authenticated using (true);
create policy "write project_members" on project_members for insert to authenticated
  with check (current_access_level() in ('Full', 'Standard'));
create policy "delete project_members" on project_members for delete to authenticated
  using (current_access_level() in ('Full', 'Standard'));

grant select, insert, update, delete on project_members to authenticated;

-- Best-effort data carry-over: anyone who was in a project's crew, and any
-- team member who belonged to that same crew, becomes an assigned person.
insert into project_members (project_id, team_member_id)
select p.id, tm.id
from projects p
join team_members tm on tm.crew_id = p.crew_id
where p.crew_id is not null
on conflict do nothing;

alter table projects drop column crew_id;
alter table team_members drop column crew_id;
drop table crews;
