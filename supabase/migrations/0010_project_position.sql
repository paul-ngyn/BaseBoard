-- Lets projects be manually drag-reordered (in the Projects list, on both
-- web and mobile) instead of always sorting by created_at.
alter table projects add column position bigint;

update projects set position = sub.rn
from (select id, row_number() over (order by created_at) as rn from projects) sub
where projects.id = sub.id;

-- New rows default to "the end of the list" using the current epoch time,
-- so no query is needed to compute max(position) on insert.
alter table projects alter column position set not null;
alter table projects alter column position set default extract(epoch from now())::bigint;
