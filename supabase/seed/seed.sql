-- Sample data matching the design handoff (Baseboard.dc.html), for local dev
-- / demoing. Dates are anchored to the *current* week (Mon-Fri) so the
-- Schedule view and mobile "Today's schedule" always have something to show,
-- regardless of when you run this. Safe to re-run: clears and reinserts.

truncate table schedule_events, projects, crews, stages, company_settings restart identity cascade;

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

insert into crews (name) values ('Crew A'), ('Crew B'), ('Crew C');

insert into company_settings (id, business_name, service_area, default_markup, crew_count)
values (true, 'Baseboard Flooring Co.', 'Asheville, NC', 22, 3)
on conflict (id) do update set
  business_name = excluded.business_name,
  service_area = excluded.service_area,
  default_markup = excluded.default_markup,
  crew_count = excluded.crew_count;

-- offsets are in days from the Monday of the current week
insert into projects (address, city, client_name, sqft, species, crew_id, start_date, end_date, budget, stage_id, lat, lng)
select v.address, v.city, v.client_name, v.sqft, v.species,
       (select id from crews where name = v.crew_name),
       case when v.start_offset is null then null else (date_trunc('week', current_date)::date + v.start_offset) end,
       case when v.end_offset is null then null else (date_trunc('week', current_date)::date + v.end_offset) end,
       v.budget,
       (select id from stages where name = v.stage_name),
       v.lat, v.lng
from (values
  ('128 Maple Grove Ln', 'Asheville, NC',      'Harmon',    1240, 'White Oak · Natural',     'Crew A', 0,    4,    18600, 'Install In Progress', 35.5951, -82.5515),
  ('74 Cedar Hollow Rd',  'Weaverville, NC',    'Patterson',  980, 'Hickory · Gunstock',      'Crew B', -7,   -1,   14200, 'Sanding / Finishing', 35.6968, -82.5637),
  ('512 Birchwood Ave',   'Hendersonville, NC', 'Okafor',    2100, 'Red Oak · Provincial',    'Crew A', 11,   19,   31500, 'Scheduled',           35.3187, -82.4610),
  ('39 Walnut St',        'Black Mountain, NC', 'Nguyen',     640, 'Maple · Natural',         'Crew C', null, null,  9800, 'Approved',            35.6176, -82.3220),
  ('220 Chestnut Ridge',  'Fairview, NC',       'Bellamy',   1560, 'White Oak · Rift & Qtrd', null,     null, null, 27400, 'Quote Sent',          35.5334, -82.4335),
  ('17 Sycamore Ct',      'Arden, NC',          'Rossi',      410, 'Engineered Oak',          null,     3,    3,     6100, 'Measure',             35.4437, -82.5090),
  ('860 Poplar Bend',     'Candler, NC',        'Whitfield', 3050, 'Walnut · American',       null,     null, null, 52000, 'Materials Ordered',   35.5451, -82.6935),
  ('45 Ashford Pl',       'Asheville, NC',      'Delgado',    720, 'Hickory · Natural',       null,     3,    3,    11300, 'Lead / Estimate',     35.5846, -82.5535),
  ('301 Elmwood Dr',      'Swannanoa, NC',      'Carver',    1180, 'Red Oak · Natural',       'Crew B', -21,  -14,  17900, 'Complete',            35.5993, -82.3985),
  ('12 Timber Way',       'Leicester, NC',      'Sung',       890, 'Maple · Amber',           'Crew C', -35,  -28,  13400, 'Invoiced / Paid',     35.6398, -82.7620)
) as v(address, city, client_name, sqft, species, crew_name, start_offset, end_offset, budget, stage_name, lat, lng);

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

-- Team members are created via Supabase Auth sign-up (see supabase/README.md);
-- the on_auth_user_created trigger inserts a default team_members row, which
-- you then edit here (or in Admin > Team & crews) to match the design's
-- sample roster: Rick Mallory (Owner, Full), Dana Whitfield (Office manager,
-- Full), Luis Ferrante (Lead installer, Crew A, Standard), Marcus Bell
-- (Installer, Crew B, Field only), Tyrese Okafor (Installer, Crew C, Field
-- only), Sam Nguyen (Estimator, Standard).
