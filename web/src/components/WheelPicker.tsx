import { useEffect, useRef } from 'react';

const ITEM_HEIGHT = 36;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2) * ITEM_HEIGHT;

// A scroll-snap wheel, like the classic iOS time picker: swipe/scroll to
// spin it, or tap an item to jump straight to it. The centered item is the
// selected value.
export function WheelPicker({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const index = Math.max(0, items.indexOf(value));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'auto' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const i = Math.round(el.scrollTop / ITEM_HEIGHT);
      const clamped = Math.min(items.length - 1, Math.max(0, i));
      if (items[clamped] !== value) onChange(items[clamped]);
      el.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: 'smooth' });
    }, 120);
  }

  function selectItem(i: number) {
    onChange(items[i]);
    containerRef.current?.scrollTo({ top: i * ITEM_HEIGHT, behavior: 'smooth' });
  }

  return (
    <div className="relative" style={{ height: VISIBLE * ITEM_HEIGHT }}>
      <div
        className="pointer-events-none absolute inset-x-0 rounded-md bg-black/5"
        style={{ top: PAD, height: ITEM_HEIGHT }}
      />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full snap-y snap-mandatory overflow-y-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingTop: PAD, paddingBottom: PAD }}
      >
        {items.map((item, i) => (
          <button
            key={item}
            type="button"
            onClick={() => selectItem(i)}
            className={`flex w-full snap-center items-center justify-center text-lg font-semibold ${
              item === value ? 'text-accent' : 'text-text-muted'
            }`}
            style={{ height: ITEM_HEIGHT }}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
