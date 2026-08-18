import { useEffect, useState } from 'react';

// Matches Tailwind's `lg` breakpoint (1024px), used to decide which of two
// layouts to actually mount — not just which to show with CSS — since some
// components (drag-and-drop sortable items) break if both are mounted for
// the same ids at once.
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => (typeof window === 'undefined' ? true : window.innerWidth >= 1024));

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsDesktop(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
}
