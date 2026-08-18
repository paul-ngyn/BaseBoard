import { useMemo, useState } from 'react';
import { MagnifyingGlass, Trash } from '@phosphor-icons/react';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { NewProjectForm } from '../components/NewProjectForm';
import { StageSelect } from '../components/StageSelect';
import { ProjectPeopleCell } from '../components/ProjectPeopleCell';
import { ProjectDateCell } from '../components/ProjectDateCell';
import { EditableField } from '../components/EditableField';
import { useDeleteProject, useProjects, useStages, useUpdateProjectField } from '../hooks/useData';
import { getErrorMessage } from '../lib/errors';
import type { Project } from '../types/database';

export function Projects() {
  const { data: projects = [], isLoading } = useProjects();
  const { data: stages = [] } = useStages();
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const deleteProject = useDeleteProject();
  const updateField = useUpdateProjectField();

  function handleDelete(id: string, address: string) {
    if (!window.confirm(`Delete "${address}"? This can't be undone — its schedule events go with it.`)) return;
    deleteProject.mutate(id, {
      onError: (err) => window.alert(getErrorMessage(err, 'Failed to delete project')),
    });
  }

  function saveField(id: string, key: keyof Project, value: string) {
    const parsed = key === 'sqft' ? Number(value) || 0 : key === 'client_contact' ? value.trim() || null : value;
    updateField.mutate({ id, [key]: parsed });
  }

  const doneNames = useMemo(() => new Set(stages.filter((s) => s.is_done).map((s) => s.id)), [stages]);
  const stageById = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages]);

  const activeCount = projects.filter((p) => !doneNames.has(p.stage_id)).length;

  const filtered = projects.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.address.toLowerCase().includes(q) || p.client_name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 px-4 pt-[26px] pb-3 lg:px-[30px]">
        <div>
          <h2 className="m-0 text-[29px]">Projects</h2>
          <p className="mt-1 mb-0 text-[13px] text-text-secondary">{activeCount} active jobs</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
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

      {isLoading && <p className="px-4 py-6 text-center text-sm text-text-muted lg:px-[30px]">Loading projects…</p>}

      {/* Mobile / tablet: cards */}
      <div className="flex flex-col gap-3 px-4 pb-[30px] lg:hidden">
        {filtered.map((p) => {
          const stage = stageById.get(p.stage_id);
          return (
            <div
              key={p.id}
              className="rounded-[10px] border border-black/8 bg-surface p-3.5"
              style={{ borderLeft: `4px solid ${stage?.bg_color ?? '#c39a5a'}` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <EditableField
                    value={p.address}
                    onSave={(v) => saveField(p.id, 'address', v)}
                    className="text-sm leading-tight font-semibold"
                  />
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs text-text-secondary-alt">
                    <EditableField value={p.city} onSave={(v) => saveField(p.id, 'city', v)} />
                    <span>·</span>
                    <EditableField value={p.client_name} onSave={(v) => saveField(p.id, 'client_name', v)} />
                    <span>·</span>
                    <EditableField
                      value={p.client_contact ?? ''}
                      onSave={(v) => saveField(p.id, 'client_contact', v)}
                      placeholder="add contact"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(p.id, p.address)}
                  aria-label={`Delete ${p.address}`}
                  className="flex-none cursor-pointer rounded border-none bg-transparent p-1 text-text-muted hover:text-red-700"
                >
                  <Trash size={15} />
                </button>
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-2">
                {stage ? <StageSelect projectId={p.id} currentStageId={p.stage_id} stages={stages} /> : null}
                <ProjectDateCell projectId={p.id} date={p.start_date} time={p.next_time} />
              </div>

              <div className="mt-2.5 flex items-center gap-1.5 text-[13px]">
                <span className="flex-none font-semibold text-text-muted">Crew:</span>
                <ProjectPeopleCell projectId={p.id} people={p.project_members.map((pm) => pm.team_members)} />
              </div>

              <div className="mt-2 flex flex-col gap-1.5 border-t border-black/8 pt-2.5 text-[13px] text-[#4a3d30]">
                <div className="flex items-center gap-1.5">
                  <span className="flex-none font-semibold text-text-muted">Sqft:</span>
                  <EditableField
                    value={String(p.sqft || '')}
                    onSave={(v) => saveField(p.id, 'sqft', v)}
                    type="number"
                    placeholder="—"
                    className="tabular-nums"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex-none font-semibold text-text-muted">Species / Materials:</span>
                  <EditableField
                    value={p.species}
                    onSave={(v) => saveField(p.id, 'species', v)}
                    placeholder="—"
                    className="min-w-0"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto px-[30px] pb-[30px] lg:block">
        <table className="w-full min-w-[720px] table-fixed border-collapse text-left">
          <colgroup>
            <col style={{ width: '26%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '4%' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-black/10 text-[11px] tracking-[0.06em] text-text-muted uppercase">
              <th className="py-2.5 pr-3 font-semibold">Project</th>
              <th className="py-2.5 px-3 font-semibold">Stage</th>
              <th className="py-2.5 px-3 font-semibold">Next date</th>
              <th className="py-2.5 px-3 font-semibold">Crew</th>
              <th className="py-2.5 px-3 text-right font-semibold">Sq Ft</th>
              <th className="py-2.5 px-3 font-semibold">Species / Materials</th>
              <th className="py-2.5 pl-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const stage = stageById.get(p.stage_id);
              return (
                <tr key={p.id} className="border-b border-black/10">
                  <td className="py-3 pr-3 pl-3.5" style={{ borderLeft: `4px solid ${stage?.bg_color ?? '#c39a5a'}` }}>
                    <EditableField
                      value={p.address}
                      onSave={(v) => saveField(p.id, 'address', v)}
                      className="text-sm leading-tight font-semibold"
                    />
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs text-text-secondary-alt">
                      <EditableField value={p.city} onSave={(v) => saveField(p.id, 'city', v)} />
                      <span>·</span>
                      <EditableField value={p.client_name} onSave={(v) => saveField(p.id, 'client_name', v)} />
                      <span>·</span>
                      <EditableField
                        value={p.client_contact ?? ''}
                        onSave={(v) => saveField(p.id, 'client_contact', v)}
                        placeholder="add contact"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {stage ? <StageSelect projectId={p.id} currentStageId={p.stage_id} stages={stages} /> : null}
                  </td>
                  <td className="px-3 py-3">
                    <ProjectDateCell projectId={p.id} date={p.start_date} time={p.next_time} />
                  </td>
                  <td className="px-3 py-3">
                    <ProjectPeopleCell projectId={p.id} people={p.project_members.map((pm) => pm.team_members)} />
                  </td>
                  <td className="px-3 py-3 text-right text-[13px] text-[#4a3d30]">
                    <EditableField
                      value={String(p.sqft || '')}
                      onSave={(v) => saveField(p.id, 'sqft', v)}
                      type="number"
                      placeholder="—"
                      className="tabular-nums justify-end"
                    />
                  </td>
                  <td className="px-3 py-3 text-[13px] text-[#4a3d30]">
                    <EditableField value={p.species} onSave={(v) => saveField(p.id, 'species', v)} />
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <button
                      onClick={() => handleDelete(p.id, p.address)}
                      aria-label={`Delete ${p.address}`}
                      className="cursor-pointer rounded border-none bg-transparent p-1 text-text-muted hover:text-red-700"
                    >
                      <Trash size={15} />
                    </button>
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
