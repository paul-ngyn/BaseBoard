import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error);
    else navigate('/projects');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[360px] flex-col gap-4 rounded-xl border border-black/10 bg-bg p-8 shadow-xl"
      >
        <div className="mb-2 flex items-center gap-3">
          <BrandMark />
          <div className="flex flex-col leading-none">
            <span className="font-serif text-[19px] font-semibold">Baseboard</span>
            <span className="mt-[3px] text-[10px] tracking-[0.12em] text-text-muted uppercase">Flooring PM</span>
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-black/12 bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-accent"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-black/12 bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-accent"
          />
        </label>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <Button variant="primary" type="submit" disabled={loading} className="mt-2 justify-center">
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
