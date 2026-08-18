import { Compass } from '@phosphor-icons/react';
import { useTodayJobs } from '../../hooks/useTodayJobs';

function openDirections(address: string, city: string) {
  const destination = encodeURIComponent(`${address}, ${city}`);
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank', 'noopener');
}

export function Today() {
  const { data, isLoading } = useTodayJobs();
  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();

  const jobs = data?.jobs ?? [];
  const stats = data?.stats ?? { stops: 0, milesToDrive: 0, peopleCount: 0 };

  return (
    <div>
      <div className="bg-accent px-[22px] pb-[22px] text-bg" style={{ paddingTop: 'max(24px, env(safe-area-inset-top))' }}>
        <div className="text-xs tracking-[0.1em] opacity-80 uppercase">{dateLabel}</div>
        <h3 className="mt-1.5 text-[26px] font-semibold">Today's schedule</h3>
        <div className="mt-4 flex gap-5">
          <div>
            <div className="font-serif text-[22px] font-semibold">{stats.stops}</div>
            <div className="text-[11px] opacity-80">stops</div>
          </div>
          <div>
            <div className="font-serif text-[22px] font-semibold">
              {stats.milesToDrive}
              <span className="text-[13px]"> mi</span>
            </div>
            <div className="text-[11px] opacity-80">to drive</div>
          </div>
          <div>
            <div className="font-serif text-[22px] font-semibold">{stats.peopleCount}</div>
            <div className="text-[11px] opacity-80">people</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 p-4">
        {isLoading && <p className="text-center text-sm text-text-muted">Loading…</p>}
        {!isLoading && jobs.length === 0 && <p className="text-center text-sm text-text-muted">No jobs scheduled for today.</p>}
        {jobs.map((j) => (
          <div key={j.id} className="rounded-[14px] border border-black/8 bg-surface p-4">
            <div className="flex items-center justify-between">
              <div className="tabular-nums text-[13px] font-semibold text-accent">{j.time}</div>
              <span
                className="inline-flex rounded-full px-[11px] py-1 text-[10.5px] font-semibold"
                style={{ background: j.pillBg, color: j.pillFg }}
              >
                {j.stage}
              </span>
            </div>
            <div className="mt-2 text-base leading-tight font-semibold">{j.addr}</div>
            <div className="mt-0.5 text-[13px] text-text-secondary-alt">
              {j.city} · {j.client}
            </div>
            <div className="mt-3.5 flex items-center justify-between border-t border-black/10 pt-3">
              <div className="mr-2 flex-1 text-xs text-text-secondary-alt">
                {j.people} · {j.note}
              </div>
              <button
                onClick={() => openDirections(j.addr, j.city)}
                className="flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-[7px] text-xs font-semibold text-bg"
              >
                <Compass size={13} weight="duotone" />
                Directions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
