import { useEffect, useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from '@phosphor-icons/react';
import type { Stage } from '../types/database';
import { useDeleteStage, useReorderStages, useUpdateStage } from '../hooks/useData';
import { readableTextColor } from '../lib/color';
import { getErrorMessage } from '../lib/errors';

function SortableStageRow({ stage, index, editing }: { stage: Stage; index: number; editing: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stage.id });
  const updateStage = useUpdateStage();
  const deleteStage = useDeleteStage();
  const [name, setName] = useState(stage.name);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => setName(stage.name), [stage.name]);

  function commitName() {
    const trimmed = name.trim();
    if (trimmed && trimmed !== stage.name) {
      updateStage.mutate({ id: stage.id, name: trimmed });
    } else {
      setName(stage.name);
    }
  }

  function handleColorChange(bg: string) {
    updateStage.mutate({ id: stage.id, bg_color: bg, fg_color: readableTextColor(bg) });
  }

  async function handleDelete() {
    setDeleteError(null);
    try {
      await deleteStage.mutateAsync(stage.id);
    } catch (err) {
      setDeleteError(getErrorMessage(err, 'Could not delete stage'));
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
      className="flex flex-col gap-1 border-b border-black/7 py-1.5"
    >
      <div className="flex items-center gap-2.5">
        <span className="tabular-nums w-[22px] text-right text-[11px] text-text-muted-alt">{String(index + 1).padStart(2, '0')}</span>

        {editing ? (
          <input
            type="color"
            value={stage.bg_color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="h-[16px] w-[16px] flex-none cursor-pointer rounded-[3px] border-none p-0"
            aria-label={`${stage.name} color`}
          />
        ) : (
          <span className="h-[13px] w-[13px] flex-none rounded-[3px]" style={{ background: stage.bg_color }} />
        )}

        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
            className="flex-1 rounded border border-black/12 bg-bg px-2 py-1 text-[13px] text-[#4a3d30] outline-none focus-visible:outline-2 focus-visible:outline-accent"
          />
        ) : (
          <span className="flex-1 text-[13px] text-[#4a3d30]">{stage.name}</span>
        )}

        {editing ? (
          <button
            onClick={handleDelete}
            disabled={deleteStage.isPending}
            aria-label={`Delete ${stage.name}`}
            className="flex-none cursor-pointer rounded border-none bg-transparent p-1 text-text-muted hover:text-red-700"
          >
            <X size={14} weight="bold" />
          </button>
        ) : (
          <span {...attributes} {...listeners} className="cursor-grab text-sm text-[#c4b498] select-none" aria-label="Drag to reorder">
            ⋮⋮
          </span>
        )}
      </div>
      {deleteError && <p className="m-0 ml-[34px] text-xs text-red-700">{deleteError}</p>}
    </div>
  );
}

export function StageListEditor({ stages, editing }: { stages: Stage[]; editing: boolean }) {
  const [items, setItems] = useState(stages);
  const reorder = useReorderStages();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => setItems(stages), [stages]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((s) => s.id === active.id);
    const newIndex = items.findIndex((s) => s.id === over.id);
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    reorder.mutate(next.map((s, i) => ({ id: s.id, position: i + 1 })));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-0.5">
          {items.map((s, i) => (
            <SortableStageRow key={s.id} stage={s} index={i} editing={editing} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
