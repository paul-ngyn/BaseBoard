import { useMemo } from 'react';
import { useStages, useWeekSchedule } from '../hooks/useData';

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export function Schedule() {
  const { data, isLoading } = useWeekSchedule();
  const { data: stages = [] } = useStages();
  const stageById = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages]);

  const weekLabel = data
    ? data.monday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : '';

  const days = useMemo(() => {
    if (!data) return [];
    return DOW.map((dow, i) => {
      const date = new Date(data.monday);
      date.setDate(date.getDate() + i);
      const iso = date.toISOString().slice(0, 10);
      const events = data.events
        .filter((e) => e.event_date === iso)
        .map((e) => {
          const stage = e.projects ? stageById.get(e.projects.stage_id) : undefined;
          return {
            id: e.id,
            time: e.time_label,
            addr: e.projects?.address ?? '—',
            label: e.label,
            bg: stage?.bg_color ?? '#c39a5a',
            fg: stage?.fg_color ?? '#ffffff',
          };
        });
      return { dow, dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), events };
    });
  }, [data, stageById]);

  return (
    <div className="px-[30px] pt-[26px] pb-[30px]">
      <h2 className="m-0 mb-1 text-[29px]">Schedule</h2>
      <p className="mt-0 mb-5 text-[13px] text-text-secondary">
        Week of {weekLabel} · crews and installs
      </p>

      {isLoading ? (
        <p className="text-sm text-text-muted">Loading schedule…</p>
      ) : (
        <div className="grid grid-cols-5 gap-3">
          {days.map((d) => (
            <div key={d.dow} className="flex min-h-[300px] flex-col gap-2 rounded-[10px] border border-black/8 bg-surface p-3">
              <div className="flex items-baseline justify-between border-b border-black/10 pb-2">
                <span className="text-xs font-semibold tracking-[0.06em] text-[#4a3d30] uppercase">{d.dow}</span>
                <span className="text-xs text-text-muted">{d.dateLabel}</span>
              </div>
              {d.events.map((e) => (
                <div key={e.id} className="rounded-[7px] px-2.5 py-2 leading-tight" style={{ background: e.bg, color: e.fg }}>
                  <div className="text-[11px] opacity-85">{e.time}</div>
                  <div className="text-xs font-semibold">{e.addr}</div>
                  <div className="text-[11px] opacity-90">{e.label}</div>
                </div>
              ))}
              {d.events.length === 0 && <div className="text-xs text-text-muted">No events</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
