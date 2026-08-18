import { useRef } from 'react';
import { Clock, CalendarBlank } from '@phosphor-icons/react';
import { useUpdateProjectDate, useUpdateProjectTime } from '../hooks/useData';

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'p' : 'a';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')}${period}`;
}

function openPicker(input: HTMLInputElement | null) {
  if (!input) return;
  const showPicker = (input as HTMLInputElement & { showPicker?: () => void }).showPicker;
  if (showPicker) showPicker.call(input);
  else input.focus();
}

const chipClass =
  'tabular-nums flex cursor-pointer items-center gap-1 rounded border border-black/12 bg-surface px-2 py-1 text-[11px] font-semibold text-text hover:bg-black/5';

export function ProjectDateCell({
  projectId,
  date,
  time,
}: {
  projectId: string;
  date: string | null;
  time: string | null;
}) {
  const updateDate = useUpdateProjectDate();
  const updateTime = useUpdateProjectTime();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="relative inline-flex items-center">
        <button type="button" onClick={() => openPicker(dateInputRef.current)} className={chipClass}>
          <CalendarBlank size={12} weight="bold" />
          {date ? formatDate(date) : <span className="text-text-muted">set date</span>}
        </button>
        <input
          ref={dateInputRef}
          type="date"
          value={date ?? ''}
          onChange={(e) => updateDate.mutate({ projectId, date: e.target.value || null })}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          aria-label="Next date"
          tabIndex={-1}
        />
      </div>

      <div className="relative inline-flex items-center">
        <button type="button" onClick={() => openPicker(timeInputRef.current)} className={chipClass}>
          <Clock size={12} weight="bold" />
          {time ? formatTime(time) : <span className="text-text-muted">time</span>}
        </button>
        <input
          ref={timeInputRef}
          type="time"
          value={time ?? ''}
          onChange={(e) => updateTime.mutate({ projectId, time: e.target.value || null })}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          aria-label="Next time"
          tabIndex={-1}
        />
      </div>
    </div>
  );
}
