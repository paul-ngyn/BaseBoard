import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { CalendarBlank, Table, MapPin, List } from '@phosphor-icons/react';

const TABS = [
  { to: '/m/today', label: 'Today', icon: CalendarBlank },
  { to: '/m/jobs', label: 'Jobs', icon: Table },
  { to: '/m/map', label: 'Map', icon: MapPin },
  { to: '/m/more', label: 'More', icon: List },
];

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-bg">
      <div className="flex-1 overflow-y-auto pb-[calc(70px+env(safe-area-inset-bottom))]">{children}</div>

      <nav
        className="fixed inset-x-0 bottom-0 flex items-center justify-around border-t border-black/10 bg-sidebar pt-3"
        style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}
      >
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[10px] font-semibold ${isActive ? 'text-accent' : 'text-text-muted'}`
            }
          >
            <Icon size={19} weight="duotone" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
