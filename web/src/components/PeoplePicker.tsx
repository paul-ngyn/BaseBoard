import type { TeamMember } from '../types/database';

export function PeoplePicker({
  people,
  selected,
  onChange,
}: {
  people: TeamMember[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }

  if (people.length === 0) {
    return <p className="m-0 text-xs text-text-muted">No team members yet — add some in Admin first.</p>;
  }

  return (
    <div className="flex max-h-[180px] flex-col gap-1 overflow-y-auto rounded-md border border-black/12 bg-surface p-2">
      {people.map((p) => (
        <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-[13px] hover:bg-black/5">
          <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} />
          <span className="flex-1">{p.name}</span>
          <span className="text-xs text-text-muted">{p.role}</span>
        </label>
      ))}
    </div>
  );
}
