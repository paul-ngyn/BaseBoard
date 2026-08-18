import { useMemo, useState } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { NewProjectForm } from '../components/NewProjectForm';
import { StageSelect } from '../components/StageSelect';
import { useProjects, useStages } from '../hooks/useData';
import { money, dateRange } from '../lib/format';

export function Projects() {
  const { data: projects = [], isLoading } = useProjects();
  const { data: stages = [] } = useStages();
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);

  const doneNames = useMemo(() => new Set(stages.filter((s) => s.is_done).map((s) => s.id)), [stages]);
  const stageById = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages]);

  const activeCount = projects.filter((p) => !doneNames.has(p.stage_id)).length;
  const pipeline = projects.filter((p) => !doneNames.has(p.stage_id)).reduce((a, p) => a + Number(p.budget), 0);

  const filtered = projects.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.address.toLowerCase().includes(q) || p.client_name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-end justify-between gap-4 px-[30px] pt-[26px] pb-3">
        <div>
          <h2 className="m-0 text-[29px]">Projects</h2>
          <p className="mt-1 mb-0 text-[13px] text-text-secondary">
            {activeCount} active jobs · {money(pipeline)} in pipeline
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex w-[210px] items-center gap-1.5 rounded-md border border-black/12 bg-surface px-3 py-1.5 text-sm text-text-secondary">
            <MagnifyingGlass size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search address or client…"
              className="w-full border-none bg-transparent text-[13px] text-text outline-none placeholder:text-text-secondary"
            />
          </div>
          <Button variant="secondary" className="text-[13px]">
            Filter
          </Button>
          <Button variant="primary" className="text-[13px]" onClick={() => setShowNew(true)}>
            + New project
          </Button>
        </div>
      </div>

      <div className="overflow-hidden px-[30px] pb-[30px]">
        <table className="w-full table-fixed border-collapse text-left">
          <colgroup>
            <col style={{ width: '30%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '16%' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-black/10 text-[11px] tracking-[0.06em] text-text-muted uppercase">
              <th className="py-2.5 font-semibold">Project</th>
              <th className="py-2.5 text-right font-semibold">Sq Ft</th>
              <th className="py-2.5 font-semibold">Species / product</th>
              <th className="py-2.5 font-semibold">Crew</th>
              <th className="py-2.5 font-semibold">Dates</th>
              <th className="py-2.5 text-right font-semibold">Budget</th>
              <th className="py-2.5 font-semibold">Stage</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-sm text-text-muted">
                  Loading projects…
                </td>
              </tr>
            )}
            {filtered.map((p) => {
              const stage = stageById.get(p.stage_id);
              return (
                <tr key={p.id} className="border-b border-black/10">
                  <td className="py-3 pl-3.5" style={{ borderLeft: `4px solid ${stage?.bg_color ?? '#c39a5a'}` }}>
                    <div className="text-sm leading-tight font-semibold">{p.address}</div>
                    <div className="mt-0.5 text-xs text-text-secondary-alt">
                      {p.city} · {p.client_name}
                    </div>
                  </td>
                  <td className="tabular-nums py-3 text-right text-[13px] text-[#4a3d30]">{p.sqft.toLocaleString('en-US')}</td>
                  <td className="py-3 text-[13px] text-[#4a3d30]">{p.species}</td>
                  <td className="py-3 text-[13px] text-[#4a3d30]">{p.crews?.name ?? '—'}</td>
                  <td className="tabular-nums py-3 text-xs text-[#4a3d30]">{dateRange(p.start_date, p.end_date)}</td>
                  <td className="tabular-nums py-3 text-right text-[13px] font-semibold text-[#4a3d30]">{money(p.budget)}</td>
                  <td className="py-3">
                    {stage ? <StageSelect projectId={p.id} currentStageId={p.stage_id} stages={stages} /> : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showNew && (
        <Modal title="New project" onClose={() => setShowNew(false)}>
          <NewProjectForm onDone={() => setShowNew(false)} />
        </Modal>
      )}
    </div>
  );
}
