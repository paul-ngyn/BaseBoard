const PALETTE = ['#8a5a2b', '#a9581f', '#7d5a2e', '#5f6b3a', '#9c4a22', '#4a7a44'];

function hashIndex(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % PALETTE.length;
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className="grid flex-none place-items-center rounded-full font-serif font-semibold text-bg"
      style={{ width: size, height: size, background: PALETTE[hashIndex(name)], fontSize: size * 0.42 }}
    >
      {initials}
    </span>
  );
}
