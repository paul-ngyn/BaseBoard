import { useState, type FormEvent } from 'react';
import { Button } from './Button';
import { PeoplePicker } from './PeoplePicker';
import { useCreateProject, useStages, useTeam } from '../hooks/useData';

const inputClass =
  'rounded-md border border-black/12 bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-accent';

export function NewProjectForm({ onDone }: { onDone: () => void }) {
  const { data: stages = [] } = useStages();
  const { data: team = [] } = useTeam();
  const createProject = useCreateProject();

  const [form, setForm] = useState({
    address: '',
    city: '',
    client_name: '',
    client_contact: '',
    sqft: '',
    species: '',
    stage_id: '',
  });
  const [memberIds, setMemberIds] = useState<string[]>([]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const stageId = form.stage_id || stages[0]?.id;
    if (!stageId) return;
    await createProject.mutateAsync({
      address: form.address,
      city: form.city,
      client_name: form.client_name,
      client_contact: form.client_contact.trim() || null,
      sqft: Number(form.sqft) || 0,
      species: form.species,
      stage_id: stageId,
      memberIds,
    });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-sm">
      <label className="flex flex-col gap-1.5">
        Address
        <input required className={inputClass} value={form.address} onChange={(e) => set('address', e.target.value)} />
      </label>
      <label className="flex flex-col gap-1.5">
        City
        <input required className={inputClass} value={form.city} onChange={(e) => set('city', e.target.value)} />
      </label>
      <label className="flex flex-col gap-1.5">
        Client name
        <input required className={inputClass} value={form.client_name} onChange={(e) => set('client_name', e.target.value)} />
      </label>
      <label className="flex flex-col gap-1.5">
        Client contact <span className="text-text-muted">(optional)</span>
        <input
          placeholder="Phone or email"
          className={inputClass}
          value={form.client_contact}
          onChange={(e) => set('client_contact', e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        Sq ft
        <input type="number" min="0" className={inputClass} value={form.sqft} onChange={(e) => set('sqft', e.target.value)} />
      </label>
      <label className="flex flex-col gap-1.5">
        Species / product
        <input className={inputClass} value={form.species} onChange={(e) => set('species', e.target.value)} />
      </label>
      <label className="flex flex-col gap-1.5">
        Stage
        <select className={inputClass} value={form.stage_id} onChange={(e) => set('stage_id', e.target.value)}>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        People on this job
        <PeoplePicker people={team} selected={memberIds} onChange={setMemberIds} />
      </label>

      <Button variant="primary" type="submit" disabled={createProject.isPending} className="mt-2 justify-center">
        {createProject.isPending ? 'Creating…' : 'Create project'}
      </Button>
    </form>
  );
}
