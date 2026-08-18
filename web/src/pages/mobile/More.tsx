import { SignOut } from '@phosphor-icons/react';
import { useAuth } from '../../hooks/useAuth';

export function More() {
  const { member, signOut } = useAuth();

  return (
    <div className="flex flex-col gap-3.5 p-4">
      <div className="rounded-[10px] border border-black/8 bg-surface p-4">
        <div className="text-base font-semibold">{member?.name ?? 'Loading…'}</div>
        <div className="mt-0.5 text-xs text-text-muted">
          {member?.role ?? ''} {member?.access_level ? `· ${member.access_level}` : ''}
        </div>
      </div>

      <button
        onClick={signOut}
        className="flex items-center justify-center gap-2 rounded-[10px] border border-black/12 bg-transparent py-3 text-sm font-semibold text-accent"
      >
        <SignOut size={16} weight="duotone" />
        Sign out
      </button>
    </div>
  );
}
