import { useState, type FormEvent } from 'react';
import { Button } from './Button';
import { useInviteMember } from '../hooks/useData';

const inputClass =
  'rounded-md border border-black/12 bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-accent';

export function InviteMemberForm({ onDone }: { onDone: () => void }) {
  const invite = useInviteMember();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await invite.mutateAsync({ email, name, role });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invite');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-sm">
      <label className="flex flex-col gap-1.5">
        Name
        <input required className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1.5">
        Email
        <input required type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1.5">
        Role
        <input required placeholder="e.g. Installer" className={inputClass} value={role} onChange={(e) => setRole(e.target.value)} />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <Button variant="primary" type="submit" disabled={invite.isPending} className="mt-2 justify-center">
        {invite.isPending ? 'Sending invite…' : 'Send invite'}
      </Button>
    </form>
  );
}
