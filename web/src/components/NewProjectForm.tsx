import { useState, type FormEvent } from 'react';
import { Button } from './Button';
import { useCreateProject, useCrews, useStages } from '../hooks/useData';

const inputClass =
  'rounded-md border border-black/12 bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-accent';

export function NewProjectForm({ onDone }: { onDone: () => void }) {
  const { data: stages = [] } = useStages();
  const { data: crews = [] } = useCrews();
  const createProject = useCreateProject();

  const [form, setForm] = useState({
    address: '',
    city: '',
    client_name: '',
    sqft: '',
    species: '',
    crew_id: '',
    budget: '',
    stage_id: '',
  });

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
      sqft: Number(form.sqft) || 0,
      species: form.species,
      crew_id: form.crew_id || null,
      budget: Number(form.budget) || 0,
      stage_id: stageId,
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
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1.5">
          Sq ft
          <input type="number" min="0" className={inputClass} value={form.sqft} onChange={(e) => set('sqft', e.target.value)} />
        </label>
        <label className="flex flex-1 flex-col gap-1.5">
          Budget
          <input type="number" min="0" className={inputClass} value={form.budget} onChange={(e) => set('budget', e.target.value)} />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        Species / product
        <input className={inputClass} value={form.species} onChange={(e) => set('species', e.target.value)} />
      </label>
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1.5">
          Crew
          <select className={inputClass} value={form.crew_id} onChange={(e) => set('crew_id', e.target.value)}>
            <option value="">—</option>
            {crews.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1.5">
          Stage
          <select className={inputClass} value={form.stage_id} onChange={(e) => set('stage_id', e.target.value)}>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Button variant="primary" type="submit" disabled={createProject.isPending} className="mt-2 justify-center">
        {createProject.isPending ? 'Creating…' : 'Create project'}
      </Button>
    </form>
  );
}
