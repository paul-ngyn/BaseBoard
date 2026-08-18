import { useEffect, useMemo, useState } from 'react';
import { MagnifyingGlass, Trash, DotsSixVertical, Archive, ArrowCounterClockwise, CaretDown, CaretRight } from '@phosphor-icons/react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { NewProjectForm } from '../components/NewProjectForm';
import { StageSelect } from '../components/StageSelect';
import { ProjectPeopleCell } from '../components/ProjectPeopleCell';
import { ProjectDateCell } from '../components/ProjectDateCell';
import { EditableField } from '../components/EditableField';
import { useDeleteProject, useProjects, useReorderProjects, useStages, useUpdateProjectField, type ProjectWithMembers } from '../hooks/useData';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { getErrorMessage } from '../lib/errors';
import type { Project, Stage } from '../types/database';

// Hold-and-drag: a short delay before the drag activates, so taps on
// buttons/inputs inside the card/row don't get mistaken for a drag.
function useHoldSensors() {
  return useSensors(useSensor(PointerSensor, { activationConstraint: { delay: 200, tolerance: 6 } }));
}

function DragHandle(props: Record<string, unknown>) {
  return (
    <span
      {...props}
      className="flex-none cursor-grab touch-none text-text-muted select-none active:cursor-grabbing"
      aria-label="Drag to reorder"
    >
      <DotsSixVertical size={16} weight="bold" />
    </span>
  );
}

interface RowProps {
  p: ProjectWithMembers;
  stage: Stage | undefined;
  stages: Stage[];
  saveField: (id: string, key: keyof Project, value: string) => void;
  onDelete: (id: string, address: string) => void;
  onArchive: (id: string) => void;
}

function ProjectCard({ p, stage, stages, saveField, onDelete, onArchive }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
      className="relative rounded-[10px] border border-black/8 bg-surface p-3.5"
    >
      <div style={{ borderLeft: `4px solid ${stage?.bg_color ?? '#c39a5a'}`, paddingLeft: 10 }}>
        <div className="flex items-start gap-2">
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
            onClick={() => onArchive(p.id)}
            aria-label={`Archive ${p.address}`}
            title="Archive"
            className="flex-none cursor-pointer rounded border-none bg-transparent p-1 text-text-muted hover:text-accent"
          >
            <Archive size={15} />
          </button>
          <button
            onClick={() => onDelete(p.id, p.address)}
            aria-label={`Delete ${p.address}`}
            className="flex-none cursor-pointer rounded border-none bg-transparent p-1 text-text-muted hover:text-red-700"
          >
            <Trash size={15} />
          </button>
        </div>
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
          <EditableField value={p.species} onSave={(v) => saveField(p.id, 'species', v)} placeholder="—" className="min-w-0" />
        </div>
      </div>

      <div className="mt-2 flex justify-end">
        <DragHandle {...attributes} {...listeners} />
      </div>
    </div>
  );
}

function ProjectRow({ p, stage, stages, saveField, onDelete, onArchive }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
      className="border-b border-black/10"
    >
      <td className="py-3 pr-3 pl-2" style={{ borderLeft: `4px solid ${stage?.bg_color ?? '#c39a5a'}` }}>
        <div className="flex items-start gap-1.5">
          <DragHandle {...attributes} {...listeners} />
          <div className="min-w-0 flex-1">
            <EditableField value={p.address} onSave={(v) => saveField(p.id, 'address', v)} className="text-sm leading-tight font-semibold" />
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
        </div>
      </td>
      <td className="px-3 py-3">{stage ? <StageSelect projectId={p.id} currentStageId={p.stage_id} stages={stages} /> : null}</td>
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
      <td className="py-3 pl-3 text-right whitespace-nowrap">
        <button
          onClick={() => onArchive(p.id)}
          aria-label={`Archive ${p.address}`}
          title="Archive"
          className="cursor-pointer rounded border-none bg-transparent p-1 text-text-muted hover:text-accent"
        >
          <Archive size={15} />
        </button>
        <button
          onClick={() => onDelete(p.id, p.address)}
          aria-label={`Delete ${p.address}`}
          className="cursor-pointer rounded border-none bg-transparent p-1 text-text-muted hover:text-red-700"
        >
          <Trash size={15} />
        </button>
      </td>
    </tr>
  );
}

export function Projects() {
  const { data: projects = [], isLoading } = useProjects();
  const { data: stages = [] } = useStages();
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [ordered, setOrdered] = useState<ProjectWithMembers[]>([]);
  const [archivedOpen, setArchivedOpen] = useState(false);
  const deleteProject = useDeleteProject();
  const updateField = useUpdateProjectField();
  const reorderProjects = useReorderProjects();
  const sensors = useHoldSensors();
  const isDesktop = useIsDesktop();

  // Merge fresh data in without clobbering the locally-established drag
  // order: every field-save and realtime tick refetches `projects`, and
  // resetting straight to server order each time fought with in-flight
  // drags (a reorder could get silently undone by the next refetch until a
  // hard reload). Keep the current order, swap in updated fields per id,
  // append genuinely new projects, drop deleted ones.
  useEffect(() => {
    setOrdered((prev) => {
      if (prev.length === 0) return projects;
      const byId = new Map(projects.map((p) => [p.id, p]));
      const merged = prev.filter((p) => byId.has(p.id)).map((p) => byId.get(p.id)!);
      const knownIds = new Set(prev.map((p) => p.id));
      const additions = projects.filter((p) => !knownIds.has(p.id));
      return [...merged, ...additions];
    });
  }, [projects]);

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

  function handleArchive(id: string) {
    updateField.mutate({ id, archived: true });
  }

  function handleUnarchive(id: string) {
    updateField.mutate({ id, archived: false });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((p) => p.id === active.id);
    const newIndex = ordered.findIndex((p) => p.id === over.id);
    const next = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(next);
    reorderProjects.mutate(next.map((p, i) => ({ id: p.id, position: i + 1 })));
  }

  const doneNames = useMemo(() => new Set(stages.filter((s) => s.is_done).map((s) => s.id)), [stages]);
  const stageById = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages]);

  const notArchived = ordered.filter((p) => !p.archived);
  const archivedProjects = ordered.filter((p) => p.archived);
  const activeCount = notArchived.filter((p) => !doneNames.has(p.stage_id)).length;

  const searching = search.trim().length > 0;
  function matchesSearch(p: ProjectWithMembers) {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.address.toLowerCase().includes(q) || p.client_name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q);
  }
  const filtered = notArchived.filter(matchesSearch);
  const filteredArchived = archivedProjects.filter(matchesSearch);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 px-4 pt-[26px] pb-3 lg:px-[30px]">
        <div>
          <h2 className="m-0 text-[29px]">Projects</h2>
          <p className="mt-1 mb-0 text-[13px] text-text-secondary">
            {activeCount} active jobs {!searching && <span className="text-text-muted">· hold and drag to reorder</span>}
          </p>
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

      {/* Mounting only the layout that's actually visible (not both, CSS-hidden)
          — two useSortable() registrations for the same id in one context
          broke drag after the first use. */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={searching ? undefined : handleDragEnd}>
        <SortableContext items={filtered.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {!isDesktop && (
            <div className="px-4 pb-[30px]">
              <div className="flex flex-col gap-3">
                {filtered.map((p) => (
                  <ProjectCard
                    key={p.id}
                    p={p}
                    stage={stageById.get(p.stage_id)}
                    stages={stages}
                    saveField={saveField}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                  />
                ))}
              </div>
            </div>
          )}

          {isDesktop && (
          <div className="overflow-x-auto px-[30px] pb-[30px]">
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
                {filtered.map((p) => (
                  <ProjectRow
                    key={p.id}
                    p={p}
                    stage={stageById.get(p.stage_id)}
                    stages={stages}
                    saveField={saveField}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                  />
                ))}
              </tbody>
            </table>
          </div>
          )}
        </SortableContext>
      </DndContext>

      {archivedProjects.length > 0 && (
        <div className="px-4 pb-[30px] lg:px-[30px]">
          <button
            onClick={() => setArchivedOpen((v) => !v)}
            className="flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-[13px] font-semibold text-text-secondary hover:text-accent"
          >
            {archivedOpen ? <CaretDown size={13} weight="bold" /> : <CaretRight size={13} weight="bold" />}
            Archived ({archivedProjects.length})
          </button>

          {archivedOpen && (
            <div className="mt-3 flex flex-col gap-2">
              {filteredArchived.map((p) => {
                const stage = stageById.get(p.stage_id);
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-[10px] border border-black/8 bg-surface p-3 opacity-80"
                    style={{ borderLeft: `4px solid ${stage?.bg_color ?? '#c39a5a'}` }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{p.address}</div>
                      <div className="truncate text-xs text-text-secondary-alt">
                        {p.city} · {p.client_name}
                      </div>
                    </div>
                    {stage && (
                      <span
                        className="hidden flex-none rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex"
                        style={{ background: stage.bg_color, color: stage.fg_color }}
                      >
                        {stage.name}
                      </span>
                    )}
                    <button
                      onClick={() => handleUnarchive(p.id)}
                      aria-label={`Restore ${p.address}`}
                      title="Restore"
                      className="flex-none cursor-pointer rounded border-none bg-transparent p-1 text-text-muted hover:text-accent"
                    >
                      <ArrowCounterClockwise size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.address)}
                      aria-label={`Delete ${p.address}`}
                      className="flex-none cursor-pointer rounded border-none bg-transparent p-1 text-text-muted hover:text-red-700"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showNew && (
        <Modal title="New project" onClose={() => setShowNew(false)}>
          <NewProjectForm onDone={() => setShowNew(false)} />
        </Modal>
      )}
    </div>
  );
}
