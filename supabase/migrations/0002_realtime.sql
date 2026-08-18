-- Enable Realtime broadcasts for the tables the crew's "Today" view and the
-- web app's Projects/Schedule/Dashboard views need to stay live without a
-- manual refresh. Realtime respects each table's existing RLS policies, so
-- no policy changes are needed here.
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table schedule_events;
