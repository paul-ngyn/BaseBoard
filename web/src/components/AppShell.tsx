import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { List, Table, SquareHalf, CalendarBlank, MapPin, GearSix } from '@phosphor-icons/react';
import { Avatar } from './Avatar';
import { useAuth } from '../hooks/useAuth';

const NAV = [
  { to: '/projects', label: 'Projects', icon: Table },
  { to: '/dashboard', label: 'Dashboard', icon: SquareHalf },
  { to: '/schedule', label: 'Schedule', icon: CalendarBlank },
  { to: '/map', label: 'Map', icon: MapPin },
  { to: '/admin', label: 'Admin', icon: GearSix },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { member, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setSidebarOpen(false), [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-bg lg:flex-row">
      {/* Mobile top bar — hidden at lg and up, where the sidebar is always visible. */}
      <div className="flex items-center gap-3 border-b border-black/10 bg-sidebar px-4 py-3 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="cursor-pointer rounded border-none bg-transparent p-1 text-accent"
        >
          <List size={22} weight="bold" />
        </button>
        <span className="font-serif text-base font-semibold">Baseboard</span>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 flex w-[224px] flex-none -translate-x-full flex-col gap-1.5 border-r border-black/10 bg-sidebar px-4 py-[22px] transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : ''
        }`}
      >
        <div className="flex flex-col px-1.5 pb-5 leading-none">
          <span className="font-serif text-[19px] font-semibold tracking-[-0.01em]">Baseboard</span>
          <span className="mt-[3px] text-[10px] tracking-[0.12em] text-text-muted uppercase">Flooring PM</span>
        </div>

        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex w-full items-center gap-[11px] rounded-[7px] px-[13px] py-2.5 text-left text-sm ${
                isActive ? 'bg-accent font-semibold text-bg' : 'bg-transparent text-text hover:bg-black/5'
              }`
            }
          >
            <Icon size={16} weight="duotone" />
            {label}
          </NavLink>
        ))}

        <div className="mt-auto flex items-center gap-2.5 border-t border-black/10 px-1.5 pt-4">
          <Avatar name={member?.name ?? '…'} />
          <div className="leading-tight">
            <div className="text-[13px] font-semibold">{member?.name ?? 'Loading…'}</div>
            <button onClick={signOut} className="cursor-pointer border-none bg-transparent p-0 text-[11px] text-text-muted hover:text-accent">
              {member?.role ?? ''} · Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="min-w-0 flex-1 bg-bg">{children}</div>
    </div>
  );
}
