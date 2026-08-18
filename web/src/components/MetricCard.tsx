export function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-[10px] border border-black/8 bg-surface px-[18px] pt-[18px] pb-4">
      <div className="text-[11px] tracking-[0.08em] text-text-muted uppercase">{label}</div>
      <div className="mt-2 font-serif text-[32px] leading-none font-semibold">{value}</div>
      <div className="mt-1.5 text-xs text-text-secondary-alt">{sub}</div>
    </div>
  );
}
