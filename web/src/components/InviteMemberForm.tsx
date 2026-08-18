import { useState, type FormEvent } from 'react';
import { Button } from './Button';
import { useAddRosterMember, useInviteMember } from '../hooks/useData';
import { getErrorMessage } from '../lib/errors';

const inputClass =
  'rounded-md border border-black/12 bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-accent';

const ACCESS_LEVELS = ['Field only', 'Standard', 'Full'];

interface InviteMemberFormProps {
  onDone: () => void;
  /** Pre-fill from an existing roster row (promoting them to a real login). */
  initial?: { name: string; email: string | null; role: string | null };
  /** Promoting an existing roster row only makes sense as an email invite. */
  promoteOnly?: boolean;
}

export function InviteMemberForm({ onDone, initial, promoteOnly }: InviteMemberFormProps) {
  const invite = useInviteMember();
  const addRoster = useAddRosterMember();

  const [mode, setMode] = useState<'email' | 'direct'>(promoteOnly ? 'email' : 'direct');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [accessLevel, setAccessLevel] = useState('Field only');
  const [error, setError] = useState<string | null>(null);

  const pending = invite.isPending || addRoster.isPending;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'email') {
        await invite.mutateAsync({ email, name, role });
      } else {
        await addRoster.mutateAsync({
          name,
          email: email.trim() || null,
          role: role.trim() || null,
          access_level: accessLevel,
        });
      }
      onDone();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add team member'));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-sm" autoComplete="off">
      {!promoteOnly && (
        <div className="flex gap-1 rounded-md bg-surface p-1">
          <button
            type="button"
            onClick={() => setMode('email')}
            className={`flex-1 rounded px-3 py-1.5 text-xs font-semibold ${mode === 'email' ? 'bg-accent text-bg' : 'text-text-secondary'}`}
          >
            Email invite
          </button>
          <button
            type="button"
            onClick={() => setMode('direct')}
            className={`flex-1 rounded px-3 py-1.5 text-xs font-semibold ${mode === 'direct' ? 'bg-accent text-bg' : 'text-text-secondary'}`}
          >
            Add directly
          </button>
        </div>
      )}
      <p className="m-0 text-xs text-text-muted">
        {mode === 'email'
          ? 'They get an email with a link to set their own password and sign in.'
          : 'Just a name is enough — adds them to the roster so you can assign them to jobs right away. No login, no email needed. Add those later (or use "Invite") only if they need to sign in themselves.'}
      </p>

      <label className="flex flex-col gap-1.5">
        Name
        <input required autoFocus autoComplete="off" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1.5">
        Email {mode === 'direct' && <span className="text-text-muted">(optional)</span>}
        <input
          required={mode === 'email'}
          type="email"
          autoComplete="off"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        Role <span className="text-text-muted">(optional)</span>
        <input
          placeholder="e.g. Installer"
          autoComplete="off"
          className={inputClass}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </label>

      {!promoteOnly && mode === 'direct' && (
        <label className="flex flex-col gap-1.5">
          Access
          <select className={inputClass} value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)}>
            {ACCESS_LEVELS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}
      <Button variant="primary" type="submit" disabled={pending} className="mt-2 justify-center">
        {pending ? 'Adding…' : mode === 'email' ? 'Send invite' : 'Add to roster'}
      </Button>
    </form>
  );
}
