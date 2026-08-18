import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Table, SquareHalf, CalendarBlank, MapPin, GearSix } from '@phosphor-icons/react';
import { BrandMark } from './BrandMark';
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

  return (
    <div className="flex min-h-screen bg-bg">
      <div className="flex w-[224px] flex-none flex-col gap-1.5 border-r border-black/10 bg-sidebar px-4 py-[22px]">
        <div className="flex items-center gap-[11px] px-1.5 pb-5">
          <BrandMark />
          <div className="flex flex-col leading-none">
            <span className="font-serif text-[19px] font-semibold tracking-[-0.01em]">Baseboard</span>
            <span className="mt-[3px] text-[10px] tracking-[0.12em] text-text-muted uppercase">Flooring PM</span>
          </div>
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
