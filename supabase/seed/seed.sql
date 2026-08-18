-- Sample data matching the design handoff (Baseboard.dc.html), for local dev
-- / demoing. Dates are anchored to the *current* week (Mon-Fri) so the
-- Schedule view and mobile "Today's schedule" always have something to show,
-- regardless of when you run this. Safe to re-run: clears and reinserts.

truncate table schedule_events, project_members, projects, stages, company_settings restart identity cascade;

insert into stages (position, name, bg_color, fg_color, is_done) values
  (1,  'Lead / Estimate',     '#cbb488', '#3a2e18', false),
  (2,  'Measure',             '#c39a5a', '#ffffff', false),
  (3,  'Quote Sent',          '#d98f3d', '#3a2308', false),
  (4,  'Approved',            '#b5701f', '#ffffff', false),
  (5,  'Materials Ordered',   '#a9581f', '#ffffff', false),
  (6,  'Scheduled',           '#8a6d3b', '#ffffff', false),
  (7,  'Install In Progress', '#9c4a22', '#ffffff', false),
  (8,  'Sanding / Finishing', '#7d5a2e', '#ffffff', false),
  (9,  'Final Walkthrough',   '#5f6b3a', '#ffffff', false),
  (10, 'Complete',            '#4a7a44', '#ffffff', true),
  (11, 'Invoiced / Paid',     '#3c5f34', '#ffffff', true);

insert into company_settings (id, business_name, service_area, crew_count)
values (true, 'Specialty Hardwood Floors', 'Alameda, CA', 3)
on conflict (id) do update set
  business_name = excluded.business_name,
  service_area = excluded.service_area,
  crew_count = excluded.crew_count;

-- offsets are in days from the Monday of the current week
insert into projects (address, city, client_name, sqft, species, start_date, end_date, stage_id, lat, lng)
select v.address, v.city, v.client_name, v.sqft, v.species,
       case when v.start_offset is null then null else (date_trunc('week', current_date)::date + v.start_offset) end,
       case when v.end_offset is null then null else (date_trunc('week', current_date)::date + v.end_offset) end,
       (select id from stages where name = v.stage_name),
       v.lat, v.lng
from (values
  ('128 Maple Grove Ln', 'Asheville, NC',      'Harmon',    1240, 'White Oak · Natural',     0,    4,    'Install In Progress', 35.5951, -82.5515),
  ('74 Cedar Hollow Rd',  'Weaverville, NC',    'Patterson',  980, 'Hickory · Gunstock',      -7,   -1,   'Sanding / Finishing', 35.6968, -82.5637),
  ('512 Birchwood Ave',   'Hendersonville, NC', 'Okafor',    2100, 'Red Oak · Provincial',    11,   19,   'Scheduled',           35.3187, -82.4610),
  ('39 Walnut St',        'Black Mountain, NC', 'Nguyen',     640, 'Maple · Natural',         null, null, 'Approved',            35.6176, -82.3220),
  ('220 Chestnut Ridge',  'Fairview, NC',       'Bellamy',   1560, 'White Oak · Rift & Qtrd', null, null, 'Quote Sent',          35.5334, -82.4335),
  ('17 Sycamore Ct',      'Arden, NC',          'Rossi',      410, 'Engineered Oak',          3,    3,    'Measure',             35.4437, -82.5090),
  ('860 Poplar Bend',     'Candler, NC',        'Whitfield', 3050, 'Walnut · American',       null, null, 'Materials Ordered',   35.5451, -82.6935),
  ('45 Ashford Pl',       'Asheville, NC',      'Delgado',    720, 'Hickory · Natural',       3,    3,    'Lead / Estimate',     35.5846, -82.5535),
  ('301 Elmwood Dr',      'Swannanoa, NC',      'Carver',    1180, 'Red Oak · Natural',       -21,  -14,  'Complete',            35.5993, -82.3985),
  ('12 Timber Way',       'Leicester, NC',      'Sung',       890, 'Maple · Amber',           -35,  -28,  'Invoiced / Paid',     35.6398, -82.7620)
) as v(address, city, client_name, sqft, species, start_offset, end_offset, stage_name, lat, lng);

-- Schedule events for this week (Mon-Fri), mirroring the design's sample week.
insert into schedule_events (project_id, event_date, time_label, label)
select (select id from projects where address = v.address),
       (date_trunc('week', current_date)::date + v.day_offset),
       v.time_label, v.label
from (values
  ('128 Maple Grove Ln', 0, '8:00a',  'Install day 1'),
  ('74 Cedar Hollow Rd',  0, '1:00p',  'Screen & recoat'),
  ('128 Maple Grove Ln', 1, '8:00a',  'Install day 2'),
  ('74 Cedar Hollow Rd',  1, '10:30a', 'Final coat'),
  ('128 Maple Grove Ln', 2, '9:00a',  'Install day 3'),
  ('17 Sycamore Ct',      3, '8:30a',  'Site measure'),
  ('45 Ashford Pl',       3, '2:00p',  'Estimate visit'),
  ('128 Maple Grove Ln', 4, '9:00a',  'Walkthrough')
) as v(address, day_offset, time_label, label);

-- Sample team roster, added as placeholders (no login) per the design's
-- sample data — team_members no longer requires an auth account to exist
-- (see migration 0003). You (the owner) are separate: create your own real
-- login per supabase/README.md, which becomes its own team_members row via
-- the sign-up trigger — don't seed "Rick Mallory" here to avoid a clash.
insert into team_members (name, email, role, access_level)
values
  ('Dana Whitfield', 'dana@baseboard.co',   'Office manager', 'Full'),
  ('Luis Ferrante',  'luis@baseboard.co',   'Lead installer', 'Standard'),
  ('Marcus Bell',    'marcus@baseboard.co', 'Installer',      'Field only'),
  ('Tyrese Okafor',  'ty@baseboard.co',     'Installer',      'Field only'),
  ('Sam Nguyen',     'sam@baseboard.co',    'Estimator',      'Standard')
on conflict (email) do nothing;

-- Who's assigned to what — a project can have any number of people, a
-- person can be on any number of projects.
insert into project_members (project_id, team_member_id)
select (select id from projects where address = v.address), (select id from team_members where email = v.email)
from (values
  ('128 Maple Grove Ln', 'luis@baseboard.co'),
  ('74 Cedar Hollow Rd',  'marcus@baseboard.co'),
  ('512 Birchwood Ave',   'luis@baseboard.co'),
  ('512 Birchwood Ave',   'ty@baseboard.co'),
  ('39 Walnut St',        'ty@baseboard.co'),
  ('301 Elmwood Dr',      'marcus@baseboard.co'),
  ('12 Timber Way',       'ty@baseboard.co')
) as v(address, email)
on conflict do nothing;
