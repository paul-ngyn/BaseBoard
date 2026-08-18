export function StagePill({ name, bg, fg }: { name: string; bg: string; fg: string }) {
  return (
    <span
      className="inline-flex whitespace-nowrap rounded-full px-3 py-[5px] text-[11.5px] font-semibold tracking-[0.01em]"
      style={{ background: bg, color: fg }}
    >
      {name}
    </span>
  );
}
