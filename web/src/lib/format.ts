export function money(n: number) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function dateRange(start: string | null, end: string | null) {
  if (!start) return '—';
  const s = new Date(start + 'T00:00:00');
  const sLabel = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (!end || end === start) return sLabel;
  const e = new Date(end + 'T00:00:00');
  const sameMonth = s.getMonth() === e.getMonth();
  const eLabel = sameMonth ? e.getDate().toString() : e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${sLabel} – ${eLabel}`;
}
