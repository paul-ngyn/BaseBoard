import { useRef, useState } from 'react';
import { CalendarBlank, Clock } from '@phosphor-icons/react';
import { Modal } from './Modal';
import { Button } from './Button';
import { WheelPicker } from './WheelPicker';
import { useSetProjectSchedule } from '../hooks/useData';
import { getErrorMessage } from '../lib/errors';

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'p.m.' : 'a.m.';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

// "14:30" -> { hour: "2", minute: "30", period: "PM" }
function split24h(t: string) {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return { hour: String(hour12), minute: String(m).padStart(2, '0'), period };
}

// { hour: "2", minute: "30", period: "PM" } -> "14:30"
function join24h(hour: string, minute: string, period: string) {
  let h = Number(hour) % 12;
  if (period === 'PM') h += 12;
  return `${String(h).padStart(2, '0')}:${minute}`;
}

function openPicker(input: HTMLInputElement | null) {
  if (!input) return;
  const showPicker = (input as HTMLInputElement & { showPicker?: () => void }).showPicker;
  if (showPicker) {
    try {
      showPicker.call(input);
      return;
    } catch {
      // falls through to focus() below
    }
  }
  input.focus();
}

const chipClass =
  'tabular-nums relative flex cursor-pointer items-center gap-1 rounded border border-black/12 bg-surface px-2 py-1 text-[11px] font-semibold text-text hover:bg-black/5';

export function ProjectDateCell({
  projectId,
  date,
  time,
}: {
  projectId: string;
  date: string | null;
  time: string | null;
}) {
  const setSchedule = useSetProjectSchedule();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [timeOpen, setTimeOpen] = useState(false);
  const [draft, setDraft] = useState(() => split24h(time ?? '09:00'));
  const [timeError, setTimeError] = useState<string | null>(null);

  function openTimeEditor() {
    setDraft(split24h(time ?? '09:00'));
    setTimeError(null);
    setTimeOpen(true);
  }

  function commitTime() {
    const next = join24h(draft.hour, draft.minute, draft.period);
    setSchedule.mutate(
      { projectId, date, time: next },
      {
        onSuccess: () => setTimeOpen(false),
        onError: (err) => setTimeError(getErrorMessage(err, 'Failed to set time')),
      }
    );
  }

  function clearTime() {
    setSchedule.mutate(
      { projectId, date, time: null },
      {
        onSuccess: () => setTimeOpen(false),
        onError: (err) => setTimeError(getErrorMessage(err, 'Failed to clear time')),
      }
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button type="button" onClick={() => openPicker(dateInputRef.current)} className={chipClass}>
        <CalendarBlank size={12} weight="bold" />
        {date ? formatDate(date) : <span className="text-text-muted">set date</span>}
        <input
          ref={dateInputRef}
          type="date"
          value={date ?? ''}
          onChange={(e) =>
            setSchedule.mutate(
              { projectId, date: e.target.value || null, time },
              { onError: (err) => window.alert(getErrorMessage(err, 'Failed to set date')) }
            )
          }
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Next date"
        />
      </button>

      <button type="button" onClick={openTimeEditor} className={chipClass}>
        <Clock size={12} weight="bold" />
        {time ? formatTime(time) : <span className="text-text-muted">time</span>}
      </button>

      {timeOpen && (
        <Modal title="Set time" onClose={() => setTimeOpen(false)}>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-center gap-1 rounded-md border border-black/12 bg-surface px-2">
              <div className="w-12">
                <WheelPicker items={HOURS} value={draft.hour} onChange={(hour) => setDraft((d) => ({ ...d, hour }))} />
              </div>
              <span className="text-lg font-semibold text-text-muted">:</span>
              <div className="w-12">
                <WheelPicker items={MINUTES} value={draft.minute} onChange={(minute) => setDraft((d) => ({ ...d, minute }))} />
              </div>
              <div className="w-14">
                <WheelPicker items={PERIODS} value={draft.period} onChange={(period) => setDraft((d) => ({ ...d, period }))} />
              </div>
            </div>
            {timeError && <p className="m-0 text-sm text-red-700">{timeError}</p>}
            <div className="flex gap-2">
              {time && (
                <Button variant="secondary" type="button" onClick={clearTime} className="flex-1 justify-center">
                  Clear
                </Button>
              )}
              <Button variant="primary" type="button" onClick={commitTime} className="flex-1 justify-center">
                Set time
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
