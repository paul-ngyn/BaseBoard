import { useMemo } from 'react';
import { MetricCard } from '../components/MetricCard';
import { useProjects, useStages } from '../hooks/useData';

const ON_SITE_STAGES = new Set(['Install In Progress', 'Sanding / Finishing']);

export function Dashboard() {
  const { data: projects = [] } = useProjects();
  const { data: stages = [] } = useStages();

  const stageById = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages]);
  const doneIds = useMemo(() => new Set(stages.filter((s) => s.is_done).map((s) => s.id)), [stages]);

  const active = projects.filter((p) => !doneIds.has(p.stage_id));
  const onSite = active.filter((p) => ON_SITE_STAGES.has(stageById.get(p.stage_id)?.name ?? '')).length;
  const sqftActive = active.reduce((a, p) => a + p.sqft, 0);
  const towns = new Set(active.map((p) => p.city)).size;

  const metrics = [
    { label: 'Active jobs', value: String(active.length), sub: `across ${towns} town${towns === 1 ? '' : 's'}` },
    { label: 'On site now', value: String(onSite), sub: 'installing / finishing' },
    { label: 'Sq ft booked', value: sqftActive.toLocaleString('en-US'), sub: 'in active jobs' },
  ];

  const stageDist = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) counts.set(p.stage_id, (counts.get(p.stage_id) ?? 0) + 1);
    const present = stages.filter((s) => counts.get(s.id));
    const max = Math.max(1, ...present.map((s) => counts.get(s.id) ?? 0));
    return present.map((s) => ({ stage: s, count: counts.get(s.id) ?? 0, pct: Math.round(((counts.get(s.id) ?? 0) / max) * 100) }));
  }, [projects, stages]);

  const upcoming = useMemo(() => {
    const withDates = active.filter((p) => p.start_date).sort((a, b) => (a.start_date! < b.start_date! ? -1 : 1));
    const withoutDates = active.filter((p) => !p.start_date);
    return [...withDates, ...withoutDates].slice(0, 4).map((p) => {
      const stage = stageById.get(p.stage_id);
      const names = p.project_members.map((pm) => pm.team_members.name);
      const detail = names.length ? `${names.join(', ')} · ${p.species}` : `${stage?.name ?? ''} · follow up`;
      const when = p.start_date
        ? new Date(p.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'TBD';
      return { id: p.id, addr: p.address, detail, when, bg: stage?.bg_color ?? '#c39a5a' };
    });
  }, [active, stageById]);

  return (
    <div className="px-4 pt-[26px] pb-[30px] lg:px-[30px]">
      <h2 className="m-0 mb-1 text-[29px]">Dashboard</h2>
      <p className="mt-0 mb-[22px] text-[13px] text-text-secondary">This week at a glance</p>

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h4 className="m-0 mb-3.5 text-base">Projects by stage</h4>
          <div className="flex flex-col gap-2.5">
            {stageDist.map((s) => (
              <div key={s.stage.id} className="flex items-center gap-3">
                <div className="w-[150px] flex-none text-[12.5px] text-[#4a3d30]">{s.stage.name}</div>
                <div className="h-4 flex-1 overflow-hidden rounded-full bg-black/6">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.stage.bg_color }} />
                </div>
                <div className="w-[22px] text-right text-[12.5px] font-semibold text-[#4a3d30]">{s.count}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="m-0 mb-3.5 text-base">Starting soon</h4>
          <div className="flex flex-col gap-3">
            {upcoming.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="h-9 w-1.5 flex-none rounded-full" style={{ background: u.bg }} />
                <div className="flex-1 leading-tight">
                  <div className="text-[13px] font-semibold">{u.addr}</div>
                  <div className="text-xs text-text-secondary-alt">{u.detail}</div>
                </div>
                <div className="tabular-nums text-xs whitespace-nowrap text-text-secondary-alt">{u.when}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
