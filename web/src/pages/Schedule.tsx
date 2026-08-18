import { useMemo, useState } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { useMonthSchedule, useStages } from '../hooks/useData';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isoOf(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function Schedule() {
  const [monthAnchor, setMonthAnchor] = useState(() => new Date());
  const [openDay, setOpenDay] = useState<Date | null>(null);
  const { data: events = [], isLoading, gridStart, gridEnd } = useMonthSchedule(monthAnchor);
  const { data: stages = [] } = useStages();
  const stageById = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages]);

  const today = new Date();
  const monthLabel = monthAnchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const weeks = useMemo(() => {
    const days: Date[] = [];
    for (let d = new Date(gridStart); d <= gridEnd; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    const out: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
    return out;
  }, [gridStart, gridEnd]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof events>();
    for (const e of events) {
      const list = map.get(e.event_date) ?? [];
      list.push(e);
      map.set(e.event_date, list);
    }
    return map;
  }, [events]);

  function eventStyle(e: (typeof events)[number]) {
    const stage = e.projects ? stageById.get(e.projects.stage_id) : undefined;
    return { bg: stage?.bg_color ?? '#c39a5a', fg: stage?.fg_color ?? '#ffffff' };
  }

  const openDayEvents = openDay ? (eventsByDate.get(isoOf(openDay)) ?? []) : [];

  return (
    <div className="px-4 pt-[26px] pb-[30px] lg:px-[30px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="m-0 mb-1 text-[29px]">Schedule</h2>
          <p className="m-0 text-[13px] text-text-secondary">{monthLabel} · installs and visits</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="secondary" className="text-xs" onClick={() => setMonthAnchor(new Date())}>
            Today
          </Button>
          <button
            aria-label="Previous month"
            onClick={() => setMonthAnchor((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            className="cursor-pointer rounded border border-black/12 bg-surface p-1.5 text-text hover:bg-black/5"
          >
            <CaretLeft size={14} />
          </button>
          <button
            aria-label="Next month"
            onClick={() => setMonthAnchor((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            className="cursor-pointer rounded border border-black/12 bg-surface p-1.5 text-text hover:bg-black/5"
          >
            <CaretRight size={14} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-5 text-sm text-text-muted">Loading schedule…</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-7 border-b border-black/10 pb-2">
              {DOW.map((dow) => (
                <div key={dow} className="text-center text-[11px] font-semibold tracking-[0.06em] text-text-muted uppercase">
                  {dow}
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 border-b border-black/8">
                  {week.map((day) => {
                    const inMonth = day.getMonth() === monthAnchor.getMonth();
                    const isToday = sameDay(day, today);
                    const dayEvents = eventsByDate.get(isoOf(day)) ?? [];
                    const shown = dayEvents.slice(0, 2);
                    const extra = dayEvents.length - shown.length;
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => dayEvents.length > 0 && setOpenDay(day)}
                        className={`flex min-h-[92px] flex-col items-stretch gap-1 border-r border-black/8 p-1.5 text-left last:border-r-0 ${
                          inMonth ? '' : 'opacity-40'
                        } ${dayEvents.length ? 'cursor-pointer hover:bg-black/3' : 'cursor-default'}`}
                      >
                        <span
                          className={`self-start text-xs ${
                            isToday
                              ? 'flex h-5 w-5 items-center justify-center rounded-full bg-accent font-semibold text-bg'
                              : 'text-text-muted'
                          }`}
                        >
                          {day.getDate()}
                        </span>
                        {shown.map((e) => {
                          const { bg, fg } = eventStyle(e);
                          return (
                            <div
                              key={e.id}
                              className="truncate rounded px-1.5 py-0.5 text-[10.5px] font-semibold"
                              style={{ background: bg, color: fg }}
                            >
                              {e.projects?.address ?? '—'}
                            </div>
                          );
                        })}
                        {extra > 0 && <div className="text-[10.5px] text-text-muted">+{extra} more</div>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {openDay && (
        <Modal
          title={openDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          onClose={() => setOpenDay(null)}
        >
          <div className="flex flex-col gap-2">
            {openDayEvents.map((e) => {
              const { bg, fg } = eventStyle(e);
              return (
                <div key={e.id} className="rounded-[7px] px-3 py-2 leading-tight" style={{ background: bg, color: fg }}>
                  <div className="text-[11px] opacity-85">{e.time_label}</div>
                  <div className="text-xs font-semibold">{e.projects?.address ?? '—'}</div>
                  <div className="text-[11px] opacity-90">{e.label}</div>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}
